import crypto from 'crypto';
import { pool } from '../database/connection.js';
import { RowDataPacket } from 'mysql2';

/**
 * Repository for form submission and answer data access operations.
 */
export class SubmissionRepository {
  async create(params: {
    formId: string;
    submitterIp: string | null;
    submitterEmail: string;
  }): Promise<string> {
    const submissionId = crypto.randomUUID();
    await pool.execute(
      'INSERT INTO form_submissions (id, form_id, submitter_ip, submitter_email) VALUES (?, ?, ?, ?)',
      [submissionId, params.formId, params.submitterIp, params.submitterEmail]
    );
    return submissionId;
  }

  async insertAnswers(
    submissionId: string,
    answers: Record<string, unknown>,
    validFieldIds: Set<string>
  ): Promise<void> {
    for (const [fieldId, val] of Object.entries(answers)) {
      if (validFieldIds.has(fieldId) && val !== undefined && val !== null) {
        const formattedVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
        await pool.execute(
          'INSERT INTO form_submission_answers (submission_id, field_id, answer_value) VALUES (?, ?, ?)',
          [submissionId, fieldId, formattedVal]
        );
      }
    }
  }

  async findByFormId(formId: string): Promise<RowDataPacket[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, submitted_at as submittedAt, submitter_ip as submitterIp, submitter_email as submitterEmail, status FROM form_submissions WHERE form_id = ? ORDER BY submitted_at DESC',
      [formId]
    );
    return rows;
  }

  async findByIdAndFormId(submissionId: string, formId: string): Promise<RowDataPacket | undefined> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, form_id as formId, submitted_at as submittedAt, submitter_ip as submitterIp, submitter_email as submitterEmail, status FROM form_submissions WHERE id = ? AND form_id = ?',
      [submissionId, formId]
    );
    return rows[0];
  }

  async updateStatus(
    submissionId: string,
    status: 'pending' | 'approved' | 'rejected'
  ): Promise<void> {
    await pool.execute(
      'UPDATE form_submissions SET status = ? WHERE id = ?',
      [status, submissionId]
    );
  }

  async findAnswersBySubmissionIds(
    submissionIds: string[]
  ): Promise<Record<string, Record<string, string>>> {
    if (submissionIds.length === 0) return {};

    const [answers] = await pool.query<RowDataPacket[]>(
      'SELECT submission_id, field_id, answer_value FROM form_submission_answers WHERE submission_id IN (?)',
      [submissionIds]
    );

    const answersMap: Record<string, Record<string, string>> = {};
    answers.forEach((a) => {
      if (!answersMap[a.submission_id]) answersMap[a.submission_id] = {};
      answersMap[a.submission_id][a.field_id] = a.answer_value;
    });

    return answersMap;
  }

  async hasSubmittedByEmail(formId: string, email: string): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM form_submissions WHERE form_id = ? AND LOWER(submitter_email) = ? LIMIT 1',
      [formId, email]
    );
    return rows.length > 0;
  }
}

export const submissionRepository = new SubmissionRepository();
