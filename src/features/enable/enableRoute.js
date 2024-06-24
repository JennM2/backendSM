const express = require('express');
const enableRoute = express.Router();
const { getAllActiveEnables, enableSubject, updateEnable, deleteEnable, cleanEnable, getActiveEnablesByTeacherId, getEnablesByIdStudent, finishEnableById, updateEvaluation, getSubjectsByMonth, getPriceSubjectByIdSubject } = require('./enableService');

//Rutas de la habillitacion de materias
enableRoute.get('',getAllActiveEnables);
enableRoute.post('', enableSubject);
enableRoute.put('/:idEnable', updateEnable);
enableRoute.delete('/:idEnable', deleteEnable);
enableRoute.post('/clean', cleanEnable);
enableRoute.get('/teacher', getActiveEnablesByTeacherId);
enableRoute.get('/toProgram/:idStudent', getEnablesByIdStudent);
enableRoute.put('/finish/:idEnable', finishEnableById);
enableRoute.put('/evaluation/:idProgramming',updateEvaluation);
enableRoute.get('/byMonth/:month/:idTeacher', getSubjectsByMonth);
enableRoute.get('/price/:idSubject', getPriceSubjectByIdSubject);

module.exports = { enableRoute };