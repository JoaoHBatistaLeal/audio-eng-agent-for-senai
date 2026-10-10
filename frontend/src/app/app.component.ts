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
    <div class="min-h-screen bg-gradient-to-br from-studio-canvas via-studio-lilac to-studio-bone text-studio-slate flex flex-col">
      <header class="w-full border-b-2 border-studio-slate/30 bg-studio-lilac/90 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div class="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-3">
              <span class="w-3.5 h-3.5 rounded-sm bg-studio-slate"></span>
              <h1 class="text-base font-black uppercase tracking-widest text-studio-slate">
                CONSOLE DE ENGENHARIA DE AUDIO SENAI
              </h1>
            </div>
            <p class="text-xs font-semibold text-studio-slate mt-0.5">
              SISTEMA CONSULTOR EM ACUSTICA, EQUALIZACAO E SINTESE SONORA
            </p>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-3.5 py-1.5 rounded-lg bg-studio-cream border-2 border-studio-slate/25 text-[11px] font-mono font-bold text-studio-slate">
              TERMINAL 1.0
            </span>
            <span class="px-3.5 py-1.5 rounded-lg bg-studio-canvas border-2 border-studio-slate text-[11px] font-mono text-studio-slate font-black">
              ESTUDIO SENAI
            </span>
          </div>
        </div>
      </header>

      <main class="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        <div class="flex-1 flex flex-col gap-6">
          <app-chat-console></app-chat-console>
          <app-prompt-input></app-prompt-input>
        </div>
        <app-parameter-deck></app-parameter-deck>
      </main>

      <footer class="w-full border-t-2 border-studio-slate/20 bg-studio-canvas/80 backdrop-blur-sm py-4">
        <div class="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold text-studio-slate">
          <span>DESENVOLVIDO PARA O SENAI - PLATAFORMA DE PRECISAO SONORA</span>
          <span class="font-mono font-black">COMUNICACAO STREAMING SSE NATIVA</span>
        </div>
      </footer>
    </div>
  `
})
export class AppComponent {}
