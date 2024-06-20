const express = require('express');
const adminRoute = express.Router();
const { getAdmin, updateAdmin } = require('./adminService');

// Ruta para listar usuarios
adminRoute.get('', getAdmin)
adminRoute.put('/:id', updateAdmin);

module.exports = { adminRoute };
