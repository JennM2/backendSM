
//obtener las carreras
const getAllDatesCareers = async (req, res) => {
  try {
    const [results] = await req.db.promise().query(`SELECT * FROM careers`);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener carreras de la base de datos");
  }
};

const getAllCareers = async (req, res) => {
  try {
    const [results] = await req.db.promise().query(
      `SELECT * FROM careers`
    );
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message : "Error al obtener carreras de la base de datos"});
  } finally {
    req.db.release();
  }
};

const getAllCareersEnable = async (req, res) => {
  try{
    const [results] = await req.db.promise().query(
      `SELECT career, durationCar FROM careers WHERE stateCareer = "habilitado"`
    );
    res.json(results);
  }catch(error){
    console.error(error);
    res.status(500).send({ message : "Error al obtener carreras de la base de datos"});
  } finally {
    req.db.release();
  }
}

const getAllYearsCareers = async (req, res) => {
  try {
    const [results] = await req.db.promise().query("SELECT DISTINCT year FROM subjects"); // Aquí estoy asumiendo que quieres obtener los años distintos
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message : "Error al obtener años de la base de datos"});
  } finally {
    req.db.release();
  }
};

const addCareer = async (req, res) => {
  try {
    const { career, durationCar } = req.body;
    const stateCareer = "habilitado";

    // Verificar si los campos requeridos están llenos
    let errors = ''
    if (!career) {
      errors += 'Carrera ';
    }
    if (!durationCar) {
      errors += 'Duracion ';
    }

    if (!career || !durationCar) {
      return res
        .status(400)
        .json({ message: `Debe ingresar : ${errors}` });
    }

    // Crear una conexión a la base de datos

    // Verificar si la carrera ya existe
    const [existingCareers] = await req.db.promise().query(
      "SELECT * FROM careers WHERE career = ?",
      [career]
    );
    if (existingCareers.length > 0) {
      return res.status(400).json({ message: "La carrera ya existe" });
    }

    // La carrera no existe, proceder con la inserción
    const [result] = await req.db.promise().query(
      "INSERT INTO careers (career, durationCar, stateCareer) VALUES (?, ?, ?)",
      [career, durationCar, stateCareer]
    );

    const idCareer = result.insertId; // Obteniendo el idCareer insertado
    res.status(201).json({
      idCareer,
      stateCareer,
      message: "Carrera agregada correctamente",
    });
  } catch (error) {
    if (connection) connection.release();
    console.error("Error al agregar la nueva carrera:", error);
    res
      .status(500)
      .send({ message : "Error del servidor al agregar carrera a la base de datos"});
  } finally {
    req.db.release();
  }
};

//Actualizar una carrera
const updateCareer = async (req, res) => {
  try {
    const idCareer = req.params.idCareer;
    const { career, durationCar, stateCareer } = req.body;

    // Verificar si los campos requeridos están llenos

    let errors = ''
    if (!career) {
      errors += 'Carrera ';
    }
    if (!durationCar) {
      errors += 'Duracion ';
    }

    if (!career || !durationCar) {
      return res
        .status(400)
        .json({ message:`Debe ingresar : ${errors}`});
    }

    if (!idCareer || !stateCareer) {
      return res
        .status(400)
        .json({ message: 'Error de actualizacion' });
    }

    // Crear una conexión a la base de datos

    // Verificar si la carrera a actualizar existe
    const [existingCareers] = await req.db.promise().query(
      "SELECT * FROM careers WHERE idCareer = ?",
      [idCareer]
    );
    if (existingCareers.length === 0) {
      return res.status(404).json({ message: "La carrera no existe" });
    }

    // La carrera existe, proceder con la actualización
    await req.db.promise().query(
      "UPDATE careers SET career = ?, durationCar = ?, stateCareer = ? WHERE idCareer = ?",
      [career, durationCar, stateCareer, idCareer]
    );
    res.status(200).json({ message: "Carrera actualizada correctamente" });
  } catch (error) {
    if (connection) connection.release();
    console.error("Error al actualizar la carrera:", error);
    res
      .status(500)
      .send({ message : "Error del servidor al actualizar carrera en la base de datos"});
  } finally {
    req.db.release();
  }
};

// Obtener los números hasta la duración de una carrera específica
const getNumbersUntilDuration = async (req, res) => {
  const { career } = req.params;

  try {
    const [results] = await req.db.promise().query(
      `
      WITH RECURSIVE NumberSeries AS (
        SELECT 1 AS number
        UNION ALL
        SELECT number + 1
        FROM NumberSeries
        WHERE number < (SELECT durationCar FROM careers WHERE career = ?)
    )
    SELECT number
    FROM NumberSeries;
    `,
      [career]
    );

    res.json(results);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({message : "Error al obtener los números hasta la duración de la carrera"});
  } finally {
    req.db.release();
  }
};

const getPensumByIdCareer = async (req, res ) => {
  try {
    const idCareer = req.params.idCareer;
    const ordinals = ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo'];
    
    let sql = `SELECT * FROM careers WHERE idCareer = ?`
    let [result] = await req.db.promise().query(sql, [idCareer]);
    const years = result[0].durationCar;
    
    let finalResult = {years:[], data:[]}

    sql='SELECT code, subject, year, preSubject FROM subjects WHERE idCareer = ? AND year = ?'

    for (let index = 0; index < years; index++) {
      [result] = await req.db.promise().query(sql,[idCareer, index + 1]);
      finalResult.data.push(result);
      finalResult.years.push(ordinals[index]);
    }
    res.json(finalResult);
  } catch (error) {
    console.log(error);
  } finally {
    req.db.release()
  }
}

module.exports = {
  getAllCareers,
  getAllDatesCareers,
  getAllYearsCareers,
  addCareer,
  updateCareer,
  getNumbersUntilDuration,
  getAllCareersEnable,
  getPensumByIdCareer
};
