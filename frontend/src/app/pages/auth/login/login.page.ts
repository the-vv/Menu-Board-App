import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
  IonButton, IonIcon, IonInput, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logInOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
    IonButton, IonIcon, IonInput, IonSpinner
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Sign In</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="max-w-sm mx-auto pt-8">
        <!-- Logo/Header -->
        <div class="text-center mb-8">
          <div class="text-6xl mb-3">🍽️</div>
          <h1 class="text-2xl font-bold text-white">Welcome Back</h1>
          <p class="text-gray-400 mt-1">Sign in to manage your restaurants</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Email -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <ion-input
              formControlName="email"
              type="email"
              placeholder="you@example.com"
              fill="outline"
              class="rounded-xl"
            ></ion-input>
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <p class="text-red-400 text-xs mt-1">Valid email required</p>
            }
          </div>

          <!-- Password -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <ion-input
              formControlName="password"
              [type]="showPassword ? 'text' : 'password'"
              placeholder="••••••"
              fill="outline"
              class="rounded-xl"
            >
              <ion-button slot="end" fill="clear" (click)="showPassword = !showPassword">
                <ion-icon [name]="showPassword ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
              </ion-button>
            </ion-input>
          </div>

          @if (error()) {
            <div class="mb-4 p-3 bg-red-900/40 border border-red-700/50 rounded-xl">
              <p class="text-red-400 text-sm">{{ error() }}</p>
            </div>
          }

          <ion-button
            type="submit"
            expand="block"
            color="primary"
            [disabled]="form.invalid || loading()"
            class="mb-4"
          >
            @if (loading()) {
              <ion-spinner name="crescent" slot="start"></ion-spinner>
            } @else {
              <ion-icon name="log-in-outline" slot="start"></ion-icon>
            }
            Sign In
          </ion-button>
        </form>

        <p class="text-center text-sm text-gray-400">
          Don't have an account?
          <a routerLink="/auth/register" class="text-indigo-400 font-medium">Sign up</a>
        </p>

        <div class="mt-6 p-3 bg-blue-900/30 border border-blue-700/50 rounded-xl">
          <p class="text-xs text-blue-300">
            💡 You can browse restaurants and menus without signing in. Sign in only to manage your own restaurants.
          </p>
        </div>
      </div>
    </ion-content>
  `
})
export class LoginPage {
  form: FormGroup;
  loading = signal(false);
  error = signal('');
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ logInOutline, eyeOutline, eyeOffOutline });
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.value;
    this.authService.login(email, password).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/home']); },
      error: (err: any) => { this.loading.set(false); this.error.set(err.error?.message || 'Login failed'); }
    });
  }
}
