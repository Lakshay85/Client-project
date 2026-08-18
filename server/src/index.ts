import 'dotenv/config';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import { pool, testDatabaseConnection } from './database/connection.js';
import { initializeDatabase } from './database/init.js';

type User = RowDataPacket & { id: string; name: string; email: string; password_hash: string | null; google_id?: string | null; status: 'active' | 'disabled'; created_at: Date };
type PublicUser = { id: string; name: string; email: string; createdAt: string };

const port = Number(process.env.PORT ?? 4000);
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret === 'development-only-secret-change-me' || jwtSecret === 'change-this-development-secret-before-deploying') {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing or set to a default value.');
  }
}
const effectiveJwtSecret = jwtSecret || 'development-only-secret-change-me';

const app = express();
app.use(helmet());

const rawAllowedOrigins = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
const allowedOrigins = rawAllowedOrigins.split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || rawAllowedOrigins === '*' || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many authentication attempts, please try again after 15 minutes.' }
});

const submitRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { message: 'Too many form submissions. Please wait a moment before trying again.' }
});

interface OAuthSession {
  token: string;
  user: PublicUser;
  expiresAt: number;
}
const oauthCodeStore = new Map<string, OAuthSession>();

setInterval(() => {
  const now = Date.now();
  for (const [code, session] of oauthCodeStore.entries()) {
    if (session.expiresAt < now) oauthCodeStore.delete(code);
  }
}, 5 * 60 * 1000);

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:4000/api/auth/google/callback';
const googleClient = new OAuth2Client(googleClientId, googleClientSecret, googleRedirectUri);

const publicUser = (user: User): PublicUser => ({ id: user.id, name: user.name, email: user.email, createdAt: new Date(user.created_at).toISOString() });
const issueToken = (user: User) => jwt.sign({ sub: user.id, email: user.email }, effectiveJwtSecret, { expiresIn: '7d' });
const validEmail = (value: unknown): value is string => typeof value === 'string' && /^\S+@\S+\.\S+$/.test(value);
const clientIp = (req: Request) => req.ip || req.socket.remoteAddress || null;

async function findUserByEmail(email: string): Promise<User | undefined> {
  const [rows] = await pool.query<User[]>('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0];
}

async function findUserById(id: string): Promise<User | undefined> {
  const [rows] = await pool.query<User[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0];
}

async function findUserByGoogleId(googleId: string): Promise<User | undefined> {
  const [rows] = await pool.query<User[]>('SELECT * FROM users WHERE google_id = ? LIMIT 1', [googleId]);
  return rows[0];
}

app.get('/api/health', async (_req, res, next) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok', database: 'connected' }); } catch (error) { next(error); }
});

app.post('/api/auth/signup', authRateLimiter, async (req, res, next) => {
  try {
    const { name, email, password } = req.body as Record<string, unknown>;
    if (typeof name !== 'string' || name.trim().length < 2 || !validEmail(email) || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Provide a name, valid email, and password of at least 8 characters.' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    if (await findUserByEmail(normalizedEmail)) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = { id: crypto.randomUUID(), name: name.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12) };
    await pool.execute('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)', [user.id, user.name, user.email, user.passwordHash]);
    const savedUser = await findUserById(user.id);
    if (!savedUser) throw new Error('User was not created.');
    return res.status(201).json({ token: issueToken(savedUser), user: publicUser(savedUser) });
  } catch (error) { next(error); }
});

app.post('/api/auth/login', authRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body as Record<string, unknown>;
    if (!validEmail(email) || typeof password !== 'string') return res.status(400).json({ message: 'Email and password are required.' });
    const user = await findUserByEmail(email.toLowerCase().trim());
    if (!user || user.status !== 'active' || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    await pool.execute('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    await pool.execute('INSERT INTO login_events (user_id, ip_address, user_agent) VALUES (?, ?, ?)', [user.id, clientIp(req), req.get('user-agent')?.slice(0, 500) ?? null]);
    return res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

// --- Google OAuth Routes ---

app.get('/api/auth/google/url', (_req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: 'select_account'
  });
  return res.json({ url });
});

app.get('/api/auth/google', authRateLimiter, (_req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: 'select_account'
  });
  return res.redirect(url);
});

