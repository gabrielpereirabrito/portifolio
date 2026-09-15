import { useParams } from 'react-router-dom';

/**
 * Ficha completa de um projeto — casca da frente 03.
 *
 * Slug inexistente precisa cair na 404, nunca em tela branca (ADR-0026);
 * isso entra junto com os dados reais (ADR-0024).
 */
export function FichaProjeto() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <main className="min-h-screen px-6 py-24">
      <h1 className="font-display text-3xl text-accent">Ficha</h1>
      <p className="mt-4 font-mono text-sm text-muted">slug: {slug}</p>
    </main>
  );
}
