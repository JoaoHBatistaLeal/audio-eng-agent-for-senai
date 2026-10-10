import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isRateLimitNotice?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

@Injectable({
  providedIn: 'root'
})
export class AudioStreamService {
  get apiUrl(): string {
    const base = environment.apiUrl ? environment.apiUrl.replace(/\/+$/, '') : '';
    return `${base}/api/chat/stream`;
  }
  private readonly storageKey = 'senai_audio_sessions_v1';
  private readonly maxSessions = 10;

  readonly sessions = signal<ChatSession[]>([]);
  readonly currentSessionId = signal<string>('');
  readonly messages = signal<ChatMessage[]>([]);
  readonly isStreaming = signal<boolean>(false);
  readonly currentStreamingText = signal<string>('');
  readonly errorState = signal<string | null>(null);
  readonly rateLimitCooldown = signal<number>(0);
  private cooldownInterval: any = null;

  constructor() {
    this.restoreSessionsFromStorage();
  }

  private restoreSessionsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const validSessions = parsed
            .filter(s => Array.isArray(s.messages) && s.messages.length > 0)
            .slice(0, this.maxSessions);

          if (validSessions.length > 0) {
            this.sessions.set(validSessions);
            this.persistSessions(validSessions);
            this.selectSession(validSessions[0].id);
            return;
          }
        }
      }
    } catch {
      localStorage.removeItem(this.storageKey);
    }

    localStorage.removeItem(this.storageKey);
    this.createEphemeralSession();
  }

  private persistSessions(sessionsToSave?: ChatSession[]): void {
    try {
      const target = sessionsToSave ?? this.sessions();
      const valid = target
        .filter(s => s.messages && s.messages.length > 0)
        .slice(0, this.maxSessions);

      if (valid.length > 0) {
        localStorage.setItem(this.storageKey, JSON.stringify(valid));
      } else {
        localStorage.removeItem(this.storageKey);
      }
    } catch {}
  }

  private createEphemeralSession(): void {
    const newId = 'session_' + Date.now();
    const newSession: ChatSession = {
      id: newId,
      title: 'Nova Sessao',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: []
    };

    this.sessions.set([newSession]);
    this.currentSessionId.set(newId);
    this.messages.set([]);
    this.errorState.set(null);
    this.currentStreamingText.set('');
  }

  startNewSession(): void {
    if (this.isStreaming()) {
      return;
    }

    const currentId = this.currentSessionId();
    const active = this.sessions().find(s => s.id === currentId);
    if (active && active.messages.length === 0) {
      this.messages.set([]);
      this.errorState.set(null);
      this.currentStreamingText.set('');
      return;
    }

    const existingBlank = this.sessions().find(s => s.messages.length === 0);
    if (existingBlank) {
      this.selectSession(existingBlank.id);
      return;
    }

    const newId = 'session_' + Date.now();
    const newSession: ChatSession = {
      id: newId,
      title: 'Nova Sessao',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: []
    };

    const updated = [newSession, ...this.sessions()].slice(0, this.maxSessions);
    this.sessions.set(updated);
    this.currentSessionId.set(newId);
    this.messages.set([]);
    this.errorState.set(null);
    this.currentStreamingText.set('');
  }

  selectSession(sessionId: string): void {
    if (this.isStreaming() || this.currentSessionId() === sessionId) {
      return;
    }

    const target = this.sessions().find(s => s.id === sessionId);
    if (target) {
      this.currentSessionId.set(target.id);
      this.messages.set(target.messages);
      this.errorState.set(null);
      this.currentStreamingText.set('');
    }
  }

  deleteSession(sessionId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.isStreaming()) {
      return;
    }

    const remaining = this.sessions().filter(s => s.id !== sessionId);
    this.sessions.set(remaining);
    this.persistSessions(remaining);

    if (remaining.length === 0) {
      this.createEphemeralSession();
    } else if (this.currentSessionId() === sessionId) {
      this.selectSession(remaining[0].id);
    }
  }

  clearAllHistory(): void {
    if (this.isStreaming()) {
      return;
    }

    localStorage.removeItem(this.storageKey);
    this.createEphemeralSession();
  }

  startRateLimitCooldown(seconds: number = 60): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
    this.rateLimitCooldown.set(seconds);
    this.cooldownInterval = setInterval(() => {
      const remaining = this.rateLimitCooldown() - 1;
      if (remaining <= 0) {
        clearInterval(this.cooldownInterval);
        this.cooldownInterval = null;
        this.rateLimitCooldown.set(0);
      } else {
        this.rateLimitCooldown.set(remaining);
      }
    }, 1000);
  }

  private triggerRateLimitNotice(activeId: string): void {
    this.startRateLimitCooldown(60);
    this.errorState.set(null);
    const notice: ChatMessage = {
      role: 'assistant',
      content: 'TAXA DE PROCESSAMENTO TEMPORARIAMENTE EXCEDIDA: O volume de consultas atingiu o limite de requisições por minuto do motor de inferência. O canal de streaming requer uma pausa de calibragem de 60 segundos antes de processar novas diretrizes acústicas.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isRateLimitNotice: true
    };

    const finalMessages = [...this.messages(), notice];
    this.messages.set(finalMessages);

    const updatedSessions = this.sessions().map(s => {
      if (s.id === activeId) {
        return { ...s, messages: finalMessages };
      }
      return s;
    });
    this.sessions.set(updatedSessions);
    this.persistSessions(updatedSessions);
  }

  async sendMessage(prompt: string): Promise<void> {
    const trimmed = prompt.trim();
    if (!trimmed || this.isStreaming() || this.rateLimitCooldown() > 0) {
      return;
    }

    this.errorState.set(null);
    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    const currentHistory = this.messages();
    const updatedMessagesWithUser = [...currentHistory, userMessage];
    this.messages.set(updatedMessagesWithUser);
    this.isStreaming.set(true);
    this.currentStreamingText.set('');

    const activeId = this.currentSessionId();
    const currentSession = this.sessions().find(s => s.id === activeId);

    const generatedTitle = currentSession && (currentSession.title === 'Nova Sessao' || currentSession.messages.length === 0)
      ? (trimmed.length > 32 ? trimmed.substring(0, 32) + '...' : trimmed)
      : (currentSession ? currentSession.title : 'Nova Sessao');

    let updatedSessions = this.sessions().map(s => {
      if (s.id === activeId) {
        return { ...s, title: generatedTitle, messages: updatedMessagesWithUser };
      }
      return s;
    });

    if (!updatedSessions.some(s => s.id === activeId)) {
      const newEntry: ChatSession = {
        id: activeId,
        title: generatedTitle,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messages: updatedMessagesWithUser
      };
      updatedSessions = [newEntry, ...updatedSessions];
    }

    updatedSessions = updatedSessions
      .filter(s => s.id === activeId || s.messages.length > 0)
      .slice(0, this.maxSessions);

    this.sessions.set(updatedSessions);
    this.persistSessions(updatedSessions);

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
        if (response.status === 429) {
          this.triggerRateLimitNotice(activeId);
          return;
        }
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
                if (parsed.code === 429 || String(parsed.error).includes('429') || String(parsed.error).includes('taxa de processamento')) {
                  this.triggerRateLimitNotice(activeId);
                  return;
                }
                this.errorState.set(parsed.error);
                continue;
              }

              if (parsed.text) {
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
        const finalMessages = [...this.messages(), assistantMessage];
        this.messages.set(finalMessages);

        const finalizedSessions = this.sessions()
          .map(s => {
            if (s.id === activeId) {
              return { ...s, messages: finalMessages };
            }
            return s;
          })
          .filter(s => s.messages.length > 0)
          .slice(0, this.maxSessions);

        this.sessions.set(finalizedSessions);
        this.persistSessions(finalizedSessions);
      }
    } catch (err: unknown) {
      if (this.rateLimitCooldown() === 0) {
        const message = err instanceof Error ? err.message : 'Erro na comunicacao com o servidor';
        this.errorState.set(message);
      }
    } finally {
      this.isStreaming.set(false);
      this.currentStreamingText.set('');
    }
  }
}
