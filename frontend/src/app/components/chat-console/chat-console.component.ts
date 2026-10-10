import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioStreamService } from '../../services/audio-stream.service';

@Component({
  selector: 'app-chat-console',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex-1 flex flex-col min-h-[500px] rounded-3xl border-2 border-studio-slate/40 bg-studio-canvas/95 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(136,149,179,0.25)] overflow-hidden">
      <div class="px-6 py-4 border-b-2 border-studio-slate/30 bg-studio-lilac/80 backdrop-blur-md flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="w-3.5 h-3.5 rounded-full bg-studio-slate shadow-[0_0_12px_rgba(136,149,179,0.7)]"></span>
          <span class="text-sm font-black uppercase tracking-wider text-studio-slate">MONITOR DE COMUNICACAO DE AUDIO</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-bold text-studio-slate">TAXA DE RESPOSTA ATIVA</span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        @if (audioService.messages().length === 0 && !audioService.isStreaming()) {
          <div class="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-studio-slate/30 rounded-2xl bg-studio-cream/50">
            <div class="w-16 h-1.5 bg-studio-slate rounded-full mb-4"></div>
            <h2 class="text-lg font-black uppercase tracking-wider text-studio-slate">SISTEMA EM AGUARDO DE SINAL</h2>
            <p class="text-sm font-medium text-studio-slate max-w-md mt-2">
              Envie um chamado sobre conflitos de equalizacao, arquitetura de sintese ou historia de equipamentos para iniciar a transmissao.
            </p>
          </div>
        }

        @for (msg of audioService.messages(); track $index) {
          <div class="flex flex-col" [ngClass]="msg.role === 'user' ? 'items-end' : 'items-start'">
            <div class="flex items-center gap-2 mb-1 px-1">
              <span class="text-xs font-mono uppercase tracking-wider font-extrabold text-studio-slate">
                [{{ msg.role === 'user' ? 'OPERADOR' : 'CONSULTOR DE AUDIO' }}]
              </span>
              <span class="text-[11px] font-mono font-semibold text-studio-slate/80">{{ msg.timestamp }}</span>
            </div>

            <div class="max-w-[85%] rounded-2xl p-5 shadow-[0_4px_20px_rgba(136,149,179,0.18)] whitespace-pre-wrap leading-relaxed text-sm font-medium transition-all duration-300"
              [ngClass]="msg.role === 'user'
                ? 'bg-studio-slate text-studio-canvas rounded-br-none border-2 border-studio-slate shadow-[0_4px_16px_rgba(136,149,179,0.3)]'
                : 'bg-studio-lilac text-studio-slate rounded-bl-none border-2 border-studio-slate/35'">
              {{ msg.content }}
            </div>
          </div>
        }

        @if (audioService.isStreaming()) {
          <div class="flex flex-col items-start">
            <div class="flex items-center gap-2 mb-1 px-1">
              <span class="text-xs font-mono uppercase tracking-wider font-extrabold text-studio-slate animate-pulse">
                [RECEBENDO TELEMETRIA]
              </span>
            </div>

            <div class="max-w-[85%] rounded-2xl p-5 rounded-bl-none border-2 border-studio-slate/50 bg-studio-lilac text-studio-slate shadow-[0_0_24px_4px_rgba(136,149,179,0.35)] whitespace-pre-wrap leading-relaxed text-sm font-medium">
              {{ audioService.currentStreamingText() }}
              <span class="inline-block w-2.5 h-4 ml-1 bg-studio-slate animate-pulse align-middle"></span>
            </div>
          </div>
        }

        @if (audioService.errorState()) {
          <div class="p-4 rounded-xl border-2 border-red-400 bg-red-100 text-red-900 text-xs font-mono font-bold">
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
