import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    // ── HTTP ──────────────────────────────────────────────────────────────
    provideHttpClient(
      withFetch(), // використовує fetch замість XHR (рекомендовано)
      withInterceptorsFromDi(), // підтримка DI-інтерсепторів (для токена тощо)
    ),

    // ── ROUTER ────────────────────────────────────────────────────────────
    provideRouter(
      routes,
      withComponentInputBinding(), // дозволяє передавати route params як @Input()
    ),
  ],
};
