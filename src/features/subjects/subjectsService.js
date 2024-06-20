const mysql = require("../../database/database");

// Obtener materias de las carreras por año
const getAllSubjectsByCareerYear = async (req, res) => {
  const carrera = req.query.carrera;
  const year = req.query.year;
  try {
    const query = `
            SELECT idSubject, subject, code
            FROM subjects 
            INNER JOIN careers ON subjects.idCareer = careers.idCareer
            WHERE careers.career = ?
            AND subjects.year = ?
            AND subjects.stateSubject = 'habilitado';
        `;
    const [results] = await req.db.promise().query(query, [carrera, year]);
    const materias = results.map((result) => ({
      idSubject: result.idSubject,
      subject: result.subject,
      code: result.code
    }));
    res.json(materias);
  } catch (error) {
    console.error("Error al obtener materias:", error);
    res
      .status(500)
      .json({ message : "Error al obtener las materias de la carrera" });
  } finally {
    req.db.release();
  }
};

// Obtener materias del primer año en base a la carrera
const getAllSubjectsByYearOne = async (req, res) => {
  const idStudent = req.query.idStudent;
  const year = 1; // Obtener del primer año

  try {
    const query = `
      SELECT s.idSubject, s.code, s.subject, s.year, s.preSubject 
      FROM subjects s 
      INNER JOIN careers c ON s.idCareer = c.idCareer 
      INNER JOIN students st ON c.idCareer = st.idCareer 
      WHERE st.idStudent = ? AND s.year = ? AND s.stateSubject = 'habilitado';
    `;

    const [results] = await req.db.promise().query(query, [idStudent, year]);

    const subjects = results.map((result) => ({
      idSubject: result.idSubject,
      subject: result.subject,
      code: result.code,
      year: result.year,
      preSubject: result.preSubject,
    }));

    res.json(subjects);
  } catch (error) {
    console.error("Error al obtener materias:", error);
    res
      .status(500)
      .json({ message : "Error al obtener las materias de la carrera" });
  } finally {
    req.db.release();
  }
};

const getAllSubjectsByYearTwo = async (req, res) => {
  const idStudent = req.query.idStudent;
  const year = 2; // Obtener del primer año

  try {
    const query = `
      SELECT s.idSubject, s.code, s.subject, s.year, s.preSubject 
      FROM subjects s 
      INNER JOIN careers c ON s.idCareer = c.idCareer 
      INNER JOIN students st ON c.idCareer = st.idCareer 
      WHERE st.idStudent = ? AND s.year = ? AND s.stateSubject = 'habilitado';
    `;

    const [results] = await req.db.promise().query(query, [idStudent, year]);

    const subjects = results.map((result) => ({
      idSubject: result.idSubject,
      subject: result.subject,
      code: result.code,
      year: result.year,
      preSubject: result.preSubject,
    }));

    res.json(subjects);
  } catch (error) {
    console.error("Error al obtener materias:", error);
    res
      .status(500)
      .json({ message : "Error al obtener las materias de la carrera" });
  } finally {
    req.db.release();
  }
};

const getAllSubjectsByYearThree = async (req, res) => {
  const idStudent = req.query.idStudent;
  const year = 3; // Obtener del primer año

  try {
    const query = `
      SELECT s.idSubject, s.code, s.subject, s.year, s.preSubject 
      FROM subjects s 
      INNER JOIN careers c ON s.idCareer = c.idCareer 
      INNER JOIN students st ON c.idCareer = st.idCareer 
      WHERE st.idStudent = ? AND s.year = ? AND s.stateSubject = 'habilitado';
    `;

    const [results] = await req.db.promise().query(query, [idStudent, year]);

    const subjects = results.map((result) => ({
      idSubject: result.idSubject,
      subject: result.subject,
      code: result.code,
      year: result.year,
      preSubject: result.preSubject,
    }));

    res.json(subjects);
  } catch (error) {
    console.error("Error al obtener materias:", error);
    res
      .status(500)
      .json({ message : "Error al obtener las materias de la carrera" });
  } finally {
    req.db.release();
  }
};

