'use strict'
const tokenHelper = require('../common/tokenHelper');

var checkToken = function (req, res, next) {
    tokenHelper.refreshToken(req, res, next);
};

module.exports = checkToken;