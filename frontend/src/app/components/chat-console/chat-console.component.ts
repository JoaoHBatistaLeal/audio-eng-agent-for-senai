import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioStreamService } from '../../services/audio-stream.service';
import { MarkdownToHtmlPipe } from '../../pipes/markdown-to-html.pipe';

@Component({
  selector: 'app-chat-console',
  standalone: true,
  imports: [CommonModule, MarkdownToHtmlPipe],
  template: `
    <div class="flex-1 flex flex-col min-h-[420px] sm:min-h-[520px] rounded-2xl sm:rounded-3xl border-2 border-studio-slate/40 bg-white shadow-sm overflow-hidden">
      <div class="px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-b-2 border-studio-slate/20 bg-studio-lilac flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
            [ngClass]="audioService.isStreaming() ? 'bg-studio-slate-deep animate-pulse' : 'bg-studio-slate-dark'"></span>
          <span class="text-[11px] sm:text-xs font-black uppercase tracking-wider text-studio-slate-deep truncate">
            CONSOLE DE OPERACAO DE AUDIO
          </span>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-black border-2"
            [ngClass]="audioService.isStreaming() ? 'bg-studio-slate-deep text-white border-studio-slate-deep animate-pulse' : 'bg-white text-studio-slate-deep border-studio-slate/40'">
            <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
              [ngClass]="audioService.isStreaming() ? 'bg-white' : 'bg-studio-slate-deep'"></span>
            {{ audioService.isStreaming() ? 'STREAMING' : 'CONECTADO' }}
          </span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 bg-studio-canvas">
        @if (audioService.messages().length === 0 && !audioService.isStreaming()) {
          <div class="h-full flex flex-col items-center justify-center text-center p-5 sm:p-8 border-2 border-dashed border-studio-slate/25 rounded-2xl bg-white shadow-2xs">
            <div class="w-12 sm:w-14 h-1.5 bg-studio-slate-dark rounded-full mb-3 sm:mb-4"></div>
            <h2 class="text-sm sm:text-base font-black uppercase tracking-wider text-studio-slate-deep">SISTEMA EM AGUARDO DE SINAL</h2>
            <p class="text-[11px] sm:text-xs font-semibold text-studio-slate-dark max-w-md mt-1.5 sm:mt-2 leading-relaxed">
              Selecione um atalho rapido de bancada abaixo ou descreva seu problema de equalizacao, ganho e sintese para receber a prescricao imediata.
            </p>
          </div>
        }

        @for (msg of audioService.messages(); track $index) {
          <div class="flex flex-col" [ngClass]="msg.role === 'user' ? 'items-end' : 'items-start'">
            <div class="flex items-center gap-2 mb-1 px-1">
              <span class="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-black text-studio-slate-deep">
                [{{ msg.role === 'user' ? 'OPERADOR' : 'CONSULTOR DE AUDIO' }}]
              </span>
              <span class="text-[9px] sm:text-[10px] font-mono font-bold text-studio-slate-dark">{{ msg.timestamp }}</span>
            </div>

            @if (msg.role === 'user') {
              <div class="max-w-[95%] sm:max-w-[90%] xl:max-w-[85%] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs whitespace-pre-wrap leading-relaxed text-xs sm:text-sm transition-all duration-200 bg-studio-slate-deep text-white rounded-br-none border-2 border-studio-slate-deep font-medium">
                {{ msg.content }}
              </div>
            } @else {
              <div class="markdown-body max-w-[98%] sm:max-w-[95%] xl:max-w-[92%] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs leading-relaxed text-xs sm:text-sm transition-all duration-200 bg-white text-studio-slate-deep rounded-bl-none border-2 border-studio-slate/30"
                [innerHTML]="msg.content | markdownToHtml">
              </div>
            }
          </div>
        }

        @if (audioService.isStreaming()) {
          <div class="flex flex-col items-start">
            <div class="flex items-center gap-2 mb-1 px-1">
              <span class="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-black text-studio-slate-deep animate-pulse">
                [RECEBENDO TELEMETRIA]
              </span>
            </div>

            <div class="markdown-body max-w-[98%] sm:max-w-[95%] xl:max-w-[92%] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 rounded-bl-none border-2 border-studio-slate-dark bg-white text-studio-slate-deep shadow-md leading-relaxed text-xs sm:text-sm"
              [innerHTML]="audioService.currentStreamingText() | markdownToHtml">
            </div>
          </div>
        }

        @if (audioService.errorState()) {
          <div class="p-3.5 sm:p-4 rounded-xl border-2 border-red-500 bg-red-50 text-red-950 text-[11px] sm:text-xs font-mono font-black">
            FALHA DETECTADA: {{ audioService.errorState() }}
          </div>
        }
      </div>
    </div>
  `
})
export class ChatConsoleComponent {
  readonly audioService = inject(AudioStreamService);
}
