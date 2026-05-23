import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../admin-page/auth.service';

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrap">
      <div class="login-card">
        <div class="login-logo">
          <div class="login-logo-label">НУХТ · Адмінпанель</div>
          <div class="login-logo-name">Проф. орієнтовний</div>
        </div>

        <div class="login-form">
          <div class="login-form-group" [class.error]="fieldErrors.username">
            <label class="login-label">Логін</label>
            <input
              class="login-input"
              type="text"
              placeholder="admin"
              [(ngModel)]="username"
              name="username"
              autocomplete="username"
              [disabled]="loading"
              (keydown.enter)="submit()"
            />
            <div class="login-field-error" *ngIf="fieldErrors.username">
              {{ fieldErrors.username }}
            </div>
          </div>

          <div class="login-form-group" [class.error]="fieldErrors.password">
            <label class="login-label">Пароль</label>
            <div class="login-input-wrap">
              <input
                class="login-input"
                [type]="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                [(ngModel)]="password"
                name="password"
                autocomplete="current-password"
                [disabled]="loading"
                (keydown.enter)="submit()"
              />
              <button
                type="button"
                class="login-eye"
                (click)="showPassword = !showPassword"
                tabindex="-1"
                [attr.aria-label]="showPassword ? 'Сховати пароль' : 'Показати пароль'"
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <ng-container *ngIf="!showPassword">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </ng-container>
                  <ng-container *ngIf="showPassword">
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
                    />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </ng-container>
                </svg>
              </button>
            </div>
            <div class="login-field-error" *ngIf="fieldErrors.password">
              {{ fieldErrors.password }}
            </div>
          </div>

          <div class="login-error" *ngIf="errorMsg" role="alert">
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {{ errorMsg }}
          </div>

          <button class="login-btn" type="button" [disabled]="loading" (click)="submit()">
            <span *ngIf="!loading">Увійти</span>
            <span *ngIf="loading" class="login-spinner"></span>
          </button>
        </div>

        <div class="login-footer">НУХТ © {{ year }} · Адміністративна панель</div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-wrap {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f3ee;
        font-family: 'Geologica', 'Inter', system-ui, sans-serif;
        padding: 20px;
        box-sizing: border-box;
      }

      .login-card {
        width: 100%;
        max-width: 400px;
        background: #fff;
        border-radius: 16px;
        padding: 40px 36px 32px;
        box-shadow:
          0 4px 32px rgba(0, 0, 0, 0.08),
          0 1px 4px rgba(0, 0, 0, 0.04);
      }

      .login-logo {
        text-align: center;
        margin-bottom: 32px;
      }

      .login-logo-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #2d7a4f;
        margin-bottom: 4px;
      }

      .login-logo-name {
        font-size: 20px;
        font-weight: 700;
        color: #1a1a1a;
        letter-spacing: -0.02em;
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .login-form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .login-label {
        font-size: 12px;
        font-weight: 600;
        color: #444;
        letter-spacing: 0.02em;
      }

      .login-input-wrap {
        position: relative;
      }

      .login-input {
        width: 100%;
        height: 44px;
        border: 1.5px solid rgba(0, 0, 0, 0.12);
        border-radius: 10px;
        padding: 0 14px;
        font-size: 14px;
        color: #1a1a1a;
        background: #fafaf8;
        transition:
          border-color 0.15s,
          box-shadow 0.15s;
        box-sizing: border-box;
        outline: none;
        font-family: inherit;
      }

      .login-input:focus {
        border-color: #2d7a4f;
        box-shadow: 0 0 0 3px rgba(45, 122, 79, 0.1);
      }

      .login-input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .login-form-group.error .login-input {
        border-color: #c0392b;
      }

      .login-input-wrap .login-input {
        padding-right: 42px;
      }

      .login-eye {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        color: #888;
        padding: 0;
        display: flex;
        align-items: center;
        transition: color 0.15s;
      }

      .login-eye:hover {
        color: #2d7a4f;
      }

      .login-field-error {
        font-size: 11px;
        color: #c0392b;
      }

      .login-error {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #fdf2f2;
        border: 1px solid rgba(192, 57, 43, 0.2);
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 13px;
        color: #c0392b;
      }

      .login-btn {
        height: 46px;
        background: #2d7a4f;
        color: #fff;
        border: none;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition:
          background 0.15s,
          transform 0.1s;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 4px;
        font-family: inherit;
      }

      .login-btn:hover:not(:disabled) {
        background: #235f3d;
      }
      .login-btn:active:not(:disabled) {
        transform: scale(0.98);
      }
      .login-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .login-spinner {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .login-footer {
        text-align: center;
        font-size: 11px;
        color: #bbb;
        margin-top: 28px;
      }
    `,
  ],
})
export class LoginPage {
  username = '';
  password = '';
  loading = false;
  errorMsg = '';
  showPassword = false;
  fieldErrors: { username?: string; password?: string } = {};
  readonly year = new Date().getFullYear();

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  private validate(): boolean {
    this.fieldErrors = {};
    if (!this.username.trim()) this.fieldErrors.username = 'Введіть логін';
    if (!this.password) this.fieldErrors.password = 'Введіть пароль';
    return Object.keys(this.fieldErrors).length === 0;
  }

  submit(): void {
    this.errorMsg = '';
    if (!this.validate() || this.loading) return;
    this.loading = true;

    this.auth.login(this.username.trim(), this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin']);
      },
      error: (e) => {
        this.loading = false;
        if (e.status === 401) {
          this.errorMsg = 'Невірний логін або пароль';
        } else if (e.status === 0) {
          this.errorMsg = "Сервер недоступний. Перевірте з'єднання.";
        } else {
          this.errorMsg = e.error?.message ?? 'Помилка входу';
        }
      },
    });
  }
}
