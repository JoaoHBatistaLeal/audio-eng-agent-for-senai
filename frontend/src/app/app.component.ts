import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatConsoleComponent } from './components/chat-console/chat-console.component';
import { ParameterDeckComponent } from './components/parameter-deck/parameter-deck.component';
import { PromptInputComponent } from './components/prompt-input/prompt-input.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ChatConsoleComponent, ParameterDeckComponent, PromptInputComponent],
  template: `
    <div class="min-h-screen bg-studio-canvas text-studio-slate-deep flex flex-col font-sans">
      <header class="w-full border-b-2 border-studio-slate/30 bg-white/95 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div class="w-full px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-3">
              <span class="w-3.5 h-3.5 rounded-sm bg-studio-slate-deep"></span>
              <h1 class="text-base font-black uppercase tracking-widest text-studio-slate-deep">
                CONSOLE DE ENGENHARIA DE AUDIO SENAI
              </h1>
            </div>
            <p class="text-xs font-bold text-studio-slate-dark mt-0.5">
              SISTEMA CONSULTOR EM ACUSTICA, EQUALIZACAO E SINTESE SONORA
            </p>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-3.5 py-1.5 rounded-lg bg-studio-lilac border-2 border-studio-slate/30 text-[11px] font-mono font-black text-studio-slate-deep">
              TERMINAL 1.0
            </span>
            <span class="px-3.5 py-1.5 rounded-lg bg-white border-2 border-studio-slate-deep text-[11px] font-mono text-studio-slate-deep font-black">
              ESTUDIO SENAI
            </span>
          </div>
        </div>
      </header>

      <main class="flex-1 w-full px-4 sm:px-8 py-6 flex flex-col lg:flex-row gap-6">
        <div class="flex-1 flex flex-col gap-5 min-w-0">
          <app-chat-console></app-chat-console>
          <app-prompt-input></app-prompt-input>
        </div>
        <app-parameter-deck></app-parameter-deck>
      </main>

      <footer class="w-full border-t-2 border-studio-slate/25 bg-white py-3 px-4 sm:px-8 shadow-sm">
        <div class="w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-black text-studio-slate-deep">
          <span>DESENVOLVIDO PARA O SENAI - PLATAFORMA DE PRECISAO SONORA</span>
          <span class="font-mono font-black">COMUNICACAO STREAMING SSE NATIVA</span>
        </div>
      </footer>
    </div>
  `
})
export class AppComponent {}
