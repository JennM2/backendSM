const { mysql } = require('../../database/database');

//obtener las materias de todos los a;os de un estudiante
const getAllStudyPlan = async (req, res) => {
    try {
        const { idStudent } = req.params; // Suponiendo que el ID del estudiante se pasa como parámetro en la solicitud
        await req.db.promise().query(`
            SELECT s.idSubject, s.code, s.subject, s.preSubject
            FROM subjects s
            JOIN careers c ON s.idCareer = c.idCareer
            JOIN students st ON c.idCareer = st.idCareer
            WHERE st.idStudent = ?
            AND s.year IN (1, 2, 3);
        `, [idStudent], (error, results) => {
            if (error) {
                console.error('Error al ejecutar la consulta:', error);
                res.status(500).send({ message :'Error al obtener el plan de estudios del estudiante de la base de datos'});
                return;
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        res.status(500).send({ message : 'Error al obtener el plan de estudios del estudiante de la base de datos'});
    } finally {
        req.db.release();
    }
}

module.exports = { getAllStudyPlan };
