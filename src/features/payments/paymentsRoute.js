const express = require("express");
const { getAllpaymentbyIdStudent, getAllpayment } = require("./paymentsService");
const paymentRoute = express.Router();


//Rutas para listar carreras
paymentRoute.get("", getAllpayment);

paymentRoute.get("/:idStudent", getAllpaymentbyIdStudent);

module.exports = { paymentRoute };