const express = require('express');
const teachersRoute = express.Router();
const { getAllTeachers, addTeacher, updateTeacher, getTeacherByName, disableTeacher, getAllEvaluationByIdTeacher } = require('./teachersService');

// Ruta para listar profesores
teachersRoute.get('', getAllTeachers);
teachersRoute.get('/evaluation/:idTeacher', getAllEvaluationByIdTeacher);
teachersRoute.post('', addTeacher);
teachersRoute.put('/:id', updateTeacher);
teachersRoute.delete('/:idTeacher', disableTeacher);

module.exports = { teachersRoute };