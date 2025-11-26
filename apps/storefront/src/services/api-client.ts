const configuredBaseUrl = import.meta.env.PUBLIC_BACKEND_URL?.trim();

const getBaseUrl = () => {
  if (configuredBaseUrl && configuredBaseUrl.length > 0) {
    return configuredBaseUrl;
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:9000';
  }

  return null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getBaseUrl();

  if (!baseUrl) {
    throw new Error(
      'No se pudo determinar la URL del backend. Configura PUBLIC_BACKEND_URL o inicia el backend local en http://localhost:9000.'
    );
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      credentials: 'include',
      ...init
    });
  } catch (error) {
    throw new Error(
      'No se pudo contactar al backend de Medusa. Verifica PUBLIC_BACKEND_URL y que el servidor esté en ejecución.'
    );
  }

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`API error ${res.status}: ${message || res.statusText}`);
  }
  return (await res.json()) as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' })
};
