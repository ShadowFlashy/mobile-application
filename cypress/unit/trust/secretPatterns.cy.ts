import { findSecrets } from '../../../scripts/lib/secretPatterns.mjs';

// Samples are glued together at run time, so this file itself never looks like it holds a secret.
const glue = (...parts: string[]) => parts.join('');
const LONG = 'Abc123Def456Ghi789Jkl012Mno345Pqr678Stu9';

describe('pre-commit secret scan patterns', () => {
  it('catches the Cloudflare Co-Driver secrets (golden rule 1)', () => {
    expect(findSecrets(glue('CLOUDFLARE_API', '_TOKEN=', LONG))).to.include('Cloudflare API token');
    expect(findSecrets(glue('CLOUDFLARE_ACCOUNT', '_ID="', '0123456789abcdef', '0123456789abcdef"'))).to.include(
      'Cloudflare account id',
    );
  });

  it('catches bearer tokens and generic token assignments', () => {
    expect(findSecrets(glue('Authorization: Bear', 'er ', LONG))).to.include('Bearer token');
    expect(findSecrets(glue('const tok', 'en = "', LONG, '"'))).to.include('Generic API key or token assignment');
    expect(findSecrets(glue('api_', 'key: "', LONG, '"'))).to.include('Generic API key or token assignment');
  });

  it('still catches Supabase, Mistral and JWT keys', () => {
    expect(findSecrets(glue('sb_sec', 'ret_', LONG))).to.include('Supabase secret key');
    expect(findSecrets(glue('MISTRAL_API', '_KEY=', LONG))).to.include('Mistral API key assignment');
    expect(findSecrets(glue('ey', 'J', LONG, '.ey', 'J', LONG, '.', LONG))).to.have.length.greaterThan(0);
  });

  it('lets placeholders and references through', () => {
    expect(findSecrets('CLOUDFLARE_API_TOKEN=your-token')).to.deep.equal([]);
    expect(findSecrets('Set the CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN function secrets.')).to.deep.equal([]);
    expect(findSecrets('headers: { Authorization: `Bearer ${session.access_token}` }')).to.deep.equal([]);
    expect(findSecrets('sb_publishable_your-key-here')).to.deep.equal([]);
  });
});
