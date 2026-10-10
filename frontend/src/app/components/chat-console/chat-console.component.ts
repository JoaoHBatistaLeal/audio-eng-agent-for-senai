import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioStreamService } from '../../services/audio-stream.service';

@Component({
  selector: 'app-chat-console',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex-1 flex flex-col min-h-[500px] rounded-3xl border-2 border-studio-slate/40 bg-white shadow-[0_12px_40px_0_rgba(26,31,44,0.12)] overflow-hidden">
      <div class="px-6 py-4 border-b-2 border-studio-slate/25 bg-studio-lilac flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="w-3.5 h-3.5 rounded-full bg-studio-slate-deep shadow-[0_0_8px_rgba(26,31,44,0.4)]"></span>
          <span class="text-sm font-black uppercase tracking-wider text-studio-slate-deep">MONITOR DE COMUNICACAO DE AUDIO</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-bold text-studio-slate-dark">TAXA DE RESPOSTA ATIVA</span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-studio-canvas">
        @if (audioService.messages().length === 0 && !audioService.isStreaming()) {
          <div class="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-studio-slate/30 rounded-2xl bg-white shadow-sm">
            <div class="w-16 h-1.5 bg-studio-slate-dark rounded-full mb-4"></div>
            <h2 class="text-lg font-black uppercase tracking-wider text-studio-slate-deep">SISTEMA EM AGUARDO DE SINAL</h2>
            <p class="text-sm font-semibold text-studio-slate-dark max-w-md mt-2 leading-relaxed">
              Envie um chamado sobre conflitos de equalizacao, arquitetura de sintese ou historia de equipamentos para iniciar a transmissao.
            </p>
          </div>
        }

        @for (msg of audioService.messages(); track $index) {
          <div class="flex flex-col" [ngClass]="msg.role === 'user' ? 'items-end' : 'items-start'">
            <div class="flex items-center gap-2 mb-1 px-1">
              <span class="text-xs font-mono uppercase tracking-wider font-black text-studio-slate-deep">
                [{{ msg.role === 'user' ? 'OPERADOR' : 'CONSULTOR DE AUDIO' }}]
              </span>
              <span class="text-[11px] font-mono font-bold text-studio-slate-dark">{{ msg.timestamp }}</span>
            </div>

            <div class="max-w-[85%] rounded-2xl p-5 shadow-md whitespace-pre-wrap leading-relaxed text-sm transition-all duration-300"
              [ngClass]="msg.role === 'user'
                ? 'bg-studio-slate-deep text-white rounded-br-none border-2 border-studio-slate-deep font-medium'
                : 'bg-white text-studio-slate-deep rounded-bl-none border-2 border-studio-slate/35 font-semibold shadow-sm'">
              {{ msg.content }}
            </div>
          </div>
        }

        @if (audioService.isStreaming()) {
          <div class="flex flex-col items-start">
            <div class="flex items-center gap-2 mb-1 px-1">
              <span class="text-xs font-mono uppercase tracking-wider font-black text-studio-slate-deep animate-pulse">
                [RECEBENDO TELEMETRIA]
              </span>
            </div>

            <div class="max-w-[85%] rounded-2xl p-5 rounded-bl-none border-2 border-studio-slate-dark bg-white text-studio-slate-deep shadow-lg whitespace-pre-wrap leading-relaxed text-sm font-semibold">
              {{ audioService.currentStreamingText() }}
              <span class="inline-block w-2.5 h-4 ml-1 bg-studio-slate-deep animate-pulse align-middle"></span>
            </div>
          </div>
        }

        @if (audioService.errorState()) {
          <div class="p-4 rounded-xl border-2 border-red-500 bg-red-50 text-red-950 text-xs font-mono font-black">
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
