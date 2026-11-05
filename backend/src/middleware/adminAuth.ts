import type { NextFunction, Request, Response } from 'express';
import { getFirebaseAuth } from '../config/firebase.js';
import usersDictionary from '../../../data/post-users.json' with { type: 'json' };

export interface AdminRequest extends Request {
  adminEmail?: string;
}

const allowedAdminEmails = new Set(
  (process.env.CMS_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

const allowedDictionaryUsers = new Set(
  Object.keys(usersDictionary).map((username) => username.trim().toLowerCase()),
);

export const requireAdmin = async (
  request: AdminRequest,
  response: Response,
  next: NextFunction,
) => {
  const cmsUserHeader = request.header('x-cms-user')?.trim().toLowerCase();
  if (cmsUserHeader && allowedDictionaryUsers.has(cmsUserHeader)) {
    request.adminEmail = cmsUserHeader;
    next();
    return;
  }

  const authorization = request.header('authorization');
  const match = authorization?.match(/^Bearer ([^\s]+)$/);
  if (!match) {
    response.status(401).json({ error: 'Inicia sesión con una cuenta administradora.' });
    return;
  }

  try {
    const token = await getFirebaseAuth().verifyIdToken(match[1]);
    const email = token.email?.trim().toLowerCase();
    const isAllowlisted = token.email_verified === true && !!email && allowedAdminEmails.has(email);
    if (token.admin !== true && !isAllowlisted) {
      response.status(403).json({ error: 'Tu cuenta no tiene permisos de administración del CMS.' });
      return;
    }

    request.adminEmail = email;
    next();
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error
      ? error.code
      : undefined;
    const invalidTokenCodes = new Set([
      'auth/argument-error',
      'auth/id-token-expired',
      'auth/id-token-revoked',
      'auth/invalid-id-token',
      'auth/user-disabled',
      'auth/user-not-found',
    ]);
    if (typeof code === 'string' && invalidTokenCodes.has(code)) {
      response.status(401).json({ error: 'La sesión expiró o no es válida. Inicia sesión de nuevo.' });
      return;
    }
    console.error('No se pudo validar la sesión administrativa:', error);
    next(error);
  }
};
