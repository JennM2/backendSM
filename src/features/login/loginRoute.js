const express = require('express');
const loginRoute = express.Router();
const { login } = require('./loginService');

//rutas para el login

loginRoute.post('', login);

module.exports = { loginRoute };

