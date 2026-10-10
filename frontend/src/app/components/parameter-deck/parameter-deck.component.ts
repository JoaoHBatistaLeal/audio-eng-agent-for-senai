import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioStreamService } from '../../services/audio-stream.service';

@Component({
  selector: 'app-parameter-deck',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col gap-4">
      <div class="rounded-2xl border-2 border-studio-slate/40 bg-white p-4 shadow-sm flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b-2 border-studio-slate/20">
          <span class="text-xs font-black uppercase tracking-wider text-studio-slate-deep">SESSOES DE ESTUDIO</span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-studio-lilac text-studio-slate-deep border border-studio-slate/30">
            {{ audioService.sessions().length }}
          </span>
        </div>

        <button
          type="button"
          (click)="audioService.startNewSession()"
          [disabled]="audioService.isStreaming()"
          class="mt-3 w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-studio-slate-deep hover:bg-studio-slate-dark active:translate-y-0 transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-center">
          NOVA SESSAO
        </button>

        <div class="mt-4 flex flex-col gap-1.5 max-h-[460px] overflow-y-auto pr-1">
          @for (session of audioService.sessions(); track session.id) {
            <div
              (click)="audioService.selectSession(session.id)"
              class="group relative flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all duration-200"
              [ngClass]="audioService.currentSessionId() === session.id
                ? 'bg-studio-lilac border-studio-slate-deep shadow-sm text-studio-slate-deep'
                : 'bg-studio-canvas border-studio-slate/25 hover:border-studio-slate hover:bg-white text-studio-slate-dark'">
              <div class="flex flex-col min-w-0 pr-2">
                <span class="text-xs font-bold truncate">
                  {{ session.title }}
                </span>
                <span class="text-[10px] font-mono mt-0.5 opacity-75">
                  {{ session.createdAt }} | {{ session.messages.length }} msgs
                </span>
              </div>

              <button
                type="button"
                (click)="audioService.deleteSession(session.id, $event)"
                [disabled]="audioService.isStreaming()"
                title="Excluir sessao"
                class="shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-studio-slate/40 text-studio-slate-dark hover:bg-studio-slate-deep hover:text-white transition-colors duration-150">
                DEL
              </button>
            </div>
          }
        </div>

        <div class="mt-4 pt-3 border-t-2 border-studio-slate/20">
          <button
            type="button"
            (click)="audioService.clearAllHistory()"
            [disabled]="audioService.isStreaming() || audioService.sessions().length === 0"
            class="w-full py-2 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wider text-studio-slate-dark border-2 border-studio-slate/30 hover:border-red-400 hover:text-red-900 hover:bg-red-50 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-center">
            LIMPAR HISTORICO
          </button>
        </div>
      </div>
    </aside>
  `
})
export class ParameterDeckComponent {
  readonly audioService = inject(AudioStreamService);
}
