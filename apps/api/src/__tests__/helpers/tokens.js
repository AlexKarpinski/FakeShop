const { signAccessToken } = require('../../utils/jwt');

function makeToken({ sub = 'u1', role = 'user', email = 'user@example.com' } = {}) {
  return signAccessToken({
    _id: sub,
    role,
    email,
  });
}

module.exports = {
  makeToken,
};
