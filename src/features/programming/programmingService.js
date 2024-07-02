const { mysql } = require('../../database/database');
const { checkFields } = require('../../utils/utils');

//obtener la carrera de un estudiantes
const getAllCareerByIdStudent = async (req, res) => {
    try {
        const idStudent = req.params.idStudent;

        await req.db.promise().query('SELECT careers.career FROM students JOIN careers ON students.idCareer = careers.idCareer WHERE students.idStudent = ?', [idStudent], (error, results) => {
            if (error) {
                console.error('Error al ejecutar la consulta:', error);
                res.status(500).send({ message: 'Error al obtener el estudiante de la base de datos' });
                return;
            }

            // Verificar si se encontraron resultados
            if (results.length === 0) {
                res.status(404).send({ message: 'No se encontró ningún estudiante con el ID especificado' });
                return;
            }

            res.json(results[0]); // Devolver el primer resultado (asumiendo que idStudent es único)
        });
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        res.status(500).send({ message: 'Error al obtener el estudiante de la base de datos' });
    } finally {
        req.db.release();
    }
};
//Obtener materias de una carrera por idCareer
const getAllSubjectsByCareer = async (req, res) => {
    try {
        const career = req.params.career; // Obtener carrera desde los parámetros de la solicitud

        await req.db.promise().query('SELECT e.idEnable, s.subject, s.year, e.schedule, e.month, e.dateStart, e.dateEnd FROM enable AS e INNER JOIN teachers_subjects AS ts ON e.idTeaSub = ts.idTeaSub INNER JOIN subjects AS s ON ts.idSubject = s.idSubject INNER JOIN careers AS c ON s.idCareer = c.idCareer WHERE e.stateEnable = "habilitado" AND c.career = ?', [career], (error, results) => {
            if (error) {
                console.error('Error al ejecutar la consulta:', error);
                res.status(500).send({ message: 'Error al obtener las materias de la base de datos' });
                return;
            }

            // Verificar si se encontraron resultados
            if (results.length === 0) {
                res.status(404).send({ message: 'No se encontraron materias para la carrera especificada' });
                return;
            }

            res.json(results); // Devolver los resultados encontrados
        });
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        res.status(500).send({ message: 'Error al obtener las materias de la base de datos' });
    } finally {
        req.db.release();
    }
};

//Programar un materia de un estudiante
const AddProgramming = async (idEnable, idStudent, idTransaction, req) => {
    try {
            let sql = `INSERT INTO programming(idStudent, idEnable, datePro, parcialOne, parcialTwo, parcialThree, avgParcial, practices, exam, final, stateEvaluation) 
                VALUES (?, ?, NOW(), 0, 0, 0, 0, 0, 0, 0, "NO")`;
            const result = await req.db.promise().query(sql, [idStudent, idEnable]);
            const idProgramming = result[0].insertId;
            sql = 'UPDATE payments SET idProgramming = ? WHERE idTransaction = ?';
            await req.db.promise().query(sql, [idProgramming, idTransaction]);
            return true
    } catch (error) {
        console.log(error);
        return false
    }
}

const getNotesByIdStudent = async (req, res) => {
    try {
        const idStudent = req.params.idStudent;
        const ordinals = ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo'];

        let sql = `SELECT car.durationCar
        FROM careers AS car INNER JOIN students AS st ON car.idCareer = st.idCareer
        WHERE st.idStudent = ?`;
        let [result] = await req.db.promise().query(sql, [idStudent]);
        const years = result[0].durationCar;

        let finalResult = { years: [], data: [] }

        sql = `
        SELECT sub.subject, en.month, pro.parcialOne, pro.parcialTwo, pro.parcialThree, pro.avgParcial, pro.practices, pro.exam, pro.final
            FROM programming as pro
            INNER JOIN enable AS en ON pro.idEnable = en.idEnable
            INNER JOIN teachers_subjects AS teaSub ON en.idTeaSub = teaSub.idTeaSub
            INNER JOIN subjects as sub ON teaSub.idSubject = sub.idSubject
            WHERE 
                pro.idStudent = ? AND
                sub.year = ? 
            ORDER BY sub.subject, pro.datePro
      `

        for (let index = 0; index < years; index++) {
            [result] = await req.db.promise().query(sql, [idStudent, index + 1]);
            finalResult.data.push(result);
            finalResult.years.push(ordinals[index]);
        }
        res.json(finalResult);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: error });
    } finally {
        req.db.release()
    }
}

