/**
 * Patterns of the pre-commit secret scan (scripts/check-secrets.mjs), kept apart so the unit tests
 * (cypress/unit/trust/secretPatterns.cy.ts) can check them against positive and negative samples.
 */
export const SECRET_PATTERNS = [
  { name: 'Supabase secret key', regex: /sb_secret_[A-Za-z0-9_-]{10,}/ },
  { name: 'Supabase publishable key (use .env)', regex: /sb_publishable_(?!your-)[A-Za-z0-9_-]{10,}/ },
  {
    name: 'JSON Web Token (e.g. anon or service_role key)',
    regex: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
  },
  { name: 'Private key', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'Anthropic API key', regex: /sk-ant-[A-Za-z0-9_-]{20,}/ },
  { name: 'Mistral API key assignment', regex: /MISTRAL_API_KEY\s*[:=]\s*['"]?[A-Za-z0-9_-]{20,}/ },
  { name: 'Cloudflare API token', regex: /CLOUDFLARE_API_TOKEN\s*[:=]\s*['"]?[A-Za-z0-9_-]{30,}/ },
  { name: 'Cloudflare account id', regex: /CLOUDFLARE_ACCOUNT_ID\s*[:=]\s*['"]?[0-9a-f]{32}/i },
  { name: 'Bearer token', regex: /Bearer\s+[A-Za-z0-9_\-.]{30,}/ },
  {
    name: 'Generic API key or token assignment',
    regex: /(?:api[_-]?(?:key|token)|secret[_-]?key|access[_-]?token|\btoken)\s*[:=]\s*['"][A-Za-z0-9_-]{20,}['"]/i,
  },
];

/** Names of the patterns that match the text (empty when it looks clean). */
export function findSecrets(text) {
  return SECRET_PATTERNS.filter(({ regex }) => regex.test(text)).map(({ name }) => name);
}