app.get('/api/auth/google/callback', async (req, res, next) => {
  const rawClientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
  const clientOrigin = rawClientOrigin.split(',')[0].trim();
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.redirect(`${clientOrigin}/?auth_error=${encodeURIComponent('Authorization code missing')}`);
    }
    const { tokens } = await googleClient.getToken(code);
    if (!tokens.id_token) {
      return res.redirect(`${clientOrigin}/?auth_error=${encodeURIComponent('Failed to get ID token from Google')}`);
    }
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.redirect(`${clientOrigin}/?auth_error=${encodeURIComponent('Email not returned by Google')}`);
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase().trim();
    const name = payload.name || email.split('@')[0];

    let user = (await findUserByGoogleId(googleId)) || (await findUserByEmail(email));

    if (user) {
      if (user.status !== 'active') {
        return res.redirect(`${clientOrigin}/?auth_error=${encodeURIComponent('Account is disabled')}`);
      }
      if (!user.google_id) {
        await pool.execute('UPDATE users SET google_id = ? WHERE id = ?', [googleId, user.id]);
      }
    } else {
      const userId = crypto.randomUUID();
      await pool.execute(
        'INSERT INTO users (id, name, email, google_id, email_verified_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [userId, name, email, googleId]
      );
      user = await findUserById(userId);
    }

    if (!user) {
      return res.redirect(`${clientOrigin}/?auth_error=${encodeURIComponent('Failed to authenticate user')}`);
    }

    await pool.execute('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    await pool.execute('INSERT INTO login_events (user_id, ip_address, user_agent) VALUES (?, ?, ?)', [user.id, clientIp(req), req.get('user-agent')?.slice(0, 500) ?? null]);

    const token = issueToken(user);
    const exchangeCode = crypto.randomBytes(32).toString('hex');
    oauthCodeStore.set(exchangeCode, {
      token,
      user: publicUser(user),
      expiresAt: Date.now() + 60 * 1000
    });
    return res.redirect(`${clientOrigin}/?oauth_code=${exchangeCode}`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return res.redirect(`${clientOrigin}/?auth_error=${encodeURIComponent('Google authentication failed')}`);
  }
});

app.post('/api/auth/google/exchange', (req, res) => {
  const { code } = req.body as { code?: string };
  if (!code || !oauthCodeStore.has(code)) {
    return res.status(400).json({ message: 'Invalid or expired authorization code.' });
  }
  const session = oauthCodeStore.get(code)!;
  oauthCodeStore.delete(code);
  if (session.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Authorization code has expired.' });
  }
  return res.json({ token: session.token, user: session.user });
});

