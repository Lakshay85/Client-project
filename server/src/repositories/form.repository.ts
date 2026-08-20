import crypto from 'crypto';
import { pool } from '../database/connection.js';
import { RowDataPacket } from 'mysql2';
import { FormFieldRequest } from '../dto/form.dto.js';

/**
 * Repository for form and form field data access operations.
 */
export class FormRepository {
  private generateShareId(): string {
    return crypto.randomBytes(6).toString('hex');
  }

  async create(params: {
    userId: string;
    title: string;
    description: string | null;
    accessType: string;
    restrictedEmails: string[] | null;
    singleSubmissionOnly: boolean;
    fields: FormFieldRequest[];
  }): Promise<{ formId: string; shareId: string }> {
    const formId = crypto.randomUUID();
    const shareId = this.generateShareId();

    await pool.execute(
      'INSERT INTO forms (id, share_id, user_id, title, description, access_type, restricted_emails, single_submission_only) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        formId,
        shareId,
        params.userId,
        params.title,
        params.description,
        params.accessType,
        params.restrictedEmails ? JSON.stringify(params.restrictedEmails) : null,
        params.singleSubmissionOnly,
      ]
    );

    await this.insertFields(formId, params.fields);

    return { formId, shareId };
  }

  async update(params: {
    formId: string;
    userId: string;
    title: string;
    description: string | null;
    accessType: string;
    restrictedEmails: string[] | null;
    singleSubmissionOnly: boolean;
    fields: FormFieldRequest[];
  }): Promise<void> {
    await pool.execute(
      'UPDATE forms SET title = ?, description = ?, access_type = ?, restricted_emails = ?, single_submission_only = ? WHERE id = ? AND user_id = ?',
      [
        params.title,
        params.description,
        params.accessType,
        params.restrictedEmails ? JSON.stringify(params.restrictedEmails) : null,
        params.singleSubmissionOnly,
        params.formId,
        params.userId,
      ]
    );

    await pool.execute('DELETE FROM form_fields WHERE form_id = ?', [params.formId]);
    await this.insertFields(params.formId, params.fields);
  }

  private async insertFields(formId: string, fields: FormFieldRequest[]): Promise<void> {
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      const fieldId = f.id || crypto.randomUUID();
      await pool.execute(
        `INSERT INTO form_fields (id, form_id, label, field_type, placeholder, help_text, is_required, options, config, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fieldId,
          formId,
          f.label || `Question ${i + 1}`,
          f.fieldType || 'text',
          f.placeholder || null,
          f.helpText || null,
          Boolean(f.isRequired),
          f.options ? JSON.stringify(f.options) : null,
          f.config ? JSON.stringify(f.config) : null,
          i,
        ]
      );
    }
  }

  async findAllByUserId(userId: string): Promise<RowDataPacket[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT f.id, f.share_id as shareId, f.title, f.description, f.access_type as accessType, f.restricted_emails as restrictedEmails, f.single_submission_only as singleSubmissionOnly, f.status, f.created_at as createdAt,
              COUNT(DISTINCT s.id) as responseCount,
              COUNT(DISTINCT ff.id) as fieldCount
       FROM forms f
       LEFT JOIN form_submissions s ON s.form_id = f.id
       LEFT JOIN form_fields ff ON ff.form_id = f.id
       WHERE f.user_id = ?
       GROUP BY f.id
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return rows;
  }

  async findByIdAndUserId(formId: string, userId: string): Promise<RowDataPacket | undefined> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, share_id as shareId, title, description, access_type as accessType, restricted_emails as restrictedEmails, single_submission_only as singleSubmissionOnly, status, created_at as createdAt FROM forms WHERE id = ? AND user_id = ?',
      [formId, userId]
    );
    return rows[0];
  }

  async findPublishedByShareId(shareId: string): Promise<RowDataPacket | undefined> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, share_id as shareId, title, description, access_type as accessType, restricted_emails as restrictedEmails, single_submission_only as singleSubmissionOnly, created_at as createdAt FROM forms WHERE share_id = ? AND status = 'published'",
      [shareId]
    );
    return rows[0];
  }

  async findFieldsByFormId(formId: string): Promise<RowDataPacket[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, label, field_type as fieldType, placeholder, help_text as helpText, is_required as isRequired, options, config, sort_order as sortOrder FROM form_fields WHERE form_id = ? ORDER BY sort_order ASC',
      [formId]
    );
    return rows;
  }

  async findFieldsSummaryByFormId(formId: string): Promise<RowDataPacket[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, label, field_type as fieldType, sort_order as sortOrder FROM form_fields WHERE form_id = ? ORDER BY sort_order ASC',
      [formId]
    );
    return rows;
  }

  async findRequiredFieldsByFormId(formId: string): Promise<RowDataPacket[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, label, is_required as isRequired FROM form_fields WHERE form_id = ?',
      [formId]
    );
    return rows;
  }

  async getResponseCount(formId: string): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM form_submissions WHERE form_id = ?',
      [formId]
    );
    return rows[0]?.count || 0;
  }

  async existsByIdAndUserId(formId: string, userId: string): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM forms WHERE id = ? AND user_id = ?',
      [formId, userId]
    );
    return rows.length > 0;
  }

  async deleteByIdAndUserId(formId: string, userId: string): Promise<void> {
    await pool.execute('DELETE FROM forms WHERE id = ? AND user_id = ?', [formId, userId]);
  }
}

export const formRepository = new FormRepository();
