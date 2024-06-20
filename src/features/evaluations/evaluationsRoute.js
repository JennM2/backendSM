const express = require('express');
const evaluationsRoute = express.Router();
const { getMonthlyEvaluations } = require('./evaluationsService');

//Rutas para obtener las calificaiones de estudiantes
evaluationsRoute.get('/moth', getMonthlyEvaluations);

module.exports = { evaluationsRoute };