app.post('/api/auth/google', authRateLimiter, async (req, res, next) => {
  try {
    const { idToken, code, credential } = req.body as { idToken?: string; code?: string; credential?: string };
    const tokenToVerify = idToken || credential;
    let payload: Record<string, any> | undefined;

    if (tokenToVerify) {
      const ticket = await googleClient.verifyIdToken({
        idToken: tokenToVerify,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    } else if (code) {
      const { tokens } = await googleClient.getToken(code);
      if (tokens.id_token) {
        const ticket = await googleClient.verifyIdToken({
          idToken: tokens.id_token,
          audience: googleClientId,
        });
        payload = ticket.getPayload();
      }
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google authentication request or missing email.' });
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase().trim();
    const name = payload.name || email.split('@')[0];

    let user = (await findUserByGoogleId(googleId)) || (await findUserByEmail(email));

    if (user) {
      if (user.status !== 'active') {
        return res.status(403).json({ message: 'Your account has been disabled.' });
      }
      if (!user.google_id) {
        await pool.execute('UPDATE users SET google_id = ? WHERE id = ?', [googleId, user.id]);
      }
    } else {
      const userId = crypto.randomUUID();
      await pool.execute(
        'INSERT INTO users (id, name, email, google_id, email_verified_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [userId, name, email, googleId]
      );
      user = await findUserById(userId);
    }

    if (!user) throw new Error('User creation failed.');

    await pool.execute('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    await pool.execute('INSERT INTO login_events (user_id, ip_address, user_agent) VALUES (?, ?, ?)', [user.id, clientIp(req), req.get('user-agent')?.slice(0, 500) ?? null]);

    return res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

app.get('/api/auth/me', async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required.' });
    const payload = jwt.verify(header.slice(7), effectiveJwtSecret) as jwt.JwtPayload;
    const user = typeof payload.sub === 'string' ? await findUserById(payload.sub) : undefined;
    if (!user || user.status !== 'active') return res.status(401).json({ message: 'User is not available.' });
    return res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});


interface AuthRequest extends Request {
  user?: User;
}

async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required.' });
    const payload = jwt.verify(header.slice(7), effectiveJwtSecret) as jwt.JwtPayload;
    const user = typeof payload.sub === 'string' ? await findUserById(payload.sub) : undefined;
    if (!user || user.status !== 'active') return res.status(401).json({ message: 'User is not available.' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
}

const generateShareId = () => crypto.randomBytes(6).toString('hex');

// --- Form Builder API Routes ---

// 1. Create a new Form
app.post('/api/forms', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { title, description, accessType, restrictedEmails, singleSubmissionOnly, fields } = req.body as {
      title?: string;
      description?: string;
      accessType?: 'allow_all' | 'allow_only' | 'restrict_specific';
      restrictedEmails?: string[];
      singleSubmissionOnly?: boolean;
      fields?: Array<{
        label: string;
        fieldType: string;
        placeholder?: string;
        helpText?: string;
        isRequired?: boolean;
        options?: string[];
        config?: Record<string, unknown>;
      }>;
    };

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Form title is required.' });
    }

    if (!Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ message: 'Form must contain at least one field.' });
    }

    const validAccessType: 'allow_all' | 'allow_only' | 'restrict_specific' =
      accessType === 'allow_only' || accessType === 'restrict_specific'
        ? accessType
        : 'allow_all';

    const normalizedEmails = Array.isArray(restrictedEmails)
      ? Array.from(new Set(restrictedEmails.map(e => String(e).toLowerCase().trim()).filter(e => e && /^\S+@\S+\.\S+$/.test(e))))
      : [];

    if (validAccessType !== 'allow_all' && normalizedEmails.length === 0) {
      return res.status(400).json({
        message: `Please specify at least one valid email address for ${validAccessType === 'allow_only' ? 'allowed' : 'restricted'} access.`
      });
    }

    const formId = crypto.randomUUID();
    const shareId = generateShareId();
    const userId = req.user!.id;
    const isSingleSubmission = singleSubmissionOnly !== undefined ? Boolean(singleSubmissionOnly) : true;

    await pool.execute(
      'INSERT INTO forms (id, share_id, user_id, title, description, access_type, restricted_emails, single_submission_only) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        formId,
        shareId,
        userId,
        title.trim(),
        description?.trim() || null,
        validAccessType,
        normalizedEmails.length > 0 ? JSON.stringify(normalizedEmails) : null,
        isSingleSubmission
      ]
    );

    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      const fieldId = crypto.randomUUID();
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
          i
        ]
      );
    }

    return res.status(201).json({
      message: 'Form created successfully',
      form: { id: formId, shareId, title, description, accessType: validAccessType, restrictedEmails: normalizedEmails, singleSubmissionOnly: isSingleSubmission, fieldCount: fields.length }
    });
  } catch (error) { next(error); }
});

// 2. Get all forms owned by current user
app.get('/api/forms', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
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

    const formattedForms = rows.map(f => ({
      ...f,
      singleSubmissionOnly: Boolean(f.singleSubmissionOnly),
      restrictedEmails: f.restrictedEmails ? (typeof f.restrictedEmails === 'string' ? JSON.parse(f.restrictedEmails) : f.restrictedEmails) : []
    }));

    return res.json({ forms: formattedForms });
  } catch (error) { next(error); }
});

