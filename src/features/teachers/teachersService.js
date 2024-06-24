const mysql = require("../../database/database");
const { cryptPass } = require("../../utils/utils");
// Obtener datos de los docentes habilitados
const getAllTeachers = async (req, res) => {
  try {
    const sql = `SELECT tea.idTeacher, usr.user, usr.paterno, usr.materno, usr.names, usr.ci, usr.email AS email, usr.phone, usr.stateUser 
      FROM teachers AS tea JOIN users AS usr ON tea.IdUser = usr.idUser
      WHERE usr.stateUser = 'habilitado'  
    `
    const [results] = await req.db.promise().query(sql);
    res.json(results);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    res.status(500).send("Error al obtener docentes de la base de datos");
  } finally {
    req.db.release();
  }
};

const getTeacherById = async (req, res) => {
  try {
    const { idTeacher } = req.params; // Obtener id de carrera desde los parámetros de la solicitud
    await req.db.promise().query(
      "SELECT  from teachers WHERE idTeacher = ?",
      [idTeacher],
      (error, results) => {
        if (error) {
          console.error("Error al ejecutar la consulta:", error);
          res
            .status(500)
            .json({
              message:"Error del servidor al obtener estudiantes por carrera",
            });
          return;
        }
        res.json(results);
      }
    );
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    res
      .status(500)
      .json({ message : "Error del servidor al obtener estudiantes por carrera" });
  } finally {
    req.db.release();
  }
};

const addTeacher = async (req, res) => {
  try {
    let { user, password, paterno, materno, names, ci, email } = req.body;

    // Verificar si los campos requeridos están llenos

    let errors = ''
    if(!user)
      errors+='Usuario '
    if(!password)
      errors+='Contrasena '
    if(!paterno)
      errors+='Ap_Paterno '
    if(!materno)
      errors+='Ap_Materno '
    if(!names)
      errors+='Nombre '
    if(!ci)
      errors+='CI '
    if(!email)
      errors+='Correo '

    if (!user || !password || !paterno || !materno|| !names || !ci || !email) {
      return res
        .status(400)
        .json({ message: `Debe ingresar: ${errors}` });
    }

    password = cryptPass(password);

    const rol = "Docente";
    const phone = req.body.phone || ""; // Si no se proporciona, dejarlo vacío
    const stateUser = "habilitado";

    const [existingUsers] = await req.db.promise().query(
      "SELECT * FROM users WHERE user = ? OR ci = ?",
      [user, ci]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "El usuario o ci ya existe" });
    }

    // El usuario no existe, proceder con la inserción
    await req.db.promise().query(
      "INSERT INTO users (user, password, rol, paterno, materno, names, ci, email, phone, stateUser) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        user,
        password,
        rol,
        paterno,
        materno,
        names,
        ci,
        email,
        phone,
        stateUser,
      ]
    );
    res.status(201).json({ message: "Docente agregado correctamente" });
  } catch (error) {
    console.error("Error al agregar el nuevo docente:", error);
    res
      .status(500)
      .send({ message: "Error del servidor al agregar docente a la base de datos"});
  } finally {
    req.db.release();
  }
};


// Inicia actualización
const updateTeacher = async (req, res) => {
  try {
    const idTeacher = req.params.id; // Obtener idTeacher desde los parámetros de la solicitud
    
    const { password, paterno, materno, names, ci, email, phone, stateUser } = req.body;

    let errors = '';
    if(!paterno)
      errors+='Ap_Paterno '
    if(!materno)
      errors+='Ap_Materno '
    if(!names)
      errors+='Nombre '
    if(!ci)
      errors+='CI '
    if(!email)
      errors+='Correo '

    if (!paterno || !materno|| !names || !ci || !email) {
      return res
        .status(400)
        .json({ message: `Debe ingresar: ${errors}` });
    }


    // Iniciar una transacción

    try {
      // Actualizar los datos del docente en la tabla users
      await req.db.promise().query(
        "UPDATE users SET password = ?, paterno = ?, materno = ?, names = ?, ci = ?, email = ?, phone = ?, stateUser = ? WHERE idUser = (SELECT idUser FROM teachers WHERE idTeacher = ?)",
        [password, paterno, materno, names, ci, email, phone, stateUser, idTeacher]
      );

      // Confirmar la transacción
      res.status(200).json({ message: "Docente actualizado correctamente" });
    } catch (error) {
      // Si ocurre algún error, hacer rollback de la transacción
      console.error("Error al actualizar el docente:", error);
      res.status(500).json({
        message: "Error del servidor al actualizar docente en la base de datos",
      });
    }
  } catch (error) {
    console.error("Error al actualizar el docente:", error);
    res
      .status(500)
      .send({message : "Error del servidor al actualizar docente en la base de datos"});
  } finally {
    req.db.release();
  }
};

// Deshabilitar el estado de un secretario por el idSecretary
const disableTeacher = async (req, res) => {
  try {
    const idTeacher = req.params.idTeacher;

    let sql = "SELECT * FROM teachers WHERE idTeacher = ?";

    const [teacherResults] = await req.db.promise().query(sql,[idTeacher]);

    if (teacherResults.length === 0) {
      return res.status(404).json({ message: "Docente no encontrado" });
    }

    sql = `UPDATE users 
      INNER JOIN teachers ON users.idUser = teachers.idUser 
      SET users.stateUser = ? 
      WHERE teachers.idTeacher = ?`
    await req.db.promise().query(sql,["deshabilitado", idTeacher]);

    sql = `UPDATE teachers_subjects SET stateTeaSub = "deshabilitado" WHERE idTeacher = ?`
    await req.db.promise().query(sql,[idTeacher]);


    res.status(200).json({ message: "Docente deshabilitado correctamente" });
  } catch (error) {
    console.error("Error al deshabilitar el docente:", error);
    res.status(500).json({
      message:
        "Error del servidor al deshabilitar docente en la base de datos",
    });
  } finally {
    req.db.release();
  }
};

const getAllEvaluationByIdTeacher = async(req, res) => {
  try {
    const idTeacher = req.params.idTeacher;
    console.log(idTeacher);

    const sql = `
      SELECT sub.subject, en.month, en.scoreQ1, en.scoreQ2, en.scoreQ3, en.scoreQ4, en.numEvaluations
      FROM enable AS en
      INNER JOIN teachers_subjects AS teaSub ON en.idTeaSub = teaSub.idTeaSub
      INNER JOIN subjects AS sub ON teaSub.idSubject = sub.idSubject
      WHERE teaSub.idTeacher = ?
    `
    const [response] = await req.db.promise().query(sql,[idTeacher]);
    console.log(response);

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:
        error
    });
  } finally {
    req.db.release();
  }
}


module.exports = {
  getAllTeachers,
  addTeacher,
  updateTeacher,
  getTeacherById,
  disableTeacher,
  getAllEvaluationByIdTeacher
};
