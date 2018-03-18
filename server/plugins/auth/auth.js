const isEmpty = require('lodash/isEmpty');
const bcrypt = require('bcrypt');
const { unauthorized } = require('boom');
const { generateToken } = require('./helper');

module.exports = class Auth {
  constructor(options) {
    this.alg = options.alg;
    this.secret = options.secret;
    this.issuer = options.issuer;
    this.audience = options.audience;
    this.UserModel = options.UserModel;
    this.accessTokenTTL = options.accessTokenTTL;
    this.refreshTokenTTL = options.refreshTokenTTL;
  }

  static isValidGrantType({ grant_type: grantType, password, username }) {
    switch (grantType) {
      case 'password':
        return !isEmpty(password) && !isEmpty(username);
      default:
        return false;
    }
  }

  async authenticate(body) {
    const validGrantType = Auth.isValidGrantType(body);

    if (!validGrantType) {
      throw unauthorized();
    }

    const { username, password } = body;

    const user = await this.UserModel.findOne({ email: username }).select('+password id');

    if (!user || !await bcrypt.compare(password, user.password)) {
      throw unauthorized();
    }

    const options = {
      alg: this.alg,
      secret: this.secret,
      iss: this.issuer,
      aud: this.audience,
      ttl: this.accessTokenTTL
    };
    const accessToken = generateToken(user.id, options);
    const refreshToken = generateToken(user.id, { ...options, ttl: this.refreshTokenTTL });
    const expiresIn = this.accessTokenTTL;
    const tokenType = 'Bearer';

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
      token_type: tokenType
    };
  }
};
