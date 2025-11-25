import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export function ContactForm() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!accepted) return;
    setSubmitted(true);
  };

  return (
    <Card title="Contacto" as="section" ariaLabel="Formulario de contacto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" aria-describedby="contact-rgpd">
        <label className="flex flex-col gap-1 text-sm" htmlFor="contact-name">
          Nombre completo
          <input
            id="contact-name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring dark:border-gray-700 dark:bg-surface-dark dark:text-text-dark"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm" htmlFor="contact-email">
          Correo electrónico
          <input
            id="contact-email"
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring dark:border-gray-700 dark:bg-surface-dark dark:text-text-dark"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm" htmlFor="contact-message">
          Mensaje
          <textarea
            id="contact-message"
            name="message"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring dark:border-gray-700 dark:bg-surface-dark dark:text-text-dark"
          />
        </label>
        <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 dark:bg-gray-800 dark:text-slate-200">
          <input
            id="contact-rgpd"
            type="checkbox"
            required
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus-visible:outline-none focus-visible:ring"
            aria-describedby="contact-rgpd-text"
          />
          <p id="contact-rgpd-text">
            Acepto el tratamiento de mis datos para atender mi consulta. Consultar política de privacidad y derechos de acceso,
            rectificación y supresión en el pie de página.
          </p>
        </div>
        <Button type="submit" disabled={!accepted} aria-disabled={!accepted}>
          Enviar consulta
        </Button>
        {submitted && <p className="text-sm text-green-600">Formulario enviado. Te contactaremos pronto.</p>}
      </form>
    </Card>
  );
}
