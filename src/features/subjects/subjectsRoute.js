const express = require("express");
const subjectsRoute = express.Router();
const {
  getAllSubjectsByCareerYear,
  getAllSubjectsByYearOne,
  getAllSubjectsByYearTwo,
  getAllSubjectsByYearThree,
  getAllSubjectsByIdCareerOne,
  getAllSubjectsByIdCareerTwo,
  getAllSubjectsByIdCareerThree,
  getAllSubjects,
  addNewSubject,
  updateSubjectById,
  inactivateSubjectById,
} = require("./subjectsService");

//Rutas para listar carreras
subjectsRoute.get("", getAllSubjectsByCareerYear);
subjectsRoute.get("/primero", getAllSubjectsByYearOne);
subjectsRoute.get("/segundo", getAllSubjectsByYearTwo);
subjectsRoute.get("/tercero", getAllSubjectsByYearThree);
subjectsRoute.get("/career/primero", getAllSubjectsByIdCareerOne);
subjectsRoute.get("/career/segundo", getAllSubjectsByIdCareerTwo);
subjectsRoute.get("/career/tercero", getAllSubjectsByIdCareerThree);
subjectsRoute.get("/subjects", getAllSubjects);
subjectsRoute.post("/subjects", addNewSubject);
subjectsRoute.put("/subjects/:idSubject", updateSubjectById);
subjectsRoute.put("/inactivate/:idSubject", inactivateSubjectById);

module.exports = { subjectsRoute };
