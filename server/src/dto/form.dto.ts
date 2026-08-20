import { AccessType } from '../types/index.js';
import { safeJsonParse } from '../utils/json-helpers.js';
import { RowDataPacket } from 'mysql2';

/** Inbound form create/update request body. */
export interface FormCreateRequest {
  title?: string;
  description?: string;
  accessType?: AccessType;
  restrictedEmails?: string[];
  singleSubmissionOnly?: boolean;
  fields?: FormFieldRequest[];
}

export interface FormFieldRequest {
  id?: string;
  label: string;
  fieldType: string;
  placeholder?: string;
  helpText?: string;
  isRequired?: boolean;
  options?: string[];
  config?: Record<string, unknown>;
}

/** Format a raw form DB row into a client-friendly shape. */
export function formatFormRow(row: RowDataPacket): Record<string, unknown> {
  return {
    ...row,
    singleSubmissionOnly: Boolean(row.singleSubmissionOnly),
    restrictedEmails: safeJsonParse<string[]>(row.restrictedEmails, []),
  };
}

/** Format a raw form field DB row into a client-friendly shape. */
export function formatFieldRow(row: RowDataPacket): Record<string, unknown> {
  return {
    ...row,
    isRequired: Boolean(row.isRequired),
    options: safeJsonParse<string[]>(row.options, []),
    config: safeJsonParse<Record<string, unknown>>(row.config, {}),
  };
}