//Obtener materias del primer año en base a la carrera
const getAllSubjectsByIdCareerOne = async (req, res) => {
  const idCareer = req.query.idCareer;
  const year = 1; // Obtener del primer año

  try {
    const query = `
      SELECT s.idSubject, s.code, s.subject, s.year, s.preSubject 
      FROM subjects s 
      INNER JOIN careers c ON s.idCareer = c.idCareer 
      WHERE s.idCareer = ? AND s.year = ? AND s.stateSubject = 'habilitado';
    `;

    const [results] = await req.db.promise().query(query, [idCareer, year]);

    const subjects = results.map((result) => ({
      idSubject: result.idSubject,
      subject: result.subject,
      code: result.code,
      year: result.year,
      preSubject: result.preSubject,
    }));

    res.json(subjects);
  } catch (error) {
    console.error("Error al obtener materias:", error);
    res
      .status(500)
      .json({ message : "Error al obtener las materias de la carrera" });
  } finally {
    req.db.release();
  }
};

const getAllSubjectsByIdCareerTwo = async (req, res) => {
  const idCareer = req.query.idCareer;
  const year = 2; // Obtener del primer año

  try {
    const query = `
      SELECT s.idSubject, s.code, s.subject, s.year, s.preSubject 
      FROM subjects s 
      INNER JOIN careers c ON s.idCareer = c.idCareer 
      WHERE s.idCareer = ? AND s.year = ? AND s.stateSubject = 'habilitado';
    `;

    const [results] = await req.db.promise().query(query, [idCareer, year]);

    const subjects = results.map((result) => ({
      idSubject: result.idSubject,
      subject: result.subject,
      code: result.code,
      year: result.year,
      preSubject: result.preSubject,
    }));

    res.json(subjects);
  } catch (error) {
    console.error("Error al obtener materias:", error);
    res
      .status(500)
      .json({ message : "Error al obtener las materias de la carrera" });
  } finally {
    req.db.release();
  }
};

const getAllSubjectsByIdCareerThree = async (req, res) => {
  const idCareer = req.query.idCareer;
  const year = 3; // Obtener del primer año

  try {
    const query = `
      SELECT s.idSubject, s.code, s.subject, s.year, s.preSubject 
      FROM subjects s 
      INNER JOIN careers c ON s.idCareer = c.idCareer 
      WHERE s.idCareer = ? AND s.year = ? AND s.stateSubject = 'habilitado';
    `;

    const [results] = await req.db.promise().query(query, [idCareer, year]);

    const subjects = results.map((result) => ({
      idSubject: result.idSubject,
      subject: result.subject,
      code: result.code,
      year: result.year,
      preSubject: result.preSubject,
    }));

    res.json(subjects);
  } catch (error) {
    console.error("Error al obtener materias:", error);
    res
      .status(500)
      .json({ message : "Error al obtener las materias de la carrera" });
  } finally {
    req.db.release();
  }
};

//Obtener todos las materias de todas las carreras ordenadas por fecha de creación
const getAllSubjects = async (req, res) => {
  try {
    // Consulta SQL para obtener todas las materias de todas las carreras ordenadas por fecha de creación
    const query = `
    SELECT 
    s.idSubject, 
    s.code, 
    s.subject, 
    s.year, 
    s.preSubject, 
    c.career, 
    s.stateSubject
FROM subjects s 
INNER JOIN careers c ON s.idCareer = c.idCareer
ORDER BY s.idSubject ASC;
    `;

    // Ejecutar la consulta SQL
    const [results] = await req.db.promise().query(query);

    // Mapear los resultados a un formato JSON
    const subjects = results.map((result) => ({
      idSubject: result.idSubject,
      code: result.code,
      subject: result.subject,
      year: result.year,
      preSubject: result.preSubject,
      career: result.career,
      stateSubject: result.stateSubject,
    }));

    // Enviar los resultados como respuesta JSON
    res.json(subjects);
  } catch (error) {
    // Manejar errores de manera adecuada
    console.error("Error al obtener materias:", error);
    res
      .status(500)
      .json({ message : "Error al obtener las materias de las carreras" });
  } finally {
    req.db.release();
  }
};

