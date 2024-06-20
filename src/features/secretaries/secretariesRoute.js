const express = require("express");
const secretariesRoute = express.Router();
const {
  addSecretary,
  getAllSecretaries,
  updateSecretary,disableSecretary, 
} = require("./secretariesService");

// Ruta para listar Secretarios
secretariesRoute.post("", addSecretary);
secretariesRoute.put("/:idSecretary", updateSecretary);
secretariesRoute.get("", getAllSecretaries);
secretariesRoute.delete("/disable/:idSecretary", disableSecretary);

module.exports = { secretariesRoute };
