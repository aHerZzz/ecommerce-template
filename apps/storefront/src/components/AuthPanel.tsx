import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export function AuthPanel() {
  const { user, login, register, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [consent, setConsent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === 'register' && !consent) return;
    if (mode === 'login') {
      await login(email, password);
    } else {
      await register(email, password, name);
    }
  };

  const helper =
    'Usaremos tus datos únicamente para crear tu cuenta y ofrecerte soporte. Puedes solicitar la baja o ejercer tus derechos RGPD desde tu perfil.';

  if (user) {
    return (
      <Card title="Sesión activa" ariaLabel="Estado de sesión">
        <p className="text-sm text-slate-600 dark:text-slate-200">Has iniciado sesión como</p>
        <p className="font-semibold text-primary dark:text-text-dark">{user.email}</p>
        <Button onClick={logout} aria-label="Cerrar sesión">
          Cerrar sesión
        </Button>
      </Card>
    );
  }

  return (
    <Card title="Acceso" ariaLabel="Panel de autenticación">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" aria-describedby="auth-rgpd">
        <div className="flex gap-3 text-sm" role="tablist" aria-label="Seleccionar modo de acceso">
          <Button
            type="button"
            variant={mode === 'login' ? 'primary' : 'secondary'}
            aria-pressed={mode === 'login'}
            onClick={() => {
              setMode('login');
              setConsent(false);
            }}
          >
            Iniciar sesión
          </Button>
          <Button
            type="button"
            variant={mode === 'register' ? 'primary' : 'secondary'}
            aria-pressed={mode === 'register'}
            onClick={() => setMode('register')}
          >
            Crear cuenta
          </Button>
        </div>
        {mode === 'register' && (
          <label className="flex flex-col gap-1 text-sm" htmlFor="auth-name">
            Nombre completo
            <input
              id="auth-name"
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring dark:border-gray-700 dark:bg-surface-dark dark:text-text-dark"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm" htmlFor="auth-email">
          Correo
          <input
            id="auth-email"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring dark:border-gray-700 dark:bg-surface-dark dark:text-text-dark"
            placeholder="Correo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm" htmlFor="auth-password">
          Contraseña
          <input
            id="auth-password"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring dark:border-gray-700 dark:bg-surface-dark dark:text-text-dark"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {mode === 'register' && (
          <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 dark:bg-gray-800 dark:text-slate-200">
            <input
              id="auth-rgpd"
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus-visible:outline-none focus-visible:ring"
              aria-describedby="auth-rgpd-text"
            />
            <p id="auth-rgpd-text">{helper}</p>
          </div>
        )}
        <Button type="submit" disabled={mode === 'register' && !consent} aria-disabled={mode === 'register' && !consent}>
          Continuar
        </Button>
      </form>
    </Card>
  );
}
