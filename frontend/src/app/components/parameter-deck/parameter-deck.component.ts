import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioStreamService } from '../../services/audio-stream.service';

@Component({
  selector: 'app-parameter-deck',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="w-full lg:w-80 flex flex-col gap-4">
      <div class="rounded-2xl border border-studio-slate/20 bg-studio-cream/60 p-5 backdrop-blur-md shadow-[0_8px_32px_0_rgba(136,149,179,0.18)]">
        <div class="flex items-center justify-between pb-3 border-b border-studio-slate/20">
          <span class="text-xs font-semibold uppercase tracking-wider text-studio-slate">STATUS DO SISTEMA</span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border"
            [ngClass]="audioService.isStreaming() ? 'bg-studio-slate text-studio-canvas border-studio-slate animate-pulse' : 'bg-studio-lilac/70 text-studio-slate border-studio-slate/30'">
            <span class="w-1.5 h-1.5 rounded-full"
              [ngClass]="audioService.isStreaming() ? 'bg-studio-canvas' : 'bg-studio-slate'"></span>
            {{ audioService.isStreaming() ? 'STREAMING' : 'ONLINE' }}
          </span>
        </div>

        <div class="mt-4 space-y-3">
          <div class="flex justify-between items-center text-xs">
            <span class="text-studio-slate/80 font-medium">MOTOR IA</span>
            <span class="font-mono font-bold text-studio-slate">GROQ ENGINE</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-studio-slate/80 font-medium">LATENCIA PRIMEIRO TOKEN</span>
            <span class="font-mono font-bold text-studio-slate">{{ audioService.latencyMs() }} ms</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-studio-slate/80 font-medium">MODO DE PROCESSAMENTO</span>
            <span class="font-mono font-bold text-studio-slate">STREAMING SSE</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-studio-slate/80 font-medium">MENSAGENS NA SESSAO</span>
            <span class="font-mono font-bold text-studio-slate">{{ audioService.messages().length }}</span>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-studio-bone/50 bg-studio-lilac/50 p-5 backdrop-blur-md shadow-[0_8px_32px_0_rgba(136,149,179,0.12)]">
        <span class="text-xs font-semibold uppercase tracking-wider text-studio-slate block pb-2 border-b border-studio-bone/60">
          ESPECIFICACOES DE CALIBRACAO
        </span>
        <div class="mt-3 space-y-2.5 text-xs text-studio-slate/90">
          <div class="p-2.5 rounded-xl bg-studio-canvas/70 border border-studio-bone/40">
            <div class="font-bold text-studio-slate">EQUALIZACAO CIRURGICA</div>
            <div class="text-[11px] text-studio-slate/80 mt-0.5">Foco em Q estreito, curvas notch e cortes subtrativos precisos.</div>
          </div>
          <div class="p-2.5 rounded-xl bg-studio-canvas/70 border border-studio-bone/40">
            <div class="font-bold text-studio-slate">SINTESE MODULAR & FM</div>
            <div class="text-[11px] text-studio-slate/80 mt-0.5">Topologia de osciladores, envelopes ADSR e moduladores em ms.</div>
          </div>
          <div class="p-2.5 rounded-xl bg-studio-canvas/70 border border-studio-bone/40">
            <div class="font-bold text-studio-slate">REFERENCIA HISTORICA</div>
            <div class="text-[11px] text-studio-slate/80 mt-0.5">Equipamentos lendarios (Moog, TB-303, DX7, Prophet-5).</div>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-studio-slate/20 bg-studio-canvas/60 p-4 backdrop-blur-md flex items-center justify-between">
        <span class="text-xs font-medium text-studio-slate">HISTORICO DE DIALOGO</span>
        <button
          type="button"
          (click)="audioService.clearHistory()"
          [disabled]="audioService.isStreaming() || audioService.messages().length === 0"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all duration-300 border border-studio-slate/30 text-studio-slate hover:bg-studio-slate hover:text-studio-canvas disabled:opacity-40 disabled:cursor-not-allowed">
          LIMPAR CONSOLE
        </button>
      </div>
    </aside>
  `
})
export class ParameterDeckComponent {
  readonly audioService = inject(AudioStreamService);
}
