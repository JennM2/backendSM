const mysql = require("../../database/database");
const {  cryptPass } = require("../../utils/utils");


// Agregar un Nuevo Secretario
const addSecretary = async (req, res) => {
  try {
    let { user, password, paterno, materno, names, ci, email, phone } =
      req.body;
    const rol = "Secretario";
    const stateUser = "habilitado";

    console.log(password);

    password =  cryptPass(password);

    console.log(password);

    let errors = ''
    if(!user)
      errors += 'Usuario '
    if(!password)
      errors += 'Contrasena '
    if(!names)
      errors += 'Nombre '
    if(!ci)
      errors += 'CI '
    if(!email)
      errors += 'Correo '
    if(!phone)
      errors += 'Telefono '
    if(!paterno)
      errors += 'Ap_Paterno '
    if(!materno)
      errors += 'Ap_Materno '

    if (!user || !password || !names || !ci || !email || !phone || !paterno || !materno) {
      return res
        .status(400)
        .json({ message: `Debe ingresar: ${errors}` });
    }

    // Verificar si el usuario ya existe
    const [duplicateResults] = await req.db.promise().query(
      "SELECT COUNT(*) AS count FROM users WHERE user = ?",
      [user]
    );
    if (duplicateResults[0].count > 0) {
      return res
        .status(400)
        .json({ message: "El usuario ya existe en la base de datos" });
    }

    // Insertar nuevo secretario
    const [insertResults] = await req.db.promise().query(
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

    const idUser = insertResults.insertId; // Obtener el ID del usuario recién insertado

    // Insertar el ID del usuario en la tabla secretaries

    /// await req.db.promise().query("INSERT INTO secretaries (idUser) VALUES (?)", [idUser]);

    // Obtener el ID del secretario recién insertado
    const [secretaryIdResults] = await req.db.promise().query(
      "SELECT idSecretary FROM secretaries WHERE idUser = ?",
      [idUser]
    );
    const idSecretary = secretaryIdResults[0].idSecretary;

    res
      .status(201)
      .json({ idSecretary, message: "Secretario agregado correctamente" });
  } catch (error) {
    console.error("Error al agregar el nuevo secretario:", error);
    res
      .status(500)
      .send("Error del servidor al agregar secretario a la base de datos");
  } finally {
    req.db.release();
  }
};


// Actualizar a un secretario
const updateSecretary = async (req, res) => {
  try {
    const idSecretary = req.params.idSecretary;
    let { password, paterno, materno, names, ci, email, phone, stateUser } = req.body;

    let errors = ''
    
    if(!names)
      errors += 'Nombre '
    if(!ci)
      errors += 'CI '
    if(!email)
      errors += 'Correo '
    if(!phone)
      errors += 'Telefono '
    if(!paterno)
      errors += 'Ap_Paterno '
    if(!materno)
      errors += 'Ap_Materno '

    if (!names || !ci || !email || !phone || !paterno || !materno) {
      return res
        .status(400)
        .json({ message: `Debe ingresar: ${errors}` });
    }



    const [secretaryResults] = await req.db.promise().query(
      "SELECT * FROM secretaries WHERE idSecretary = ?",
      [idSecretary]
    );

    if (secretaryResults.length === 0) {
      return res.status(404).json({ message: "Secretario no encontrado" });
    }

    // Obtener la contraseña actual del usuario
    const [userResults] = await req.db.promise().query(
      "SELECT users.password FROM users INNER JOIN secretaries ON users.idUser = secretaries.idUser WHERE secretaries.idSecretary = ?",
      [idSecretary]
    );

    if (userResults.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si no se proporciona una nueva contraseña, conservar la anterior
    const currentPassword = userResults[0].password;
    const newPassword = password ? cryptPass(password) : currentPassword;

      await req.db.promise().query(
        "UPDATE users INNER JOIN secretaries ON users.idUser = secretaries.idUser SET users.password = ?, users.paterno = ?, users.materno = ?, users.names = ?, users.ci = ?, users.email = ?, users.phone = ?, users.stateUser = ? WHERE secretaries.idSecretary = ?",
        [
          newPassword,
          paterno,
          materno,
          names,
          ci,
          email,
          phone,
          stateUser,
          idSecretary,
        ]
      );

    res.status(200).json({ message: "Secretario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el secretario:", error);
    res.status(500).json({
      message: "Error del servidor al actualizar secretario en la base de datos",
    });
  } finally {
    req.db.release()
  }
};

// Obtener todos los secretarios
// Función para obtener todos los secretarios
const getAllSecretaries = async (req, res) => {
  try {
    const [results] = await req.db.promise().query(
      "SELECT sec.idSecretary, usr.user, usr.paterno, usr.materno, usr.names, usr.ci, usr.email AS email, usr.phone, usr.stateUser FROM secretaries AS sec JOIN users AS usr ON sec.idUser = usr.idUser");
    res.json(results);
  } catch (error) {
    console.error("Error al obtener secretarios de la base de datos:", error);
    res.status(500).send("Error al obtener secretarios de la base de datos");
  }
};

// Deshabilitar el estado de un secretario por el idSecretary
const disableSecretary = async (req, res) => {
  try {
    const idSecretary = req.params.idSecretary;

    const [secretaryResults] = await req.db.promise().query(
      "SELECT * FROM secretaries WHERE idSecretary = ?",
      [idSecretary]
    );

    if (secretaryResults.length === 0) {
      return res.status(404).json({ message: "Secretario no encontrado" });
    }

    await req.db.promise().query(
      "UPDATE users INNER JOIN secretaries ON users.idUser = secretaries.idUser SET users.stateUser = ? WHERE secretaries.idSecretary = ?",
      ["deshabilitado", idSecretary]
    );

    res.status(200).json({ message: "Secretario deshabilitado correctamente" });
  } catch (error) {
    console.error("Error al deshabilitar el secretario:", error);
    res.status(500).json({
      error:
        "Error del servidor al deshabilitar secretario en la base de datos",
    });
  }
};

module.exports = {
  getAllSecretaries,
  addSecretary,
  updateSecretary,
  disableSecretary,
};
