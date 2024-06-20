const express = require('express');
const adminRoute = express.Router();
const { getAdmin, updateAdmin, generateBackup, getAllBackup, configTaskBackup } = require('./adminService');

// Ruta para listar usuarios
adminRoute.get('', getAdmin)
adminRoute.put('/:id', updateAdmin);
adminRoute.get('/allBackup', getAllBackup);
adminRoute.post('/generateBackups', generateBackup);
adminRoute.post('/taskBackup', configTaskBackup)

module.exports = { adminRoute };
