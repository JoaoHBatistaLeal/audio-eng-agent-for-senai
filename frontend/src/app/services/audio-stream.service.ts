import { Injectable, signal } from '@angular/core';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class AudioStreamService {
  private readonly apiUrl = 'http://localhost:8080/api/chat/stream';

  readonly messages = signal<ChatMessage[]>([]);
  readonly isStreaming = signal<boolean>(false);
  readonly currentStreamingText = signal<string>('');
  readonly latencyMs = signal<number>(0);
  readonly errorState = signal<string | null>(null);

  async sendMessage(prompt: string): Promise<void> {
    const trimmed = prompt.trim();
    if (!trimmed || this.isStreaming()) {
      return;
    }

    this.errorState.set(null);
    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    const currentHistory = this.messages();
    this.messages.set([...currentHistory, userMessage]);
    this.isStreaming.set(true);
    this.currentStreamingText.set('');

    const startTime = performance.now();
    let firstTokenReceived = false;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          prompt: trimmed,
          history: currentHistory.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok || !response.body) {
        throw new Error(`Falha na resposta do servidor: status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) {
            continue;
          }

          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                this.errorState.set(parsed.error);
                continue;
              }

              if (parsed.text) {
                if (!firstTokenReceived) {
                  this.latencyMs.set(Math.round(performance.now() - startTime));
                  firstTokenReceived = true;
                }
                accumulatedText += parsed.text;
                this.currentStreamingText.set(accumulatedText);
              }
            } catch {
              continue;
            }
          }
        }
      }

      if (accumulatedText.trim()) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: accumulatedText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        this.messages.set([...this.messages(), assistantMessage]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro na comunicacao com o servidor';
      this.errorState.set(message);
    } finally {
      this.isStreaming.set(false);
      this.currentStreamingText.set('');
    }
  }

  clearHistory(): void {
    if (!this.isStreaming()) {
      this.messages.set([]);
      this.errorState.set(null);
      this.latencyMs.set(0);
    }
  }
}
