package service

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatCompletionRequest struct {
	Model       string        `json:"model"`
	Messages    []ChatMessage `json:"messages"`
	Stream      bool          `json:"stream"`
	Temperature float64       `json:"temperature"`
	MaxTokens   int           `json:"max_tokens,omitempty"`
}

type StreamChoiceDelta struct {
	Content string `json:"content"`
}

type StreamChoice struct {
	Delta StreamChoiceDelta `json:"delta"`
}

type StreamResponseChunk struct {
	Choices []StreamChoice `json:"choices"`
}

type RateLimitError struct {
	Message string
}

func (e *RateLimitError) Error() string {
	return e.Message
}

type GroqClient struct {
	apiKey     string
	model      string
	httpClient *http.Client
}

func NewGroqClient(apiKey string, model string) *GroqClient {
	return &GroqClient{
		apiKey: apiKey,
		model:  model,
		httpClient: &http.Client{
			Timeout: 120 * time.Second,
		},
	}
}

func (c *GroqClient) StreamCompletion(ctx context.Context, messages []ChatMessage, onToken func(string) error) error {
	if c.apiKey == "" {
		return errors.New("groq api key is missing")
	}

	reqBody := ChatCompletionRequest{
		Model:       c.model,
		Messages:    messages,
		Stream:      true,
		Temperature: 0.6,
		MaxTokens:   2048,
	}

	jsonBytes, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.groq.com/openai/v1/chat/completions", bytes.NewReader(jsonBytes))
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}

	httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "text/event-stream")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return fmt.Errorf("execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBytes, _ := io.ReadAll(resp.Body)
		if resp.StatusCode == http.StatusTooManyRequests || strings.Contains(string(respBytes), "rate_limit") || strings.Contains(string(respBytes), "429") {
			return &RateLimitError{Message: "taxa de processamento excedida"}
		}
		return fmt.Errorf("groq api error %d: %s", resp.StatusCode, string(respBytes))
	}

	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		trimmed := strings.TrimSpace(line)

		if trimmed == "" {
			continue
		}

		if strings.HasPrefix(trimmed, "data: ") {
			payload := strings.TrimPrefix(trimmed, "data: ")
			if payload == "[DONE]" {
				break
			}

			var chunk StreamResponseChunk
			if err := json.Unmarshal([]byte(payload), &chunk); err != nil {
				continue
			}

			if len(chunk.Choices) > 0 && chunk.Choices[0].Delta.Content != "" {
				if err := onToken(chunk.Choices[0].Delta.Content); err != nil {
					return err
				}
			}
		}
	}

	if err := scanner.Err(); err != nil && !errors.Is(err, context.Canceled) {
		return fmt.Errorf("scan stream: %w", err)
	}

	return nil
}
