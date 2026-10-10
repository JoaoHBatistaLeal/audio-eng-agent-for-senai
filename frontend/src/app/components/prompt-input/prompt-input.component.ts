import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AudioStreamService } from '../../services/audio-stream.service';

@Component({
  selector: 'app-prompt-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full flex flex-col gap-3">
      <div class="flex flex-wrap gap-2 items-center">
        <span class="text-[10px] font-black uppercase tracking-wider text-studio-slate-dark shrink-0">
          ATALHOS RAPIDOS:
        </span>
        @for (suggestion of studioSuggestions; track suggestion) {
          <button
            type="button"
            (click)="selectSuggestion(suggestion)"
            [disabled]="audioService.isStreaming()"
            class="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-white border border-studio-slate/35 text-studio-slate-deep hover:bg-studio-lilac hover:border-studio-slate-deep active:translate-y-0 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs">
            {{ suggestion }}
          </button>
        }
      </div>

      <form (ngSubmit)="submitPrompt()" class="w-full">
        <div class="rounded-2xl border-2 border-studio-slate/40 bg-white p-3.5 shadow-sm transition-all duration-200 focus-within:border-studio-slate-deep focus-within:ring-2 focus-within:ring-studio-slate/50">
          <div class="flex flex-col sm:flex-row gap-3">
            <textarea
              [(ngModel)]="promptText"
              name="prompt"
              (keydown.enter)="handleEnter($event)"
              rows="2"
              [disabled]="audioService.isStreaming()"
              placeholder="Descreva o conflito de frequencias, cadeia de equalizacao ou patch de sintese..."
              class="flex-1 bg-transparent resize-none border-0 text-sm font-semibold text-studio-slate-deep placeholder-studio-slate-dark/70 focus:outline-none p-2 leading-relaxed disabled:opacity-50">
            </textarea>

            <div class="flex sm:flex-col justify-end items-end gap-2 shrink-0">
              <button
                type="submit"
                [disabled]="audioService.isStreaming() || !promptText.trim()"
                class="px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-studio-slate-deep shadow-md hover:bg-studio-slate-dark active:translate-y-0 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed">
                {{ audioService.isStreaming() ? 'PROCESSANDO' : 'TRANSMITIR' }}
              </button>
            </div>
          </div>

          <div class="mt-2.5 pt-2 border-t-2 border-studio-slate/15 flex items-center justify-between text-[11px] font-bold text-studio-slate-deep">
            <span>Pressione Enter para enviar, Shift+Enter para quebra de linha</span>
            <span class="font-mono font-black">CANAL STREAMING DIRETO</span>
          </div>
        </div>
      </form>
    </div>
  `
})
export class PromptInputComponent {
  readonly audioService = inject(AudioStreamService);
  promptText = '';

  readonly studioSuggestions = [
    '808 E KICK EMBOLANDO NO GRAVE',
    'VOCAL APAGADO ENTRE GUITARRAS',
    'RESSONANCIA ESTRIDENTE EM 3 KHZ',
    'TIMBRE DE BAIXO ACID 303',
    'LIMPEZA DE FREQUENCIAS SUBGRAVES',
    'DIFERENCA DE CORTE 12DB VS 24DB'
  ];

  selectSuggestion(suggestion: string): void {
    if (this.audioService.isStreaming()) {
      return;
    }
    this.audioService.sendMessage(suggestion);
  }

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
