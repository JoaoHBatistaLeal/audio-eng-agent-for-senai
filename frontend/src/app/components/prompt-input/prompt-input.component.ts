import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AudioStreamService } from '../../services/audio-stream.service';

@Component({
  selector: 'app-prompt-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full flex flex-col gap-2.5 sm:gap-3">
      <div class="flex flex-wrap gap-1.5 sm:gap-2 items-center">
        <span class="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-studio-slate-dark shrink-0">
          ATALHOS RAPIDOS:
        </span>
        @for (suggestion of studioSuggestions; track suggestion) {
          <button
            type="button"
            (click)="selectSuggestion(suggestion)"
            [disabled]="audioService.isStreaming() || audioService.rateLimitCooldown() > 0"
            class="px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-white border border-studio-slate/35 text-studio-slate-deep hover:bg-studio-lilac hover:border-studio-slate-deep active:translate-y-0 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs">
            {{ suggestion }}
          </button>
        }
      </div>

      <form (ngSubmit)="submitPrompt()" class="w-full">
        <div class="rounded-xl sm:rounded-2xl border-2 bg-white p-2.5 sm:p-3.5 shadow-sm transition-all duration-200"
          [ngClass]="isNearLimit()
            ? 'border-studio-slate ring-2 ring-studio-slate'
            : 'border-studio-slate/40 focus-within:border-studio-slate-deep focus-within:ring-2 focus-within:ring-studio-slate/50'">
          <div class="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <textarea
              [value]="promptText()"
              (input)="onInput($event)"
              (paste)="handlePaste($event)"
              (keydown.enter)="handleEnter($event)"
              name="prompt"
              rows="2"
              maxlength="1000"
              [disabled]="audioService.isStreaming() || audioService.rateLimitCooldown() > 0"
              placeholder="Descreva o conflito de frequencias, cadeia de equalizacao ou patch de sintese..."
              class="flex-1 bg-transparent resize-none border-0 text-xs sm:text-sm font-semibold text-studio-slate-deep placeholder-studio-slate-dark/70 focus:outline-none p-1.5 sm:p-2 leading-relaxed disabled:opacity-50">
            </textarea>

            <div class="flex justify-end sm:flex-col sm:justify-end items-end gap-2 shrink-0">
              <button
                type="submit"
                [disabled]="!canSubmit()"
                class="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-studio-slate-deep shadow-md hover:bg-studio-slate-dark active:translate-y-0 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed">
                @if (audioService.rateLimitCooldown() > 0) {
                  AGUARDE ({{ audioService.rateLimitCooldown() }}S)
                } @else if (audioService.isStreaming()) {
                  PROCESSANDO
                } @else {
                  TRANSMITIR
                }
              </button>
            </div>
          </div>

          <div class="mt-2 sm:mt-2.5 pt-2 border-t-2 border-studio-slate/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-[10px] sm:text-[11px] font-bold text-studio-slate-deep">
            <div class="flex flex-wrap items-center gap-2.5 sm:gap-3">
              @if (audioService.rateLimitCooldown() > 0) {
                <span class="font-mono font-black text-studio-slate-deep">PAUSA DE CALIBRAGEM: LIBERACAO EM {{ audioService.rateLimitCooldown() }}S</span>
              } @else {
                <span class="text-studio-slate-dark">Enter para enviar, Shift+Enter para quebra</span>
              }
              <span class="font-mono tracking-wider transition-colors duration-150"
                [ngClass]="isNearLimit() ? 'text-studio-slate-deep font-black' : 'text-studio-slate-dark font-bold'">
                BUFFER: {{ charCount() }} / 1000
              </span>
            </div>
            <span class="font-mono font-black">CANAL STREAMING DIRETO</span>
          </div>
        </div>
      </form>
    </div>
  `
})
export class PromptInputComponent {
  readonly audioService = inject(AudioStreamService);
  readonly promptText = signal<string>('');

  readonly charCount = computed(() => this.promptText().length);
  readonly isNearLimit = computed(() => this.charCount() >= 900);
  readonly canSubmit = computed(() => {
    const len = this.promptText().trim().length;
    return len > 0 && this.charCount() <= 1000 && !this.audioService.isStreaming() && this.audioService.rateLimitCooldown() === 0;
  });

  readonly studioSuggestions = [
    '808 E KICK EMBOLANDO NO GRAVE',
    'VOCAL APAGADO ENTRE GUITARRAS',
    'RESSONANCIA ESTRIDENTE EM 3 KHZ',
    'TIMBRE DE BAIXO ACID 303',
    'LIMPEZA DE FREQUENCIAS SUBGRAVES',
    'DIFERENCA DE CORTE 12DB VS 24DB'
  ];

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (target.value.length > 1000) {
      target.value = target.value.slice(0, 1000);
    }
    this.promptText.set(target.value);
  }

  handlePaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') || '';
    const textarea = event.target as HTMLTextAreaElement;
    const current = this.promptText();
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const combined = current.slice(0, start) + pasted + current.slice(end);
    if (combined.length > 1000) {
      event.preventDefault();
      const truncated = combined.slice(0, 1000);
      this.promptText.set(truncated);
      textarea.value = truncated;
    }
  }

  selectSuggestion(suggestion: string): void {
    if (this.audioService.isStreaming() || this.audioService.rateLimitCooldown() > 0) {
      return;
    }
    const truncated = suggestion.slice(0, 1000);
    this.promptText.set(truncated);
    this.submitPrompt();
  }

  submitPrompt(): void {
    const text = this.promptText().trim();
    if (!text || text.length > 1000 || this.audioService.isStreaming() || this.audioService.rateLimitCooldown() > 0) {
      return;
    }
    this.audioService.sendMessage(text);
    this.promptText.set('');
  }

  handleEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      if (this.canSubmit()) {
        this.submitPrompt();
      }
    }
  }
}
