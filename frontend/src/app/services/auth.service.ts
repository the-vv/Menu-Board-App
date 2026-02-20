import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { User } from '../models';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

const TOKEN_KEY = 'mb_token';
const USER_KEY = 'mb_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(this.loadUser());
  token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  constructor(private api: ApiService, private router: Router) {}

  private loadUser(): User | null {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  login(email: string, password: string): Observable<any> {
    return this.api.login({ email, password }).pipe(
      tap(res => this.setSession(res))
    );
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.api.register({ name, email, password }).pipe(
      tap(res => this.setSession(res))
    );
  }

  private setSession(res: { access_token: string; user: User }) {
    localStorage.setItem(TOKEN_KEY, res.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.token.set(res.access_token);
    this.currentUser.set(res.user);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/home']);
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }

  getToken(): string | null {
    return this.token();
  }
}
