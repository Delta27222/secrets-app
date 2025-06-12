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
