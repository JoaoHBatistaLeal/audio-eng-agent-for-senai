import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioStreamService } from '../../services/audio-stream.service';

@Component({
  selector: 'app-parameter-deck',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="w-full lg:w-80 flex flex-col gap-4">
      <div class="rounded-2xl border-2 border-studio-slate/40 bg-studio-cream/80 p-5 backdrop-blur-md shadow-[0_8px_32px_0_rgba(136,149,179,0.25)]">
        <div class="flex items-center justify-between pb-3 border-b-2 border-studio-slate/30">
          <span class="text-xs font-black uppercase tracking-wider text-studio-slate">STATUS DO SISTEMA</span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border-2"
            [ngClass]="audioService.isStreaming() ? 'bg-studio-slate text-studio-canvas border-studio-slate animate-pulse' : 'bg-studio-lilac text-studio-slate border-studio-slate/50'">
            <span class="w-2 h-2 rounded-full"
              [ngClass]="audioService.isStreaming() ? 'bg-studio-canvas' : 'bg-studio-slate'"></span>
            {{ audioService.isStreaming() ? 'STREAMING' : 'ONLINE' }}
          </span>
        </div>

        <div class="mt-4 space-y-3">
          <div class="flex justify-between items-center text-xs">
            <span class="text-studio-slate font-bold">MOTOR IA</span>
            <span class="font-mono font-black text-studio-slate">GROQ ENGINE</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-studio-slate font-bold">LATENCIA PRIMEIRO TOKEN</span>
            <span class="font-mono font-black text-studio-slate">{{ audioService.latencyMs() }} ms</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-studio-slate font-bold">MODO DE PROCESSAMENTO</span>
            <span class="font-mono font-black text-studio-slate">STREAMING SSE</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-studio-slate font-bold">MENSAGENS NA SESSAO</span>
            <span class="font-mono font-black text-studio-slate">{{ audioService.messages().length }}</span>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border-2 border-studio-slate/30 bg-studio-lilac/75 p-5 backdrop-blur-md shadow-[0_8px_32px_0_rgba(136,149,179,0.20)]">
        <span class="text-xs font-black uppercase tracking-wider text-studio-slate block pb-2 border-b-2 border-studio-slate/25">
          ESPECIFICACOES DE CALIBRACAO
        </span>
        <div class="mt-3 space-y-2.5 text-xs">
          <div class="p-3 rounded-xl bg-studio-canvas border-2 border-studio-slate/25 shadow-sm">
            <div class="font-extrabold text-studio-slate">EQUALIZACAO CIRURGICA</div>
            <div class="text-[11px] font-medium text-studio-slate/90 mt-0.5">Foco em Q estreito, curvas notch e cortes subtrativos precisos.</div>
          </div>
          <div class="p-3 rounded-xl bg-studio-canvas border-2 border-studio-slate/25 shadow-sm">
            <div class="font-extrabold text-studio-slate">SINTESE MODULAR & FM</div>
            <div class="text-[11px] font-medium text-studio-slate/90 mt-0.5">Topologia de osciladores, envelopes ADSR e moduladores em ms.</div>
          </div>
          <div class="p-3 rounded-xl bg-studio-canvas border-2 border-studio-slate/25 shadow-sm">
            <div class="font-extrabold text-studio-slate">REFERENCIA HISTORICA</div>
            <div class="text-[11px] font-medium text-studio-slate/90 mt-0.5">Equipamentos lendarios (Moog, TB-303, DX7, Prophet-5).</div>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border-2 border-studio-slate/35 bg-studio-canvas/90 p-4 backdrop-blur-md flex items-center justify-between">
        <span class="text-xs font-bold text-studio-slate">HISTORICO DE DIALOGO</span>
        <button
          type="button"
          (click)="audioService.clearHistory()"
          [disabled]="audioService.isStreaming() || audioService.messages().length === 0"
          class="px-3.5 py-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all duration-300 border-2 border-studio-slate text-studio-slate hover:bg-studio-slate hover:text-studio-canvas disabled:opacity-35 disabled:cursor-not-allowed">
          LIMPAR CONSOLE
        </button>
      </div>
    </aside>
  `
})
export class ParameterDeckComponent {
  readonly audioService = inject(AudioStreamService);
}
