import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';

const CONSENT_KEY = 'cookie-consent';

type ConsentState = 'accepted' | 'rejected' | null;

function enableDeferredScripts() {
  const blockedScripts = document.querySelectorAll<HTMLScriptElement>('script[data-requires-consent]');

  blockedScripts.forEach((script) => {
    if (script.dataset.consentRestored === 'true') return;
    const newScript = document.createElement('script');
    Array.from(script.attributes).forEach(({ name, value }) => {
      if (name !== 'type' && name !== 'data-requires-consent') {
        newScript.setAttribute(name, value);
      }
    });
    newScript.textContent = script.textContent;
    newScript.dataset.consentRestored = 'true';
    script.parentNode?.insertBefore(newScript, script.nextSibling);
  });
}

export default function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState>(() => {
    if (typeof window === 'undefined') return null;
    return (localStorage.getItem(CONSENT_KEY) as ConsentState) ?? null;
  });

  useEffect(() => {
    if (!consent) {
      document
        .querySelectorAll<HTMLScriptElement>('script[data-requires-consent]')
        .forEach((script) => {
          script.type = 'text/plain';
        });
    }
    if (consent === 'accepted') {
      enableDeferredScripts();
    }
  }, [consent]);

  const handleConsent = (value: ConsentState) => {
    setConsent(value);
    if (value) {
      localStorage.setItem(CONSENT_KEY, value);
    }
  };

  if (consent) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-4">
      <Card
        as="section"
        ariaLabel="Aviso de cookies"
        className="mx-auto max-w-4xl bg-white/95 backdrop-blur dark:bg-gray-900/90"
        footer={
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Button variant="secondary" onClick={() => handleConsent('rejected')}>
              Rechazar
            </Button>
            <Button variant="primary" onClick={() => handleConsent('accepted')}>
              Aceptar y continuar
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-700 dark:text-slate-200">
          Utilizamos cookies propias y de terceros para analizar el tráfico y personalizar la experiencia. No
          cargaremos scripts de analítica o seguimiento hasta que aceptes el uso de cookies.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-300">
          Puedes cambiar tu decisión en cualquier momento borrando el consentimiento almacenado en tu navegador.
        </p>
      </Card>
    </div>
  );
}
