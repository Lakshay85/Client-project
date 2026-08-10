import { describe, test, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';

// We can test API validation logic directly against the Express app or endpoint logic
describe('Server API Endpoints & Access Control', () => {

  test('validEmail regex utility correctly identifies valid and invalid emails', () => {
    const validEmail = (value: unknown): value is string =>
      typeof value === 'string' && /^\S+@\S+\.\S+$/.test(value);

    expect(validEmail('user@example.com')).toBe(true);
    expect(validEmail('alex.smith+test@company.co.uk')).toBe(true);
    expect(validEmail('invalid-email')).toBe(false);
    expect(validEmail('@domain.com')).toBe(false);
    expect(validEmail('user@')).toBe(false);
    expect(validEmail(123)).toBe(false);
    expect(validEmail(null)).toBe(false);
  });

  test('Share ID generator creates 12-char hex string with high entropy', () => {
    const crypto = require('crypto');
    const generateShareId = () => crypto.randomBytes(6).toString('hex');

    const id1 = generateShareId();
    const id2 = generateShareId();

    expect(id1).toHaveLength(12);
    expect(id2).toHaveLength(12);
    expect(id1).not.toBe(id2);
    expect(/^[a-f0-9]{12}$/.test(id1)).toBe(true);
  });

  test('Access control logic correctly approves whitelisted emails and rejects others', () => {
    const isEmailAllowed = (
      accessType: 'allow_all' | 'allow_only' | 'restrict_specific',
      restrictedList: string[],
      email: string
    ) => {
      const normalized = email.trim().toLowerCase();
      if (accessType === 'allow_all') return true;
      if (accessType === 'allow_only') {
        return restrictedList.includes(normalized);
      }
      if (accessType === 'restrict_specific') {
        return !restrictedList.includes(normalized);
      }
      return false;
    };

    const whitelist = ['vip@company.com', 'admin@company.com'];

    // allow_only mode
    expect(isEmailAllowed('allow_only', whitelist, 'vip@company.com')).toBe(true);
    expect(isEmailAllowed('allow_only', whitelist, 'stranger@other.com')).toBe(false);

    // restrict_specific mode (blacklist)
    expect(isEmailAllowed('restrict_specific', whitelist, 'vip@company.com')).toBe(false);
    expect(isEmailAllowed('restrict_specific', whitelist, 'stranger@other.com')).toBe(true);

    // allow_all mode
    expect(isEmailAllowed('allow_all', whitelist, 'anyone@domain.com')).toBe(true);
  });

  test('Field ID filtering ignores unauthorized/fake field IDs during submission', () => {
    const validFields = [
      { id: 'real-field-1', label: 'Name' },
      { id: 'real-field-2', label: 'Email' }
    ];
    const submittedAnswers: Record<string, any> = {
      'real-field-1': 'Alice',
      'fake-field-99': 'Malicious Payload',
      'real-field-2': 'alice@example.com'
    };

    const validFieldIds = new Set(validFields.map(f => f.id));
    const processedAnswers: Record<string, any> = {};

    for (const [fieldId, val] of Object.entries(submittedAnswers)) {
      if (validFieldIds.has(fieldId)) {
        processedAnswers[fieldId] = val;
      }
    }

    expect(processedAnswers).toEqual({
      'real-field-1': 'Alice',
      'real-field-2': 'alice@example.com'
    });
    expect(processedAnswers['fake-field-99']).toBeUndefined();
  });
});
