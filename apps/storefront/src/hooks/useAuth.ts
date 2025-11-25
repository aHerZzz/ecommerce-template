import { useEffect, useState } from 'react';

type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
};

const STORAGE_KEY = 'storefront_auth';

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, token: null });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setState(JSON.parse(raw));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const login = async (email: string, password: string) => {
    // Replace with backend request
    const fakeToken = btoa(`${email}:${password}`);
    const user: AuthUser = { id: email, email };
    setState({ user, token: fakeToken });
    return user;
  };

  const register = async (email: string, password: string, name?: string) => {
    // Replace with backend request
    const user: AuthUser = { id: email, email, name };
    setState({ user, token: btoa(`${email}:${password}`) });
    return user;
  };

  const logout = () => {
    setState({ user: null, token: null });
  };

  return {
    user: state.user,
    token: state.token,
    login,
    register,
    logout
  };
}
