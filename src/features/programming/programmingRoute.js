const express = require('express');
const programmingRoute = express.Router();
const { getAllCareerByIdStudent,getAllSubjectsByCareer, AddProgramming, getNotesByIdStudent, getAllStudentsByIdEnable, updateNotes, getAllEvaluationByIdStudent, getHistoryByIdStudent } = require('./programmingService');

//Rutas de programacion

programmingRoute.get('/:idStudent', getAllCareerByIdStudent);
programmingRoute.get('/career/:career',getAllSubjectsByCareer);
programmingRoute.post('', AddProgramming);
programmingRoute.get('/notesByIdStudent/:idStudent', getNotesByIdStudent);
programmingRoute.get('/notesHistoryByIdStudent/:idStudent', getHistoryByIdStudent);
programmingRoute.get('/allStudents/:idEnable', getAllStudentsByIdEnable);
programmingRoute.put('/updateNotes', updateNotes);
programmingRoute.get('/evaluation/:idStudent', getAllEvaluationByIdStudent )

module.exports = { programmingRoute};

// the below code fragment can be found in: