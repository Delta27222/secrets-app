/** Comprueba que cada línea con contenido (que no sea comentario) tenga formato KEY=VALUE. */
export function validateEnvText(
  text: string,
): { ok: true } | { ok: false; message: string } {
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      return {
        ok: false,
        message: `Línea ${i + 1}: usa el formato KEY=VALUE (falta «=»).`,
      };
    }
    if (eq === 0) {
      return {
        ok: false,
        message: `Línea ${i + 1}: indica un nombre de variable antes de «=».`,
      };
    }
    const key = trimmed.slice(0, eq).trim();
    if (!key) {
      return {
        ok: false,
        message: `Línea ${i + 1}: el nombre de la variable no puede estar vacío.`,
      };
    }
  }
  return { ok: true };
}

export const parseEnvText = (text: string): Record<string, string> => {
  const secrets: Record<string, string> = {};

  // Dividir por líneas y procesar cada una
  text.split("\n").forEach((line) => {
    // Ignorar líneas vacías o comentarios
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) return;

    // Buscar el primer signo igual que no esté escapado
    const equalIndex = trimmedLine.indexOf("=");
    if (equalIndex > 0) {
      const key = trimmedLine.substring(0, equalIndex).trim();
      let value = trimmedLine.substring(equalIndex + 1).trim();

      // Eliminar comillas si están presentes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.substring(1, value.length - 1);
      }

      secrets[key] = value;
    }
  });

  return secrets;
};
