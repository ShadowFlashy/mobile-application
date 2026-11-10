import {
  canStartVerification,
  formatCountdown,
  isExpired,
  isVerificationCode,
  normalizeVerificationCode,
  ownerCarStatus,
  remainingMs,
  VERIFICATION_ALPHABET,
  VERIFICATION_VALIDITY_MS,
} from '../../../src/utils/verificationCode';

describe('verificationCode: format', () => {
  it('uses the 25-symbol alphabet of the migration (no look-alikes)', () => {
    expect(VERIFICATION_ALPHABET).to.have.length(25);
    for (const lookAlike of ['0', 'O', '1', 'I', 'L', '2', 'Z', '5', 'S', '8', 'B']) {
      expect(VERIFICATION_ALPHABET).not.to.include(lookAlike);
    }
  });

  it('matches the alphabet in supabase/migrations/20261110090000_redline_v2.sql', () => {
    cy.readFile('supabase/migrations/20261110090000_redline_v2.sql').then((sql: string) => {
      expect(sql).to.include(`v_alphabet constant text := '${VERIFICATION_ALPHABET}'`);
    });
  });

  it('accepts only RL- plus 6 symbols of the alphabet', () => {
    expect(isVerificationCode('RL-7K3QX9')).to.equal(true);
    expect(isVerificationCode('RL-7K3QX')).to.equal(false);
    expect(isVerificationCode('RL-7K3QX90')).to.equal(false);
    expect(isVerificationCode('RL-0K3QX9')).to.equal(false);
    expect(isVerificationCode('rl-7k3qx9')).to.equal(false);
    expect(isVerificationCode('XX-7K3QX9')).to.equal(false);
  });

  it('is valid for 30 minutes', () => {
    expect(VERIFICATION_VALIDITY_MS).to.equal(30 * 60 * 1000);
  });
});

describe('verificationCode: normalize', () => {
  it('normalises what was typed or read like complete_owner_verification does', () => {
    expect(normalizeVerificationCode('RL-7K3QX9')).to.equal('RL-7K3QX9');
    expect(normalizeVerificationCode('rl 7k3-qx9')).to.equal('RL-7K3QX9');
    expect(normalizeVerificationCode('7K3QX9')).to.equal('RL-7K3QX9');
    expect(normalizeVerificationCode(' rl.7k3.qx9 ')).to.equal('RL-7K3QX9');
  });

  it('refuses codes of the wrong length or with symbols outside the alphabet', () => {
    expect(normalizeVerificationCode('')).to.equal(undefined);
    expect(normalizeVerificationCode('RL-7K3Q')).to.equal(undefined);
    expect(normalizeVerificationCode('7K3QX9A')).to.equal(undefined);
    expect(normalizeVerificationCode('RL-SK3QX9')).to.equal(undefined);
  });
});

describe('verificationCode: countdown', () => {
  const now = new Date('2026-11-10T20:00:00Z');

  it('counts down the milliseconds left and never goes negative', () => {
    expect(remainingMs('2026-11-10T20:30:00Z', now)).to.equal(30 * 60 * 1000);
    expect(remainingMs('2026-11-10T19:59:00Z', now)).to.equal(0);
    expect(remainingMs('nonsense', now)).to.equal(0);
  });

  it('knows when a code expired', () => {
    expect(isExpired('2026-11-10T20:00:01Z', now)).to.equal(false);
    expect(isExpired('2026-11-10T20:00:00Z', now)).to.equal(true);
  });

  it('formats mm:ss, rounding up so 00:00 shows only at expiry', () => {
    expect(formatCountdown(30 * 60 * 1000)).to.equal('30:00');
    expect(formatCountdown(29 * 60 * 1000 + 59_500)).to.equal('30:00');
    expect(formatCountdown(61_000)).to.equal('01:01');
    expect(formatCountdown(1)).to.equal('00:01');
    expect(formatCountdown(0)).to.equal('00:00');
    expect(formatCountdown(-5000)).to.equal('00:00');
  });
});

describe('verificationCode: car status', () => {
  it('pending cars get nothing; verified cars can be paused', () => {
    expect(ownerCarStatus({ verification: 'pending', pingsPaused: false })).to.equal('pending');
    expect(ownerCarStatus({ verification: 'pending', pingsPaused: true })).to.equal('pending');
    expect(ownerCarStatus({ verification: 'verified', pingsPaused: false })).to.equal('verified');
    expect(ownerCarStatus({ verification: 'verified', pingsPaused: true })).to.equal('paused');
  });

  it('offers verification only to pending cars', () => {
    expect(canStartVerification({ verification: 'pending' })).to.equal(true);
    expect(canStartVerification({ verification: 'verified' })).to.equal(false);
  });
});
