import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioStreamService } from '../../services/audio-stream.service';

@Component({
  selector: 'app-chat-console',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex-1 flex flex-col min-h-[500px] rounded-3xl border border-studio-slate/30 bg-studio-canvas/80 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(136,149,179,0.18)] overflow-hidden">
      <div class="px-6 py-4 border-b border-studio-slate/20 bg-studio-lilac/40 backdrop-blur-md flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="w-3 h-3 rounded-full bg-studio-slate shadow-[0_0_10px_rgba(136,149,179,0.5)]"></span>
          <span class="text-sm font-bold uppercase tracking-wider text-studio-slate">MONITOR DE COMUNICACAO DE AUDIO</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono text-studio-slate/80">TAXA DE RESPOSTA ATIVA</span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        @if (audioService.messages().length === 0 && !audioService.isStreaming()) {
          <div class="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-studio-bone rounded-2xl bg-studio-cream/30">
            <div class="w-12 h-1 bg-studio-slate/40 rounded-full mb-4"></div>
            <h2 class="text-lg font-bold uppercase tracking-wide text-studio-slate">SISTEMA EM AGUARDO DE SINAL</h2>
            <p class="text-sm text-studio-slate/80 max-w-md mt-2">
              Envie um chamado sobre conflitos de equalizacao, arquitetura de sintese ou historia de equipamentos para iniciar a transmissao.
            </p>
          </div>
        }

        @for (msg of audioService.messages(); track $index) {
          <div class="flex flex-col" [ngClass]="msg.role === 'user' ? 'items-end' : 'items-start'">
            <div class="flex items-center gap-2 mb-1 px-1">
              <span class="text-[11px] font-mono uppercase tracking-wider font-bold"
                [ngClass]="msg.role === 'user' ? 'text-studio-slate' : 'text-studio-slate/90'">
                [{{ msg.role === 'user' ? 'OPERADOR' : 'CONSULTOR DE AUDIO' }}]
              </span>
              <span class="text-[10px] font-mono text-studio-slate/60">{{ msg.timestamp }}</span>
            </div>

            <div class="max-w-[85%] rounded-2xl p-5 shadow-[0_4px_16px_rgba(136,149,179,0.08)] whitespace-pre-wrap leading-relaxed text-sm transition-all duration-300"
              [ngClass]="msg.role === 'user'
                ? 'bg-gradient-to-r from-studio-slate to-studio-slate/90 text-studio-canvas rounded-br-none border border-studio-slate'
                : 'bg-studio-lilac/70 text-studio-slate rounded-bl-none border border-studio-slate/20'">
              {{ msg.content }}
            </div>
          </div>
        }

        @if (audioService.isStreaming()) {
          <div class="flex flex-col items-start">
            <div class="flex items-center gap-2 mb-1 px-1">
              <span class="text-[11px] font-mono uppercase tracking-wider font-bold text-studio-slate animate-pulse">
                [RECEBENDO TELEMETRIA]
              </span>
            </div>

            <div class="max-w-[85%] rounded-2xl p-5 rounded-bl-none border border-studio-slate/40 bg-studio-lilac/90 text-studio-slate shadow-[0_0_20px_2px_rgba(136,149,179,0.25)] whitespace-pre-wrap leading-relaxed text-sm">
              {{ audioService.currentStreamingText() }}
              <span class="inline-block w-2 h-4 ml-1 bg-studio-slate animate-pulse align-middle"></span>
            </div>
          </div>
        }

        @if (audioService.errorState()) {
          <div class="p-4 rounded-xl border border-red-300 bg-red-50 text-red-700 text-xs font-mono">
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
