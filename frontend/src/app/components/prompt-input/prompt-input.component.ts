import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AudioStreamService } from '../../services/audio-stream.service';

@Component({
  selector: 'app-prompt-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="submitPrompt()" class="w-full">
      <div class="rounded-2xl border border-studio-slate/30 bg-studio-canvas/90 p-3 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(136,149,179,0.18)] transition-all duration-300 focus-within:ring-2 focus-within:ring-studio-slate/50 focus-within:shadow-[0_0_15px_rgba(136,149,179,0.25)]">
        <div class="flex flex-col sm:flex-row gap-3">
          <textarea
            [(ngModel)]="promptText"
            name="prompt"
            (keydown.enter)="handleEnter($event)"
            rows="2"
            [disabled]="audioService.isStreaming()"
            placeholder="Descreva o problema de equalizacao, arquitetura de patch de sintetizador ou consulta acustica..."
            class="flex-1 bg-transparent resize-none border-0 text-sm text-studio-slate placeholder-studio-slate/50 focus:outline-none p-2 leading-relaxed disabled:opacity-50">
          </textarea>

          <div class="flex sm:flex-col justify-end items-end gap-2 shrink-0">
            <button
              type="submit"
              [disabled]="audioService.isStreaming() || !promptText.trim()"
              class="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-studio-canvas bg-gradient-to-r from-studio-slate to-studio-slate/85 shadow-[0_4px_16px_rgba(136,149,179,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed">
              {{ audioService.isStreaming() ? 'PROCESSANDO' : 'TRANSMITIR' }}
            </button>
          </div>
        </div>

        <div class="mt-2 pt-2 border-t border-studio-slate/10 flex items-center justify-between text-[11px] text-studio-slate/70">
          <span>Pressione Enter para enviar, Shift+Enter para nova linha</span>
          <span class="font-mono">COMUNICACAO DIRETA TLS 1.3</span>
        </div>
      </div>
    </form>
  `
})
export class PromptInputComponent {
  readonly audioService = inject(AudioStreamService);
  promptText = '';

  submitPrompt(): void {
    const text = this.promptText.trim();
    if (!text || this.audioService.isStreaming()) {
      return;
    }
    this.audioService.sendMessage(text);
    this.promptText = '';
  }

  handleEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.submitPrompt();
    }
  }
}
