import { describe, test, expect } from 'vitest';
import { DEFAULT_FORM_TEMPLATES } from './defaultFormsData';

describe('Default Form Templates', () => {
  test('template fields must generate fresh unique IDs on each access/instantiation', () => {
    const template1 = DEFAULT_FORM_TEMPLATES.find((t) => t.id === 'customer-feedback')!;
    const field1Id = template1.fields[0].id;

    // Simulate getting templates again
    const template2 = DEFAULT_FORM_TEMPLATES.find((t) => t.id === 'customer-feedback')!;
    const field2Id = template2.fields[0].id;

    // If template fields are static, field1Id === field2Id, causing duplicate key DB errors on save!
    // To prevent duplicate key errors in database, IDs should either be functions or generated when applied.
    expect(field1Id).not.toBe(field2Id);
  });
});
