import {
  hasErrors,
  validateLogin,
  validateOwnerCar,
  validateRegister,
  validateSpotDetails,
} from '../../src/utils/validation';

const validRegistration = {
  username: 'spotter_jas',
  email: 'jas@example.com',
  password: 'longenough',
  confirmPassword: 'longenough',
};

const validSpot = { make: 'Porsche', model: '911', locationLabel: '', notes: '', plate: '' };
const validOwnerCar = { make: 'Ferrari', model: '296 GTB', nickname: '', plate: '1-ABC-234' };

describe('form validation', () => {
  it('accepts a valid login', () => {
    expect(hasErrors(validateLogin('jas@example.com', 'secret'))).to.equal(false);
  });

  it('rejects an invalid email on login', () => {
    expect(validateLogin('not-an-email', 'secret').email).to.equal('email_invalid');
  });

  it('requires a password on login', () => {
    expect(validateLogin('jas@example.com', '').password).to.equal('password_required');
  });

  it('accepts a valid registration', () => {
    expect(hasErrors(validateRegister(validRegistration))).to.equal(false);
  });

  it('rejects a short password', () => {
    expect(validateRegister({ ...validRegistration, password: 'short', confirmPassword: 'short' }).password).to.equal(
      'password_too_short',
    );
  });

  it('rejects passwords that do not match', () => {
    expect(validateRegister({ ...validRegistration, confirmPassword: 'different1' }).confirmPassword).to.equal(
      'passwords_mismatch',
    );
  });

  it('rejects a username with spaces', () => {
    expect(validateRegister({ ...validRegistration, username: 'two words' }).username).to.equal('username_invalid');
  });

  it('accepts spot details without the optional fields', () => {
    expect(hasErrors(validateSpotDetails(validSpot))).to.equal(false);
  });

  it('requires the brand of a spotted car', () => {
    expect(validateSpotDetails({ ...validSpot, make: ' ' }).make).to.equal('make_required');
  });

  it('only validates the optional plate when it is filled in', () => {
    expect(validateSpotDetails({ ...validSpot, plate: '!' }).plate).to.equal('plate_invalid');
  });

  it('accepts a registered owner car', () => {
    expect(hasErrors(validateOwnerCar(validOwnerCar))).to.equal(false);
  });

  it('requires a plate to register an owner car', () => {
    expect(validateOwnerCar({ ...validOwnerCar, plate: '' }).plate).to.equal('owner_plate_invalid');
  });
});
