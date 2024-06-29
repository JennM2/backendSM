const mysql = require("../../database/database");

// obtener las materias asignadas ordenado por Carreras
const getAllSubjectTeacher = async (req, res) => {
  try {
    const year = req.params.year;
    const month = req.params.month;
    console.log(year);
    console.log(month);
    const sql = `
      SELECT 
          ts.idTeaSub, 
          u.paterno, 
          u.materno, 
          u.names, 
          c.career, 
          sub.year, 
          sub.preSubject,
          sub.subject
      FROM 
          teachers_subjects ts
          ${(year==='0' && month==='no')?'':`JOIN enable en ON en.idTeaSub = ts.idTeaSub`}
      JOIN 
          teachers t ON ts.idTeacher = t.idTeacher
      JOIN 
          users u ON t.idUser = u.idUser
      JOIN 
          subjects sub ON ts.idSubject = sub.idSubject
      JOIN 
          careers c ON sub.idCareer = c.idCareer
      WHERE 
          ts.stateTeaSub = 'habilitado'
          ${year==='0'?
              `${month==='no'?
                  ''
              :
                  `AND en.month like "%${month}%"`}`
          :
              `AND en.month like "%${year}%"
              ${month==='no'?
                ''
                :
                `AND en.month like "%${month}%"`}
          `}
      ORDER BY 
          FIELD(c.career, 'Sistemas informaticos', 'Mercadotecnia', 'Contaduria General', 'Secretariado'), 
          sub.year, 
          sub.subject
    `
    const [results] = await req.db.promise().query(sql);
    res.json(results);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    res.status(500).send({ message : "Error al obtener asignaciones de la base de datos"});
  } finally {
    req.db.release();
  }
};

// obtener las materias asiganadas a un docente por su id----------------
const getAllSubjectsTeacherById = async (req, res) => {

  const idTeacher = req.query.idTeacher;
  try {    
    const query =  `SELECT
                tea.idTeacher,
                usr.paterno,
                usr.materno,
                usr.names,
                sub.subject,
                sub.code,
                sub.preSubject,
                car.career,
                sub.year,
                tea_sub.idTeaSub,
                tea_sub.stateTeaSub
            FROM 
                teachers AS tea
            JOIN 
                users AS usr ON tea.idUser = usr.idUser
            JOIN 
                teachers_subjects AS tea_sub ON tea.idTeacher = tea_sub.idTeacher
            JOIN 
                subjects AS sub ON tea_sub.idSubject = sub.idSubject
            JOIN 
                careers AS car ON sub.idCareer = car.idCareer
            WHERE 
                tea.idTeacher = ?;
        `;
    
        const [results] = await req.db.promise().query(query,[idTeacher]);

        const subjects = results.map((result) => ({
          idSubject: result.idSubject,
          code: result.code,
          subject: result.subject, 
          career: result.career,         
          year: result.year,
          preSubject: result.preSubject,
          idTeaSub:result.idTeaSub,
          stateTeaSub:result.stateTeaSub
        }));

    res.json(subjects);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    res.status(500).send({ message: "Error al obtener las materias activas del docente"});
  } finally {
    req.db.release();
  }
};

// Asignar materia a docente por su idTeacher
const assignSubjectToTeacher = async (req, res) => {
  try {

    const {idTeacher, subjectName} = req.body
    const stateTeaSub = "habilitado"; // Agregar el estado de la asignación

    // Verificar si la materia ya está asignada a otro docente
    const [idSubject] = await req.db.promise().query("SELECT idSubject FROM subjects WHERE subject = ?",[subjectName]);


    await req.db.promise().query("INSERT INTO teachers_subjects (idTeacher, idSubject, stateTeaSub) VALUES (?, ?, ?)",[idTeacher,idSubject[0].idSubject,stateTeaSub])

    res.status(201).json({ message: "Asignacion agregada exitosamente" });
  } catch (error) {
    console.error("Error al asignar materia al docente:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al asignar materia al docente" });
  } finally {
    req.db.release();
  }
};

// eliminar la asignación de una materia a un docente
const deleteSubjectAssignment = async (req, res) => {
  try {
    const idTeaSub = req.params.idTeaSub;
    const checkQuery =
      "SELECT stateTeaSub FROM teachers_subjects WHERE idTeaSub = ?";

    // Verificar el estado de la asignación
    await req.db.promise().query(checkQuery, [idTeaSub], (error, results) => {
      if (error) {
        console.error("Error al verificar el estado de la asignación:", error);
        return res
          .status(500)
          .json({ message : "Error del servidor al verificar la asignación" });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message : "La asignación especificada no existe" });
      }

      const currentState = results[0].stateTeaSub;

      // Si el estado es 'inhabilitado', eliminar la asignación
      if (currentState === "inhabilitado") {
        const deleteQuery = "DELETE FROM teachers_subjects WHERE idTeaSub = ?";
        req.db.promise().query(deleteQuery, [idTeaSub], (deleteError, deleteResults) => {
          if (deleteError) {
            console.error("Error al eliminar la asignación:", deleteError);
            return res
              .status(500)
              .json({ message : "Error del servidor al eliminar la asignación" });
          }
          res
            .status(200)
            .json({ message: "Eliminación de asignación exitosa" });
        });
      } else {
        // Si el estado es 'habilitado', actualizar el estado a 'inhabilitado'
        const updateQuery =
          'UPDATE teachers_subjects SET stateTeaSub = "inhabilitado" WHERE idTeaSub = ?';
        req.db.promise().query(updateQuery, [idTeaSub], (updateError, updateResults) => {
          if (updateError) {
            console.error("Error al actualizar la asignación:", updateError);
            return res.status(500).json({
              message:"Error del servidor al actualizar la asignación",
            });
          }
          res
            .status(200)
            .json({ message: "Actualización de asignación exitosa" });
        });
      }
    });
  } catch (error) {
    console.error("Error al eliminar o actualizar la asignación:", error);
    res.status(500).json({
      message:"Error del servidor al eliminar o actualizar la asignación",
    });
  } finally {
    req.db.release();
  }
};

