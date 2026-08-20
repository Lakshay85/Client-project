import { Form, User } from '../types';

/**
 * Auth API endpoints.
 */
export class AuthApi {
  constructor(private apiUrl: string) {}

  async signup(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${this.apiUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Signup failed.');
    return data;
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${this.apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed.');
    return data;
  }

  async exchangeOAuthCode(code: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${this.apiUrl}/api/auth/google/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error('OAuth code exchange failed');
    return res.json();
  }

  async getMe(token: string): Promise<{ user: User }> {
    const res = await fetch(`${this.apiUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  }

  getGoogleAuthUrl(): string {
    return `${this.apiUrl}/api/auth/google`;
  }
}
