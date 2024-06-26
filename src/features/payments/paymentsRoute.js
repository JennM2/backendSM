const express = require("express");
const { getAllpaymentbyIdStudent, getAllpayment, addPayment, confirmPay, updatePay } = require("./paymentsService");
const paymentRoute = express.Router();


//Rutas para listar carreras
paymentRoute.get("", getAllpayment);

paymentRoute.get("/:idStudent", getAllpaymentbyIdStudent);

paymentRoute.post("", addPayment);

paymentRoute.post('/confirmPay', confirmPay);
paymentRoute.get('/confirmPay', confirmPay);
paymentRoute.get('/updatePay/:idStudent', updatePay);

module.exports = { paymentRoute };
