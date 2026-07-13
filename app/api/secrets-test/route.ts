/**
 * Ruta de prueba del SDK de Tek Secrets — SOLO servidor.
 * Abre en el navegador: http://localhost:3000/api/secrets-test
 * El console.log aparece en la TERMINAL (no en la consola del browser).
 *
 * El service token nunca llega al cliente: se lee de process.env en el servidor.
 */
import { NextResponse } from 'next/server';
import { createClient, TekSecretsError } from '@secrets-27222633/sdk';

export const runtime = 'nodejs'; // el SDK usa process.env + fetch (no edge)
export const dynamic = 'force-dynamic'; // no cachear la respuesta

export async function GET() {
  try {
    const client = createClient(); // token/env/baseUrl desde process.env
    const secrets = await client.getSecrets();
    const keys = Object.keys(secrets);
    return NextResponse.json({ ok: true, count: keys.length, keys, secrets });
  } catch (err) {
    if (err instanceof TekSecretsError) {
      console.error('[secrets-test]', err.name, '-', err.message);
      return NextResponse.json(
        { ok: false, error: err.name, message: err.message },
        { status: 400 },
      );
    }
    console.error('[secrets-test] error inesperado:', err);
    return NextResponse.json({ ok: false, error: 'Unknown' }, { status: 500 });
  }
}
