package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"backend/internal/service"
)

type ChatStreamRequest struct {
	Prompt   string                `json:"prompt"`
	History  []service.ChatMessage `json:"history"`
	SystemID string                `json:"systemId,omitempty"`
}

type ChatStreamResponseToken struct {
	Text string `json:"text"`
}

type ChatHandler struct {
	groqClient     *service.GroqClient
	contextBuilder *service.AudioContextBuilder
}

func NewChatHandler(groqClient *service.GroqClient, contextBuilder *service.AudioContextBuilder) *ChatHandler {
	return &ChatHandler{
		groqClient:     groqClient,
		contextBuilder: contextBuilder,
	}
}

func (h *ChatHandler) StreamHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", http.StatusInternalServerError)
		return
	}

	var req ChatStreamRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	trimmedPrompt := strings.TrimSpace(req.Prompt)
	if trimmedPrompt == "" {
		http.Error(w, "prompt cannot be empty", http.StatusBadRequest)
		return
	}

	if len([]rune(req.Prompt)) > 1000 {
		http.Error(w, "prompt exceeds maximum length of 1000 characters", http.StatusBadRequest)
		return
	}

	messages := h.contextBuilder.BuildConversation(req.Prompt, req.History)

	ctx := r.Context()

	var flusherStarted bool
	err := h.groqClient.StreamCompletion(ctx, messages, func(token string) error {
		if !flusherStarted {
			w.Header().Set("Content-Type", "text/event-stream")
			w.Header().Set("Cache-Control", "no-cache")
			w.Header().Set("Connection", "keep-alive")
			w.Header().Set("X-Accel-Buffering", "no")
			flusherStarted = true
		}

		payload, err := json.Marshal(ChatStreamResponseToken{Text: token})
		if err != nil {
			return err
		}

		_, err = fmt.Fprintf(w, "data: %s\n\n", string(payload))
		if err != nil {
			return err
		}

		flusher.Flush()
		return nil
	})

	if err != nil {
		var rateLimitErr *service.RateLimitError
		if errors.As(err, &rateLimitErr) {
			if !flusherStarted {
				w.Header().Set("Content-Type", "application/json")
				w.Header().Set("Retry-After", "60")
				w.WriteHeader(http.StatusTooManyRequests)
				_ = json.NewEncoder(w).Encode(map[string]any{
					"code":    429,
					"message": "taxa de processamento excedida",
				})
				return
			}
			errPayload, _ := json.Marshal(map[string]any{"code": 429, "error": "taxa de processamento excedida"})
			fmt.Fprintf(w, "data: %s\n\n", string(errPayload))
			flusher.Flush()
		} else {
			if !flusherStarted {
				w.Header().Set("Content-Type", "text/event-stream")
				w.Header().Set("Cache-Control", "no-cache")
				w.Header().Set("Connection", "keep-alive")
				w.Header().Set("X-Accel-Buffering", "no")
				flusherStarted = true
			}
			errPayload, _ := json.Marshal(map[string]string{"error": err.Error()})
			fmt.Fprintf(w, "data: %s\n\n", string(errPayload))
			flusher.Flush()
		}
	} else if !flusherStarted {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("X-Accel-Buffering", "no")
	}

	fmt.Fprintf(w, "data: [DONE]\n\n")
	flusher.Flush()
}
