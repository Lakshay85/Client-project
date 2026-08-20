import { StorageService } from './storage.service';

/**
 * Base API service providing authenticated fetch wrapper.
 */
export class ApiService {
  constructor(private baseUrl: string) {}

  /** Build headers with optional auth token. */
  private getHeaders(includeAuth = true): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (includeAuth) {
      const token = StorageService.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  /** Perform an authenticated GET request. */
  async get<T>(path: string, auth = true): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: this.getHeaders(auth),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data as T;
  }

  /** Perform an authenticated POST request. */
  async post<T>(path: string, body: unknown, auth = true): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(auth),
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data as T;
  }

  /** Perform an authenticated PUT request. */
  async put<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data as T;
  }

  /** Perform an authenticated DELETE request. */
  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data as T;
  }

  /**
   * Perform a raw fetch (for cases needing custom error handling,
   * e.g. form submission with 403 detection).
   */
  async rawPost(
    path: string,
    body: unknown,
    auth = false
  ): Promise<{ response: Response; data: any }> {
    const headers = this.getHeaders(auth);
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return { response, data };
  }
}
