const express = require('express');
const studyPlanRoute = express.Router();
const { getAllStudyPlan } = require('./studyPlanService');

//rutas de plan de estudio

studyPlanRoute.get('/:idStudent', getAllStudyPlan);

module.exports = { studyPlanRoute };