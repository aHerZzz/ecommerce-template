import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function AuthPanel() {
  const { user, login, register, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === 'login') {
      await login(email, password);
    } else {
      await register(email, password, name);
    }
  };

  if (user) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col gap-2">
        <p className="text-sm text-slate-600">Has iniciado sesión como</p>
        <p className="font-semibold">{user.email}</p>
        <button className="px-3 py-2 bg-primary text-white rounded" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm flex flex-col gap-3">
      <div className="flex gap-3 text-sm">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`px-3 py-2 rounded ${mode === 'login' ? 'bg-primary text-white' : 'bg-slate-100'}`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`px-3 py-2 rounded ${
            mode === 'register' ? 'bg-primary text-white' : 'bg-slate-100'
          }`}
        >
          Crear cuenta
        </button>
      </div>
      {mode === 'register' && (
        <input
          className="border rounded px-3 py-2"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      )}
      <input
        className="border rounded px-3 py-2"
        placeholder="Correo"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="border rounded px-3 py-2"
        placeholder="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="bg-accent text-white py-2 rounded">
        Continuar
      </button>
    </form>
  );
}
