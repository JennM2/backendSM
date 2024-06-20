const express = require("express");
const { getAllNotifications, getAllTypeNotifications, addNotification } = require("./notifiactionService");
const notificationRoute = express.Router();


//Rutas para listar carreras
notificationRoute.get("", getAllNotifications);
notificationRoute.get("/type", getAllTypeNotifications);
notificationRoute.post("", addNotification);
notificationRoute.put("/:idNotification", );
notificationRoute.delete("/:idNotification", );

module.exports = { notificationRoute };