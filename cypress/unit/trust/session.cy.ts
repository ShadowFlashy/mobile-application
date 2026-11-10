import { parseStoredSession } from '../../../src/utils/storedSession';

// The offline-session fallback reads the user out of the session Supabase stored (SPEC §13.3).
describe('parseStoredSession', () => {
  const user = {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'tester@redline.test',
    user_metadata: { username: 'tester' },
  };
  const session = {
    access_token: 'header.payload.signature',
    refresh_token: 'refresh-token',
    expires_at: 1700000000,
    user,
  };

  it('reads id, email and username from the current session shape', () => {
    expect(parseStoredSession(JSON.stringify(session))).to.deep.equal({
      user: { id: user.id, email: 'tester@redline.test', name: 'tester' },
      expiresAt: new Date(1700000000 * 1000).toISOString(),
    });
  });

  it('also reads an expired session (that is the point of the fallback)', () => {
    expect(parseStoredSession(JSON.stringify({ ...session, expires_at: 1 }))?.user.id).to.equal(user.id);
  });

  it('accepts the older { currentSession } wrapper', () => {
    const wrapped = JSON.stringify({ currentSession: session, expiresAt: 1 });
    expect(parseStoredSession(wrapped)?.user.name).to.equal('tester');
  });

  it('falls back to the email name, then to "spotter"', () => {
    const noName = { ...session, user: { id: user.id, email: 'kim@example.com', user_metadata: {} } };
    expect(parseStoredSession(JSON.stringify(noName))?.user.name).to.equal('kim');
    const bare = { ...session, user: { id: user.id } };
    expect(parseStoredSession(JSON.stringify(bare))?.user).to.deep.equal({ id: user.id, email: '', name: 'spotter' });
  });

  it('never returns tokens', () => {
    const parsed = JSON.stringify(parseStoredSession(JSON.stringify(session)));
    expect(parsed).not.to.contain('refresh-token');
    expect(parsed).not.to.contain('header.payload.signature');
  });

  it('rejects missing, corrupt and incomplete sessions', () => {
    expect(parseStoredSession(null)).to.equal(undefined);
    expect(parseStoredSession(undefined)).to.equal(undefined);
    expect(parseStoredSession('')).to.equal(undefined);
    expect(parseStoredSession('{not json')).to.equal(undefined);
    expect(parseStoredSession('[]')).to.equal(undefined);
    expect(parseStoredSession('"text"')).to.equal(undefined);
    expect(parseStoredSession(JSON.stringify({ ...session, user: undefined }))).to.equal(undefined);
    expect(parseStoredSession(JSON.stringify({ ...session, user: { email: 'x@y.z' } }))).to.equal(undefined);
    expect(parseStoredSession(JSON.stringify({ ...session, refresh_token: undefined }))).to.equal(undefined);
  });
});
