import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
  IonButton, IonIcon, IonInput, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAddOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
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
          <ion-back-button defaultHref="/auth/login"></ion-back-button>
        </ion-buttons>
        <ion-title>Create Account</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="max-w-sm mx-auto pt-8">
        <div class="text-center mb-8">
          <div class="text-6xl mb-3">🎉</div>
          <h1 class="text-2xl font-bold text-white">Join MenuBoard</h1>
          <p class="text-gray-400 mt-1">Create an account to add your restaurants</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Name -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <ion-input
              formControlName="name"
              placeholder="Your name"
              fill="outline"
              class="rounded-xl"
            ></ion-input>
          </div>

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
          </div>

          <!-- Password -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <ion-input
              formControlName="password"
              [type]="showPassword ? 'text' : 'password'"
              placeholder="Min 6 characters"
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
              <ion-icon name="person-add-outline" slot="start"></ion-icon>
            }
            Create Account
          </ion-button>
        </form>

        <p class="text-center text-sm text-gray-400">
          Already have an account?
          <a routerLink="/auth/login" class="text-indigo-400 font-medium">Sign in</a>
        </p>
      </div>
    </ion-content>
  `
})
export class RegisterPage {
  form: FormGroup;
  loading = signal(false);
  error = signal('');
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ personAddOutline, eyeOutline, eyeOffOutline });
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { name, email, password } = this.form.value;
    this.authService.register(name, email, password).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/home']); },
      error: (err: any) => { this.loading.set(false); this.error.set(err.error?.message || 'Registration failed'); }
    });
  }
}