// 3. Get single form details (for creator)
app.get('/api/forms/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const [forms] = await pool.query<RowDataPacket[]>(
      'SELECT id, share_id as shareId, title, description, access_type as accessType, restricted_emails as restrictedEmails, single_submission_only as singleSubmissionOnly, status, created_at as createdAt FROM forms WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (forms.length === 0) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    const form = forms[0];
    const [fields] = await pool.query<RowDataPacket[]>(
      'SELECT id, label, field_type as fieldType, placeholder, help_text as helpText, is_required as isRequired, options, config, sort_order as sortOrder FROM form_fields WHERE form_id = ? ORDER BY sort_order ASC',
      [id]
    );

    const [submissions] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM form_submissions WHERE form_id = ?',
      [id]
    );

    return res.json({
      form: {
        ...form,
        singleSubmissionOnly: Boolean(form.singleSubmissionOnly),
        restrictedEmails: form.restrictedEmails ? (typeof form.restrictedEmails === 'string' ? JSON.parse(form.restrictedEmails) : form.restrictedEmails) : [],
        fields: fields.map(f => ({
          ...f,
          isRequired: Boolean(f.isRequired),
          options: f.options ? (typeof f.options === 'string' ? JSON.parse(f.options) : f.options) : [],
          config: f.config ? (typeof f.config === 'string' ? JSON.parse(f.config) : f.config) : {}
        })),
        responseCount: submissions[0]?.count || 0
      }
    });
  } catch (error) { next(error); }
});

