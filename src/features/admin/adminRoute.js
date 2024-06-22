const express = require('express');
const adminRoute = express.Router();
const { getAdmin, updateAdmin, generateBackup, getAllBackup, configTaskBackup, addAdmin } = require('./adminService');

// Ruta para listar usuarios
adminRoute.get('', getAdmin)
adminRoute.put('/:id', updateAdmin);
adminRoute.get('/allBackup', getAllBackup);
adminRoute.post('', addAdmin);
adminRoute.post('/generateBackups', generateBackup);
adminRoute.post('/taskBackup', configTaskBackup)

module.exports = { adminRoute };
