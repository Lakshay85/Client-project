import { describe, test, expect } from 'vitest';
import { exportCSVContent } from './FormResponses';
import { FormField } from './types';

describe('FormResponses CSV Export', () => {
  test('handles answers containing special characters like hash (#), quotes, and commas without breaking', () => {
    const fields: FormField[] = [
      { id: 'f1', label: 'Color Code', fieldType: 'text', isRequired: false, sortOrder: 0 },
      { id: 'f2', label: 'Comments', fieldType: 'textarea', isRequired: false, sortOrder: 1 }
    ];
    const submissions = [
      {
        id: 'sub-1',
        submittedAt: '2026-08-10T12:00:00Z',
        submitterEmail: 'user#test@example.com',
        submitterIp: '127.0.0.1',
        answers: {
          f1: '#ff0000',
          f2: 'Line 1, "quoted text" & 100%'
        }
      }
    ];

    const csvContent = exportCSVContent('Test Form', fields, submissions);
    expect(csvContent).toContain('"#ff0000"');
    expect(csvContent).toContain('"Line 1, ""quoted text"" & 100%"');
    expect(csvContent).toContain('"user#test@example.com"');
  });
});
