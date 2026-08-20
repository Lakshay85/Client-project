/** Inbound submission request body. */
export interface SubmissionRequest {
  answers?: Record<string, unknown>;
  submitterEmail?: string;
}

/** Formatted submission for API response. */
export interface FormattedSubmission {
  id: string;
  submittedAt: string;
  submitterIp: string | null;
  submitterEmail: string | null;
  answers: Record<string, string>;
}
