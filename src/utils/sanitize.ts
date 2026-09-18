/**
 * Sanitiza URLs para prevenir ataques XSS baseados em protocolos maliciosos como javascript: ou data:
 * Conforme exigido pela seção 4.1 de /reactspecs.
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Permite URLs seguras (http, https) e caminhos relativos
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }

  // Permite data:image/ seguro gerado pelo Canvas local
  if (trimmed.startsWith('data:image/jpeg;base64,') || trimmed.startsWith('data:image/png;base64,')) {
    return trimmed;
  }

  // Rejeita protocolos perigosos
  return '';
}
