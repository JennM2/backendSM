const mysql = require('../../database/database');

//obtener las evaluaciones de cada mes
const getMonthlyEvaluations = async (req, res) => {
    try {
        const month = req.query.month; 
        
        const query = `
            SELECT 
                u.paterno, 
                u.materno, 
                u.names AS teacher_name, 
                sub.subject, 
                es.scoreQ1, 
                es.scoreQ2, 
                es.scoreQ3, 
                es.scoreQ4, 
                es.schedule 
            FROM 
                enable AS es 
            JOIN 
                teachers_subjects AS ts ON es.idTeaSub = ts.idTeaSub 
            JOIN 
                teachers AS t ON ts.idTeacher = t.idTeacher 
            JOIN 
                users AS u ON t.idUser = u.idUser 
            JOIN 
                subjects AS sub ON ts.idSubject = sub.idSubject 
            WHERE 
                es.month = ? AND YEAR(es.dateStart) = YEAR(CURRENT_DATE())`;

        await req.db.promise().query(query, [month], (error, results) => {
            if (error) {
                console.error('Error al ejecutar la consulta:', error);
                res.status(500).send({ message : 'Error al obtener las evaluaciones mensuales'});
                return;
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        res.status(500).send({ message : 'Error al obtener las evaluaciones mensuales'});
    } finally {
        req.db.release();
      }
};

module.exports = { getMonthlyEvaluations };