const getAllStudentsByIdEnable = async (req, res) => {
    try {
        const idEnable = req.params.idEnable;
        const sql = `SELECT  st.idStudent, en.month, CONCAT(us.paterno, ' ', us.materno, ' ', us.names) AS fullName, pro.parcialOne, pro.parcialTwo, pro.parcialThree, pro.avgParcial, pro.practices, pro.exam, pro.final, pro.idProgramming
            FROM enable AS en
            INNER JOIN programming AS pro ON en.idEnable = pro.idEnable
            INNER JOIN students AS st ON pro.idStudent = st.idStudent
            INNER JOIN users AS us ON st.idUser = us.IdUser
            WHERE en.idEnable = ?
            ORDER BY fullName
        `
        const [result] = await req.db.promise().query(sql, [idEnable]);
        res.json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: error });
    } finally {
        req.db.release()
    }
}

const updateNotes = async (req,res) => {
    try {
        const data = req.body;
        const sql = `UPDATE programming 
            SET parcialOne = ?, parcialTwo = ?, parcialThree = ?, avgParcial = ?, practices = ?, exam = ?, final = ? 
            WHERE idProgramming = ?
        `
        for (let index = 0; index < data.length; index++) {
            const item = data[index];
            req.db.promise().query(sql,[item.parcialOne, item.parcialTwo, item.parcialThree, item.avgParcial, item.practices, item.exam, item.final, item.idProgramming]).then((response)=>{
                req.db.release();
            }).catch(error=>{
                new Error(error);
            })
        }
        res.json('nice');
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: error });
    } finally {
        req.db.release()
    }
}

const getAllEvaluationByIdStudent = async (req, res) => {
    try {
        const idStudent = req.params.idStudent;
        const sql = `
            SELECT pro.idProgramming, sub.subject, en.month, en.schedule, en.groupe, CONCAT(us.paterno,' ' ,us.materno,' ' ,us.names) as fullName
            FROM enable AS en
            INNER JOIN programming AS pro ON en.idEnable = pro.idEnable
            INNER JOIN teachers_subjects AS teaSub ON teaSub.idTeaSub = en.idTeaSub
            INNER JOIN subjects AS sub ON teaSub.idSubject = sub.idSubject
            INNER JOIN teachers AS tea ON teaSub.idTeacher = tea.idTeacher
            INNER JOIN users AS us ON tea.idUser = us.idUser
            WHERE 
                pro.idStudent = ? AND
                en.stateSubject = 'Finalizado' AND
                pro.stateEvaluation ='NO'`;
        const [response] = await req.db.promise().query(sql, [idStudent]);

        res.json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: error });
    } finally {
        req.db.release()
    }
}

const getHistoryByIdStudent = async (req, res) => {
    try {
        const idStudent = req.params.idStudent;

        let sql = `
        SELECT sub.subject, en.month, pro.final, if (pro.final >= 65, "Aprobado", "Reprobado") as obs
            FROM programming as pro
            INNER JOIN enable AS en ON pro.idEnable = en.idEnable
            INNER JOIN teachers_subjects AS teaSub ON en.idTeaSub = teaSub.idTeaSub
            INNER JOIN subjects as sub ON teaSub.idSubject = sub.idSubject
            WHERE 
                pro.idStudent = ? AND
                en.stateSubject = 'Finalizado'
            ORDER BY sub.subject, pro.datePro`

        let [result] = await req.db.promise().query(sql, [idStudent]);
        res.json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: error });
    } finally {
        req.db.release()
    }
}


module.exports = { getAllCareerByIdStudent,
     getAllSubjectsByCareer,
     AddProgramming,
     getNotesByIdStudent,
     getAllStudentsByIdEnable,
     updateNotes,
     getAllEvaluationByIdStudent,
     getHistoryByIdStudent
    };



