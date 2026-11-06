import { useEffect, useState, type FormEvent } from 'react';
import { Lock, LogIn, ShieldAlert } from 'lucide-react';
import {
  authenticateCmsUser,
  getLoginRateLimitState,
  MAX_LOGIN_ATTEMPTS,
  recordFailedLoginAttempt,
  resetLoginAttempts,
  saveCmsSession,
  type CmsAuthSession,
} from '../../data/CmsUsers';

interface CmsLoginProps {
  onLoginSuccess?: (session: CmsAuthSession) => void;
}

const fieldClassName =
  'w-full border border-zinc-800 bg-[#070709] px-3.5 py-3 font-mono text-xs text-white outline-none focus:border-[#DC2626] disabled:opacity-50';

const CmsLogin = ({ onLoginSuccess }: CmsLoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(
    () => getLoginRateLimitState().remainingSeconds,
  );

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = window.setInterval(() => {
      const state = getLoginRateLimitState();
      setLockoutSeconds(state.remainingSeconds);
      if (!state.isLocked) {
        setError('');
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [lockoutSeconds]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const rateState = getLoginRateLimitState();
    if (rateState.isLocked) {
      setLockoutSeconds(rateState.remainingSeconds);
      setError(
        `Acceso bloqueado temporalmente por seguridad. Intenta nuevamente en ${rateState.remainingSeconds}s.`,
      );
      return;
    }

    setIsSigningIn(true);
    setError('');

    try {
      const session = authenticateCmsUser(username, password);
      if (!session) {
        const nextLimit = recordFailedLoginAttempt();
        if (nextLimit.isLocked) {
          setLockoutSeconds(nextLimit.remainingSeconds);
          setError(
            `Demasiados intentos fallidos (${MAX_LOGIN_ATTEMPTS}/${MAX_LOGIN_ATTEMPTS}). Acceso bloqueado por ${nextLimit.remainingSeconds} segundos.`,
          );
        } else {
          const remainingTries = Math.max(1, MAX_LOGIN_ATTEMPTS - nextLimit.failedAttempts);
          setError(
            `Usuario o contraseña incorrectos. Intentos restantes antes de bloqueo temporal: ${remainingTries}.`,
          );
        }
        return;
      }

      resetLoginAttempts();
      saveCmsSession(session);
      onLoginSuccess?.(session);
    } finally {
      setIsSigningIn(false);
    }
  };

  const isLockedOut = lockoutSeconds > 0;

  return (
    <div className="flex min-h-[65vh] items-center justify-center bg-[#070709] px-4 py-12 text-[#F4F4F6]">
      <form onSubmit={handleSubmit} className="w-full max-w-md border border-zinc-800 bg-[#0E0E12] p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-[#DC2626]" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Acceso restringido · Protección Anti-Brute-Force
            </p>
            <h1 className="font-display text-2xl font-black uppercase text-white">Administración CMS</h1>
          </div>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-zinc-400">
          Inicia sesión con tu nombre de usuario y contraseña para administrar las publicaciones y el inventario.
        </p>
        <label className="mb-4 block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
            Nombre de usuario
          </span>
          <input
            required
            disabled={isLockedOut}
            type="text"
            maxLength={40}
            autoComplete="username"
            placeholder="manro"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className={fieldClassName}
          />
        </label>
        <label className="mb-5 block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
            Contraseña
          </span>
          <input
            required
            disabled={isLockedOut}
            type="password"
            maxLength={128}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={fieldClassName}
          />
        </label>
        {error && (
          <p
            role="alert"
            className="mb-4 border border-red-900 bg-red-950/40 px-3 py-2 font-mono text-xs leading-relaxed text-red-300"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isSigningIn || isLockedOut}
          className="flex w-full cursor-pointer items-center justify-center gap-2 bg-[#DC2626] px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLockedOut ? (
            <>
              <Lock className="h-4 w-4" /> BLOQUEADO ({lockoutSeconds}S)
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" /> {isSigningIn ? 'VALIDANDO…' : 'INICIAR SESIÓN'}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CmsLogin;