// Agregar una nueva materia
const addNewSubject = async (req, res) => {
  const { year, subject, code, preSubject, careerName } = req.body;
  const stateSubject = "habilitado";

  // Validar que todos los campos estén presentes
  let errors = '';
  if(!year){
    errors += 'Año '
  }
  if(!subject){
    errors += 'Materia '
  }
  if(!code){
    errors += 'Codigo '
  }
  if(!careerName){
    errors += 'Carrera '
  }
  
  if (!year || !subject || !code || !careerName) {
    return res.status(400).json({ message : `Debe ingresar : ${errors}` });
  }

  try {

    // Buscar idCareer basado en el nombre de la carrera
    const [careerResult] = await req.db.promise().query(
      "SELECT idCareer FROM careers WHERE career = ? LIMIT 1",
      [careerName]
    );

    if (careerResult.length === 0) {
      throw new Error("La carrera especificada no existe");
    }

    const idCareer = careerResult[0].idCareer;

    // Verificar si la materia ya existe y está activa
    const [subjectResult] = await req.db.promise().query(
      "SELECT idSubject FROM subjects WHERE subject = ? AND code = ? AND stateSubject = 'habilitado' AND idCareer = ? LIMIT 1",
      [subject, code, idCareer]
    );

    if (subjectResult.length > 0) {
      throw new Error("La materia ya existe y está activa");
    }

    // Insertar nueva materia en la tabla subjects
    await req.db.promise().query(
      `INSERT INTO subjects (year, subject, stateSubject, code, preSubject, idCareer)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [year, subject, stateSubject, code, preSubject, idCareer]
    );

    res.status(201).json({ message: "Materia agregada exitosamente" });
  } catch (error) {
    console.error("Error al agregar materia:", error);
    res.status(500).json({ message : error });
  } finally {
    req.db.release();
  }
};

//Actualizar los datos de una materias-----------------------------error
const updateSubjectById = async (req, res) => {
  const { idSubject } = req.params; // Obtener el idSubject de los parámetros de la solicitud
  const { year, subject, code, preSubject, career, state } = req.body;

  // Validar que todos los campos estén presentes

  let errors = '';
  if(!year)
    errors += 'Año ';
  if(!subject)
    errors += 'Materia ';
  if(!code)
    errors += 'Codigo ';
  if(!career)
    errors += 'Carrera ';

  if (!year || !subject || !code || !career) {
    return res.status(400).json({ message : `Debe ingresar: ${errors}` });
  }
  const stateSubject = "habilitado";

  try {

    // Buscar idCareer basado en el nombre de la carrera
    const [careerResult] = await req.db.promise().query(
      "SELECT idCareer FROM careers WHERE career = ? LIMIT 1",
      [career]
    );

    if (careerResult.length === 0) {
      throw new Error("La carrera especificada no existe");
    }

    const idCareer = careerResult[0].idCareer;

    // Actualizar los datos de la materia en la tabla subjects
    await req.db.promise().query(
      `UPDATE subjects 
       SET year = ?, subject = ?, code = ?, preSubject = ?, idCareer = ?, stateSubject = ? 
       WHERE idSubject = ?`,
      [year, subject, code, preSubject, idCareer, state, idSubject]
    );

    res
      .status(200)
      .json({ message: "Datos de la materia actualizados exitosamente" });
  } catch (error) {
    console.error("Error al actualizar datos de la materia:", error);
    res.status(500).json({ message : error.message });
  } finally {
    req.db.release();
  }
};

// Inactivar una materia por el ID
const inactivateSubjectById = async (req, res) => {
  const { idSubject } = req.params;

  try {

    // Verificar si la materia existe y está activa
    const [subjectResult] = await req.db.promise().query(
      "SELECT idSubject FROM subjects WHERE idSubject = ? AND stateSubject = 'habilitado' LIMIT 1",
      [idSubject]
    );

    if (subjectResult.length === 0) {
      throw new Error("La materia especificada no existe o ya está inactiva");
    }

    // Inactivar la materia
    await req.db.promise().query(
      `UPDATE subjects 
       SET stateSubject = 'inhabilitado' 
       WHERE idSubject = ?`,
      [idSubject]
    );

    res.status(200).json({ message: "Materia inactivada exitosamente" });
  } catch (error) {
    console.error("Error al inactivar la materia:", error.message);
    res.status(500).json({ message : error.message });
  } finally {
    req.db.release();
  }
};

module.exports = {
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
};
