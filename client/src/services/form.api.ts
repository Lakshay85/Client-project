import { Form } from '../types';

/**
 * Form API endpoints.
 */
export class FormApi {
  constructor(private apiUrl: string) {}

  async fetchUserForms(token: string): Promise<Form[]> {
    const res = await fetch(`${this.apiUrl}/api/forms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json()) as { forms?: Form[]; message?: string };
    if (!res.ok) throw new Error(data.message || 'Failed to fetch forms.');
    return data.forms || [];
  }

  async deleteForm(token: string, formId: string): Promise<void> {
    const res = await fetch(`${this.apiUrl}/api/forms/${formId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to delete form.');
    }
  }
}
