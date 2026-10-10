import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioStreamService } from '../../services/audio-stream.service';

@Component({
  selector: 'app-parameter-deck',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="w-full lg:w-80 flex flex-col gap-4">
      <div class="rounded-2xl border-2 border-studio-slate/40 bg-white p-5 shadow-[0_12px_40px_0_rgba(26,31,44,0.08)]">
        <div class="flex items-center justify-between pb-3 border-b-2 border-studio-slate/25">
          <span class="text-xs font-black uppercase tracking-wider text-studio-slate-deep">STATUS DO SISTEMA</span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-black border-2"
            [ngClass]="audioService.isStreaming() ? 'bg-studio-slate-deep text-white border-studio-slate-deep animate-pulse' : 'bg-studio-lilac text-studio-slate-deep border-studio-slate/40'">
            <span class="w-2 h-2 rounded-full"
              [ngClass]="audioService.isStreaming() ? 'bg-white' : 'bg-studio-slate-deep'"></span>
            {{ audioService.isStreaming() ? 'STREAMING' : 'ONLINE' }}
          </span>
        </div>

        <div class="mt-4 space-y-3">
          <div class="flex justify-between items-center text-xs">
            <span class="text-studio-slate-dark font-bold">MOTOR IA</span>
            <span class="font-mono font-black text-studio-slate-deep">GROQ ENGINE</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-studio-slate-dark font-bold">LATENCIA PRIMEIRO TOKEN</span>
            <span class="font-mono font-black text-studio-slate-deep">{{ audioService.latencyMs() }} ms</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-studio-slate-dark font-bold">MODO DE PROCESSAMENTO</span>
            <span class="font-mono font-black text-studio-slate-deep">STREAMING SSE</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-studio-slate-dark font-bold">MENSAGENS NA SESSAO</span>
            <span class="font-mono font-black text-studio-slate-deep">{{ audioService.messages().length }}</span>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border-2 border-studio-slate/30 bg-white p-5 shadow-[0_12px_40px_0_rgba(26,31,44,0.08)]">
        <span class="text-xs font-black uppercase tracking-wider text-studio-slate-deep block pb-2 border-b-2 border-studio-slate/20">
          ESPECIFICACOES DE CALIBRACAO
        </span>
        <div class="mt-3 space-y-2.5 text-xs">
          <div class="p-3 rounded-xl bg-studio-canvas border-2 border-studio-slate/25 shadow-sm">
            <div class="font-black text-studio-slate-deep">EQUALIZACAO CIRURGICA</div>
            <div class="text-[11px] font-semibold text-studio-slate-dark mt-0.5 leading-snug">Foco em Q estreito, curvas notch e cortes subtrativos precisos.</div>
          </div>
          <div class="p-3 rounded-xl bg-studio-canvas border-2 border-studio-slate/25 shadow-sm">
            <div class="font-black text-studio-slate-deep">SINTESE MODULAR & FM</div>
            <div class="text-[11px] font-semibold text-studio-slate-dark mt-0.5 leading-snug">Topologia de osciladores, envelopes ADSR e moduladores em ms.</div>
          </div>
          <div class="p-3 rounded-xl bg-studio-canvas border-2 border-studio-slate/25 shadow-sm">
            <div class="font-black text-studio-slate-deep">REFERENCIA HISTORICA</div>
            <div class="text-[11px] font-semibold text-studio-slate-dark mt-0.5 leading-snug">Equipamentos lendarios (Moog, TB-303, DX7, Prophet-5).</div>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border-2 border-studio-slate/35 bg-white p-4 shadow-sm flex items-center justify-between">
        <span class="text-xs font-black text-studio-slate-deep">HISTORICO DE DIALOGO</span>
        <button
          type="button"
          (click)="audioService.clearHistory()"
          [disabled]="audioService.isStreaming() || audioService.messages().length === 0"
          class="px-4 py-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all duration-300 border-2 border-studio-slate-deep text-studio-slate-deep hover:bg-studio-slate-deep hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
          LIMPAR CONSOLE
        </button>
      </div>
    </aside>
  `
})
export class ParameterDeckComponent {
  readonly audioService = inject(AudioStreamService);
}
