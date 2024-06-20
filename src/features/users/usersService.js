const mysql = require("../../database/database");

// Obtener todos los usuarios del sistema
const getAllUsers = async (req, res) => {
  try {
    req.db.query("SELECT idUser, user, rol, stateUser, paterno, materno, names, ci, phone FROM users WHERE rol <> 'Administrador'",(error,results)=>{
      if(error){
        return res.status(400).json({message:"Error al obtener usuarios de la base de datos"});
      }
      return res.json(results);
    })
  } catch (error) {
    console.error(error);
  }  finally {
    req.db.release();
  }
};


// Obtener usuarios por su estado (habilitado o deshabilitado)
const getAllUsersByState = async (req, res) => {
  try {

    const stateFilter = req.query.stateUser;
    let query ="SELECT idUser, user, rol, stateUser, paterno, materno, names, ci, email, phone FROM users";

    if (stateFilter === "habilitado" || stateFilter === "deshabilitado") {
      query += " WHERE stateUser = ?";
    }

    req.db.query(query,[stateFilter],(error,results)=>{
      if(error){
        return res.status(400).json({message:"Error al obtener los usuarios"})
      }
      return res.json(results);
    })
  } catch (error) {
    console.error("Error al obtener usuarios por estado:", error);
    return res.status(400).json({message:"Error interno del servidor"})  
  } finally {
    req.db.release();
  }
};

// Obtener usuario por CI
const getUserByCI = async (req, res) => {
  try {

    const ci = req.params.ci;

    req.db.query("SELECT idUser, user, rol, stateUser, paterno, materno, names, ci, email, phone FROM users WHERE ci = ?",[ci],(error,results)=>{
      if(error){
        return res.status(400).json({message:""})
      }
      if (results.length === 0) {
        return res.status(404).send("Usuario no encontrado");
        
      }
      return res.json(results);
    })

  } catch (error) {
    console.error(error);
    res.status(400).send("Error interno del servidor");
  } finally {
    req.db.release();
  }
};

// Obtener Paterno, Materno, nombre de un usuario para habilitar o deshabilitar
const getUserById = async (req, res) => {
  try {

    const idUser = req.params.idUser;

    req.db.query("SELECT paterno, materno, names, stateUser FROM users WHERE idUser = ?",[idUser],(error,results)=>{
      if(error){
        return res.status(400).json({message:""})
      }
      if (results.length === 0) {
        res.status(404).send("Usuario no encontrado");
        return;
      }
      return res.json(results);
    })
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  } finally {
    req.db.release();
  }
};

// Actualizar estado habilitar o deshabilitar para un usuario por el ID
const updateUserById = async (req, res) => {
  try {
    const idUser = req.params.idUser;
    const newState = req.body.stateUser;

    if (newState !== "habilitado" && newState !== "deshabilitado") {
      return res.status(400).send("El estado proporcionado no es válido");
    }

    // Verificar si el idUser es de un docente
    const [teacherResults] = await req.db.promise().query(
      "SELECT idTeacher FROM teachers WHERE idUser = ?",
      [idUser]
    );

    const isTeacher = teacherResults.length > 0;

    // Actualizar el estado del usuario
    const [updateUserResult] = await req.db.promise().query(
      "UPDATE users SET stateUser = ? WHERE idUser = ?",
      [newState, idUser]
    );

    if (updateUserResult.affectedRows === 0) {
      res.status(404).send("Usuario no encontrado");
      return;
    }

    if (isTeacher && newState === "deshabilitado") {
      // Si es docente y se deshabilita, actualizar stateTeaSub
      const idTeacher = teacherResults[0].idTeacher;
      await req.db.promise().query(
        "UPDATE teachers_subjects SET stateTeaSub = 'inhabilitado' WHERE idTeacher = ?",
        [idTeacher]
      );
    }

    res.status(200).send("Estado del usuario actualizado correctamente");
  } catch (error) {
    console.error("Error al actualizar usuario por ID:", error);
    res.status(500).send("Error al actualizar usuario en la base de datos");
  } finally {
    req.db.release();
  }
};
const getProfile = async (req, res) => {
  try {
    const idUser = req.params.idUser;
    const sql = `
      SELECT user, password, paterno, materno, names, ci, email 
      FROM users 
      WHERE idUser = ?
    `
      const [results] = await req.db.promise().query(sql,[idUser]);


      res.json(results[0]);
  } catch (error) {
      console.error({message:error});
  }
}

module.exports = {
  getAllUsers,
  getUserByCI,
  getUserById,
  getAllUsersByState,
  updateUserById,
  getProfile
};
