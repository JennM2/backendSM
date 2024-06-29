const express = require('express');
const subTeaRoute = express.Router();
const { getAllSubjectTeacher, getAllSubjectsTeacherById,assignSubjectToTeacher, deleteSubjectAssignment, getTeacherAndSubjectDuration, getAllSubjectsTeacherByIdTeacher, changeStateTeacherSubject, getAllTeachersByIdSubject } = require('./subjectTeacherService');

//rutas
subTeaRoute.get('/all/:year/:month', getAllSubjectTeacher);
subTeaRoute.get('/subjects', getAllSubjectsTeacherById);
subTeaRoute.post('', assignSubjectToTeacher);
subTeaRoute.delete('/:idTeaSub', deleteSubjectAssignment);
subTeaRoute.get('/enable/:subject', getTeacherAndSubjectDuration);
subTeaRoute.get('/teacher/:id', getAllSubjectsTeacherByIdTeacher);
subTeaRoute.delete('/changeState/:idTeacherSubject', changeStateTeacherSubject);
subTeaRoute.get('/subjectTeacher/:subject',getAllTeachersByIdSubject);

module.exports = { subTeaRoute };