const express = require('express');
const usersRoute = express.Router();
const { getAllUsers, getUserByCI, getUserById, updateUserById, getAllUsersByState, getProfile } = require('./usersService');

// Rutas
usersRoute.get('', getAllUsers);
usersRoute.get('/filter', getAllUsersByState); 
usersRoute.get('/:ci', getUserByCI);
usersRoute.get('/user/:idUser', getUserById);
usersRoute.put('/user/:idUser', updateUserById);
usersRoute.get('/profile/:idUser', getProfile);

// Exportar rutas
module.exports = { usersRoute };