// 4. Update an existing Form (creator only)
app.put('/api/forms/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { title, description, accessType, restrictedEmails, singleSubmissionOnly, fields } = req.body as {
      title?: string;
      description?: string;
      accessType?: 'allow_all' | 'allow_only' | 'restrict_specific';
      restrictedEmails?: string[];
      singleSubmissionOnly?: boolean;
      fields?: Array<{
        id?: string;
        label: string;
        fieldType: string;
        placeholder?: string;
        helpText?: string;
        isRequired?: boolean;
        options?: string[];
        config?: Record<string, unknown>;
      }>;
    };

    const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM forms WHERE id = ? AND user_id = ?', [id, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Form not found or unauthorized.' });
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Form title is required.' });
    }

    if (!Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ message: 'Form must contain at least one field.' });
    }

    const validAccessType: 'allow_all' | 'allow_only' | 'restrict_specific' =
      accessType === 'allow_only' || accessType === 'restrict_specific'
        ? accessType
        : 'allow_all';

    const normalizedEmails = Array.isArray(restrictedEmails)
      ? Array.from(new Set(restrictedEmails.map(e => String(e).toLowerCase().trim()).filter(e => e && /^\S+@\S+\.\S+$/.test(e))))
      : [];

    if (validAccessType !== 'allow_all' && normalizedEmails.length === 0) {
      return res.status(400).json({
        message: `Please specify at least one valid email address for ${validAccessType === 'allow_only' ? 'allowed' : 'restricted'} access.`
      });
    }

    const isSingleSubmission = Boolean(singleSubmissionOnly);

    await pool.execute(
      'UPDATE forms SET title = ?, description = ?, access_type = ?, restricted_emails = ?, single_submission_only = ? WHERE id = ? AND user_id = ?',
      [
        title.trim(),
        description?.trim() || null,
        validAccessType,
        normalizedEmails.length > 0 ? JSON.stringify(normalizedEmails) : null,
        isSingleSubmission,
        id,
        userId
      ]
    );

    // Replace fields
    await pool.execute('DELETE FROM form_fields WHERE form_id = ?', [id]);

    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      const fieldId = f.id || crypto.randomUUID();
      await pool.execute(
        `INSERT INTO form_fields (id, form_id, label, field_type, placeholder, help_text, is_required, options, config, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fieldId,
          id,
          f.label || `Question ${i + 1}`,
          f.fieldType || 'text',
          f.placeholder || null,
          f.helpText || null,
          Boolean(f.isRequired),
          f.options ? JSON.stringify(f.options) : null,
          f.config ? JSON.stringify(f.config) : null,
          i
        ]
      );
    }

    return res.json({
      message: 'Form updated successfully',
      form: { id, title, description, accessType: validAccessType, restrictedEmails: normalizedEmails, singleSubmissionOnly: isSingleSubmission }
    });
  } catch (error) { next(error); }
});

// 5. Delete form
app.delete('/api/forms/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    await pool.execute('DELETE FROM forms WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ message: 'Form deleted successfully.' });
  } catch (error) { next(error); }
});

// 6. Get responses for a form (for creator)
app.get('/api/forms/:id/responses', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check ownership
    const [forms] = await pool.query<RowDataPacket[]>(
      'SELECT id, title FROM forms WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (forms.length === 0) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    const [fields] = await pool.query<RowDataPacket[]>(
      'SELECT id, label, field_type as fieldType, sort_order as sortOrder FROM form_fields WHERE form_id = ? ORDER BY sort_order ASC',
      [id]
    );

    const [submissions] = await pool.query<RowDataPacket[]>(
      'SELECT id, submitted_at as submittedAt, submitter_ip as submitterIp, submitter_email as submitterEmail FROM form_submissions WHERE form_id = ? ORDER BY submitted_at DESC',
      [id]
    );

    const submissionIds = submissions.map(s => s.id);
    let answersMap: Record<string, Record<string, string>> = {};

    if (submissionIds.length > 0) {
      const [answers] = await pool.query<RowDataPacket[]>(
        `SELECT submission_id, field_id, answer_value FROM form_submission_answers WHERE submission_id IN (?)`,
        [submissionIds]
      );

      answers.forEach(a => {
        if (!answersMap[a.submission_id]) answersMap[a.submission_id] = {};
        answersMap[a.submission_id][a.field_id] = a.answer_value;
      });
    }

    const formattedSubmissions = submissions.map(s => ({
      id: s.id,
      submittedAt: s.submittedAt,
      submitterIp: s.submitterIp,
      submitterEmail: s.submitterEmail,
      answers: answersMap[s.id] || {}
    }));

    return res.json({
      formTitle: forms[0].title,
      fields,
      submissions: formattedSubmissions
    });
  } catch (error) { next(error); }
});

// 7. Public Form Details (Accessible via share link)
app.get('/api/public/forms/:shareId', async (req, res, next) => {
  try {
    const { shareId } = req.params;
    const [forms] = await pool.query<RowDataPacket[]>(
      "SELECT id, share_id as shareId, title, description, access_type as accessType, restricted_emails as restrictedEmails, single_submission_only as singleSubmissionOnly, created_at as createdAt FROM forms WHERE share_id = ? AND status = 'published'",
      [shareId]
    );

    if (forms.length === 0) {
      return res.status(404).json({ message: 'Form not found or is no longer available.' });
    }

    const form = forms[0];
    const [fields] = await pool.query<RowDataPacket[]>(
      'SELECT id, label, field_type as fieldType, placeholder, help_text as helpText, is_required as isRequired, options, config, sort_order as sortOrder FROM form_fields WHERE form_id = ? ORDER BY sort_order ASC',
      [form.id]
    );

    const isRestricted = (form.accessType || 'allow_all') !== 'allow_all';
    const isSingleSubmission = Boolean(form.singleSubmissionOnly);

    return res.json({
      form: {
        id: form.id,
        shareId: form.shareId,
        title: form.title,
        description: form.description,
        accessType: form.accessType || 'allow_all',
        singleSubmissionOnly: isSingleSubmission,
        isRestricted,
        fields: fields.map(f => ({
          ...f,
          isRequired: Boolean(f.isRequired),
          options: f.options ? (typeof f.options === 'string' ? JSON.parse(f.options) : f.options) : [],
          config: f.config ? (typeof f.config === 'string' ? JSON.parse(f.config) : f.config) : {}
        }))
      }
    });
  } catch (error) { next(error); }
});

// 8. Public Form Submission with Access Enforcement
app.post('/api/public/forms/:shareId/submit', submitRateLimiter, async (req, res, next) => {
  try {
    const { shareId } = req.params;
    const { answers, submitterEmail } = req.body as { answers?: Record<string, unknown>; submitterEmail?: string };

    const [forms] = await pool.query<RowDataPacket[]>(
      "SELECT id, title, access_type as accessType, restricted_emails as restrictedEmails, single_submission_only as singleSubmissionOnly FROM forms WHERE share_id = ? AND status = 'published'",
      [shareId]
    );

    if (forms.length === 0) {
      return res.status(404).json({ message: 'Form not found or is closed for submissions.' });
    }

    const form = forms[0];
    const formId = form.id;
    const isSingleSubmission = Boolean(form.singleSubmissionOnly);

    // Validate submitter email
    let emailToUse = typeof submitterEmail === 'string' ? submitterEmail.trim().toLowerCase() : '';

    // Also check Bearer token if header present and email wasn't explicitly passed
    if (!emailToUse && req.headers.authorization?.startsWith('Bearer ')) {
      try {
        const payload = jwt.verify(req.headers.authorization.slice(7), effectiveJwtSecret) as jwt.JwtPayload;
        if (typeof payload.email === 'string') {
          emailToUse = payload.email.trim().toLowerCase();
        }
      } catch (e) { }
    }

    // Auto-detect email from answers if submitterEmail was not explicitly provided
    if (!emailToUse && answers && typeof answers === 'object') {
      for (const val of Object.values(answers)) {
        if (typeof val === 'string' && /^\S+@\S+\.\S+$/.test(val.trim())) {
          emailToUse = val.trim().toLowerCase();
          break;
        }
      }
    }

    // Single Submission Only Enforcement
    if (isSingleSubmission) {
      if (!validEmail(emailToUse)) {
        return res.status(400).json({
          message: 'Please enter a valid email address. This form is configured to allow only 1 submission per user.'
        });
      }

      const [priorSubmissions] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM form_submissions WHERE form_id = ? AND LOWER(submitter_email) = ? LIMIT 1',
        [formId, emailToUse]
      );

      if (priorSubmissions.length > 0) {
        return res.status(403).json({
          message: `You have already submitted a response to this form (${emailToUse}). This form allows only 1 submission per user.`
        });
      }
    }

    // Strict access control evaluation
    const accessType = form.accessType || 'allow_all';
    const rawRestricted = form.restrictedEmails;
    const restrictedList: string[] = Array.isArray(rawRestricted)
      ? rawRestricted.map(e => String(e).trim().toLowerCase())
      : typeof rawRestricted === 'string'
        ? (JSON.parse(rawRestricted) as string[]).map(e => String(e).trim().toLowerCase())
        : [];

    if (accessType !== 'allow_all') {
      if (!validEmail(emailToUse)) {
        return res.status(400).json({ message: 'Please enter a valid email address to verify your permission to submit this form.' });
      }
      if (accessType === 'allow_only') {
        if (!restrictedList.includes(emailToUse)) {
          return res.status(403).json({
            message: `Access Denied: The email address '${emailToUse}' is not authorized to submit responses for this form.`
          });
        }
      } else if (accessType === 'restrict_specific') {
        if (restrictedList.includes(emailToUse)) {
          return res.status(403).json({
            message: `Access Denied: The email address '${emailToUse}' is restricted from submitting responses for this form.`
          });
        }
      }
    }

    const [fields] = await pool.query<RowDataPacket[]>(
      'SELECT id, label, is_required as isRequired FROM form_fields WHERE form_id = ?',
      [formId]
    );

    // Validate required fields
    if (answers) {
      for (const field of fields) {
        if (field.isRequired) {
          const val = answers[field.id];
          if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
            return res.status(400).json({ message: `"${field.label}" is required.` });
          }
        }
      }
    }

    const submissionId = crypto.randomUUID();
    const ip = clientIp(req);

    await pool.execute(
      'INSERT INTO form_submissions (id, form_id, submitter_ip, submitter_email) VALUES (?, ?, ?, ?)',
      [submissionId, formId, ip, emailToUse]
    );

    const validFieldIds = new Set(fields.map(f => f.id));

    if (answers && typeof answers === 'object') {
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

    return res.status(201).json({ message: 'Response submitted successfully!', submissionId });
  } catch (error) { next(error); }
});

app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
  }
  res.status(500).json({ message: 'An internal server error occurred.' });
});

async function startServer() {
  try {
    console.log('Initializing MySQL database schema...');
    await initializeDatabase();
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      console.error('❌ Warning: MySQL database connection failed.');
      process.exit(1);
    }
    console.log('✅ MySQL Database connected successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize MySQL database:', error);
    process.exit(1);
  }

  app.listen(port, () => console.log(`API running at http://localhost:${port}`));
}

startServer();
