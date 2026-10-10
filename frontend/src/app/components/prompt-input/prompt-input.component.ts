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
      <div class="rounded-2xl border-2 border-studio-slate/40 bg-white p-4 shadow-[0_12px_40px_0_rgba(26,31,44,0.10)] transition-all duration-300 focus-within:border-studio-slate-deep focus-within:ring-2 focus-within:ring-studio-slate-deep/30 focus-within:shadow-[0_0_24px_rgba(26,31,44,0.18)]">
        <div class="flex flex-col sm:flex-row gap-3">
          <textarea
            [(ngModel)]="promptText"
            name="prompt"
            (keydown.enter)="handleEnter($event)"
            rows="2"
            [disabled]="audioService.isStreaming()"
            placeholder="Descreva o problema de equalizacao, arquitetura de patch de sintetizador ou consulta acustica..."
            class="flex-1 bg-transparent resize-none border-0 text-sm font-semibold text-studio-slate-deep placeholder-studio-slate-dark/70 focus:outline-none p-2 leading-relaxed disabled:opacity-50">
          </textarea>

          <div class="flex sm:flex-col justify-end items-end gap-2 shrink-0">
            <button
              type="submit"
              [disabled]="audioService.isStreaming() || !promptText.trim()"
              class="px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-studio-slate-deep shadow-md hover:bg-studio-slate-dark hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-30 disabled:hover:translate-y-0 disabled:cursor-not-allowed">
              {{ audioService.isStreaming() ? 'PROCESSANDO' : 'TRANSMITIR' }}
            </button>
          </div>
        </div>

        <div class="mt-2.5 pt-2.5 border-t-2 border-studio-slate/15 flex items-center justify-between text-[11px] font-bold text-studio-slate-deep">
          <span>Pressione Enter para enviar, Shift+Enter para nova linha</span>
          <span class="font-mono font-black">COMUNICACAO DIRETA TLS 1.3</span>
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