//obtener el docente y la duracion de la materia
const getTeacherAndSubjectDuration = async (req, res) => {
  try {
    const subjectName = req.params.subject;
    const query = `
            SELECT 
                CONCAT(u.paterno, ' ', u.materno, ', ', u.names) AS teacher_name,
                s.durationSub
            FROM 
                teachers_subjects ts
            JOIN 
                teachers t ON ts.idTeacher = t.idTeacher
            JOIN 
                subjects s ON ts.idSubject = s.idSubject
            JOIN 
                users u ON t.idUser = u.idUser
            WHERE 
                s.subject = ?;
        `;
    await req.db.promise().query(query, [subjectName], (error, results) => {
      if (error) {
        console.error("Error al obtener datos:", error);
        res.status(500).json({
          message:
            "Error al obtener los datos de los profesores y la duración de la materia",
        });
        return;
      }
      res.json(results);
    });
  } catch (error) {
    console.error("Error al obtener datos:", error);
    res.status(500).json({
      message:
        "Error al obtener los datos de los profesores y la duración de la materia",
    });
  } finally {
    req.db.release();
  }
};

//obtener la lista de asignaciones de un docente, desde la interfaz del docente
const getAllSubjectsTeacherByIdTeacher = async (req, res) => {
  try {
    const idTeacher = req.params.id;

    await req.db.promise().query(
      `
            SELECT 
                ts.idTeaSub,
                s.subject AS nombre_materia,
                s.code AS codigo_materia,
                c.career,
                s.year
            FROM 
                teachers AS tea
            JOIN 
                teachers_subjects AS ts ON tea.idTeacher = ts.idTeacher
            JOIN 
                subjects AS s ON ts.idSubject = s.idSubject
            JOIN 
                careers AS c ON s.idCareer = c.idCareer
            WHERE 
                tea.idTeacher = ?;
        `,
      [idTeacher],
      (error, results) => {
        if (error) {
          console.error("Error al ejecutar la consulta:", error);
          res.status(500).send({ message: "Error al obtener las materias del docente"});
          return;
        }
        res.json(results);
      }
    );
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    res.status(500).send({ message: "Error al obtener las materias del docente"});
  } finally {
    req.db.release();
  }
};

const changeStateTeacherSubject = async(req, res) => {
  try {

    const idTeacherSubject = req.params.idTeacherSubject;

    const [result] = await req.db.promise().query("SELECT stateTeaSub from teachers_subjects WHERE idTeaSub = ?",[idTeacherSubject]);
    
    const newState = result[0].stateTeaSub === 'habilitado' ? 'deshabilitado' : 'habilitado';

    await req.db.promise().query("UPDATE teachers_subjects SET stateTeaSub = ? WHERE idTeaSub = ?",[newState, idTeacherSubject])

    res.status(201).json({ message: "Edicion agregada exitosamente" });

  } catch (error) {
    console.error("Error al actualiza asignacion:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al editar asignacion" });
  } finally {
    req.db.release();
  }
}

const getAllTeachersByIdSubject = async(req, res) => {
  try {

    const subject = req.params.subject;

    let sql = `SELECT
                idSubject
              FROM subjects
              WHERE subject = ?`
    let [result] = await req.db.promise().query(sql,[subject]);

    const idSubject = result[0]?.idSubject || '';

    sql = `SELECT
            teachers_subjects.idTeaSub,
            CONCAT(users.paterno,' ',users.materno,' ',users.names, ' (CI: ', users.ci, ')') As nombre
          FROM teachers_subjects 
            JOIN teachers ON teachers_subjects.idTeacher = teachers.idTeacher
            JOIN users ON teachers.idUser = users.idUser
          WHERE teachers_subjects.idSubject = ? AND teachers_subjects.stateTeaSub = 'habilitado'`;

    [result] = await req.db.promise().query(sql,[idSubject]);

    res.status(200).json(result);

  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error al obtener los docentes" });
  } finally {
    req.db.release();
  }
}

module.exports = {
  getAllSubjectTeacher,
  getAllSubjectsTeacherById,
  assignSubjectToTeacher,
  deleteSubjectAssignment,
  getTeacherAndSubjectDuration,
  getAllSubjectsTeacherByIdTeacher,
  changeStateTeacherSubject,
  getAllTeachersByIdSubject
};
