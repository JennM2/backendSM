const express = require('express');
const studentsRoute = express.Router();
const { getAllStudents, addStudent, updateStudent, getAllStudentsByCareer, getStudentsById } = require('./studentsService');

// Ruta para listar estudiantes
studentsRoute.get('', getAllStudents);
studentsRoute.get('/career/:idCareer', getAllStudentsByCareer);
studentsRoute.get('/:idStudent',getStudentsById);
studentsRoute.post('', addStudent);
studentsRoute.put('/:idStudent', updateStudent);

module.exports = { studentsRoute };
