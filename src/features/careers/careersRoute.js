const express = require("express");
const careersRoute = express.Router();
const {
  getAllCareers,
  getAllDatesCareers,
  getAllYearsCareers,
  addCareer,
  updateCareer,
  getNumbersUntilDuration,
  getAllCareersEnable,
  getPensumByIdCareer,
} = require("./careersService");

//Rutas para listar carreras
careersRoute.get("", getAllCareers);
careersRoute.get("/enable", getAllCareersEnable);
careersRoute.get("/careers", getAllDatesCareers);
careersRoute.get("/years", getAllYearsCareers);
careersRoute.post("", addCareer);
careersRoute.put("/:idCareer", updateCareer);
careersRoute.get("/year/:career", getNumbersUntilDuration);
careersRoute.get("/pensum/:idCareer", getPensumByIdCareer);

module.exports = { careersRoute };
