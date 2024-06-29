const mysql = require('../../database/database');
const { checkFields } = require('../../utils/utils');

//Obtener todas las habilitaciones activas
const getAllActiveEnables = async (req, res) => {
    try {
        const query = `
            SELECT 
                e.idEnable,
                s.subject,
                c.career,
                s.year,
                e.groupe,
                e.limite,
                CONCAT(u.paterno,' ',u.materno,' ',u.names, ' (CI: ', u.ci, ')') As teacher,
                e.schedule,
                e.month,
                e.dateStart,
                e.dateEnd,
                e.stateEnable,
                e.price
            FROM 
                enable e
            JOIN 
                teachers_subjects ts ON e.idTeaSub = ts.idTeaSub
            JOIN 
                subjects s ON ts.idSubject = s.idSubject
            JOIN 
                teachers t ON ts.idTeacher = t.idTeacher
            JOIN 
                users u ON t.idUser = u.idUser
            JOIN 
                careers c ON s.idCareer = c.idCareer
            ORDER BY 
                e.idEnable ASC;
        `;
        const [results] = await req.db.promise().query(query);
        res.json(results);
    } catch (error) {
        console.error('Error al obtener las habilitaciones activas:', error);
        res.status(500).json({ message : 'Error del servidor al obtener las habilitaciones activas' });
    } finally {
        req.db.release();
    }
}




// Habilitar una nuena materia
const enableSubject = async (req, res) => {
    try {
        const {idTeaSub, subjectName, dateStart, dateEnd, schedule, group, limit, price} = req.body;
        const stateEnable = 'habilitado';
        const month = `${[
            'Enero', 'Febrero', 'Marzo', 
            'Abril', 'Mayo', 'Junio', 
            'Julio', 'Agosto', 'Septiembre', 
            'Octubre', 'Noviembre', 'Diciembre'][Number(req.body.month.slice(5,7) - 1)]} / ${req.body.month.slice(0,4)}` ;

        const errors = (checkFields({
                        Docente : idTeaSub,
                        Materia : subjectName,
                        Fecha_Habilitacion : dateStart,
                        Fecha_Finalizacion : dateEnd,
                        Horario : schedule,
                        Grupo : group,
                        Mes_Gestion : req.body.month,
                        Limite : limit,
                        Precio : price},res))
        if(errors)
            return res.status(404).json({ message: `Debe ingresar : ${errors}` });


        // Paso 1: Obtener idSubject por nombre de materia
        const subjectQuery = 'SELECT idSubject FROM subjects WHERE subject = ?';
        let idSubject = 0 ;

        const [subjectResults] = await req.db.promise().query(subjectQuery, [subjectName])
            
        if (!subjectResults || subjectResults.length === 0) {
            return res.status(404).json({ message: 'La materia especificada no existe' });
        }
        idSubject = subjectResults[0].idSubject;

        // Paso 2: Buscar idTeaSub por idSubject
        const teaSubQuery = 'SELECT idTeaSub, idTeacher FROM teachers_subjects WHERE idTeaSub = ?';
        let [teaSubResults] = await req.db.promise().query(teaSubQuery, [idTeaSub])
        if (!teaSubResults || teaSubResults.length === 0) {
            return res.status(404).json({ message: 'No se encontró ninguna asignación de docente para esta materia' });
        }
        teaSubResults = teaSubResults[0]

        // Paso 3: Verificar si el docente tiene materias en la mañana
        let checkEnableQuery = 'SELECT * FROM enable WHERE idTeaSub = ? AND month = ? AND stateEnable = ? AND schedule = ? AND groupe = ?' ;
        let [checkResults] = await req.db.promise().query(checkEnableQuery, [idTeaSub, month, stateEnable, schedule, group]);
            if (checkResults && checkResults.length > 0) {
                return res.status(400).json({ message: 'Ya existe una habilitacion con los datos' });
            }

        checkResults = checkResults[0];
        
        // Paso 4: Verificar si la habilitación ya existe
        checkEnableQuery = `
            SELECT * FROM enable 
            INNER JOIN teachers_subjects AS teaSub ON enable.idTeaSub = teaSub.idTeaSub 
            WHERE teaSub.idTeacher = ? AND enable.month = ? AND enable.schedule=? AND enable.stateEnable = 'habilitado'`;
        [checkResults] = await req.db.promise().query(checkEnableQuery, [teaSubResults.idTeacher, month, schedule]);
            if (checkResults && checkResults.length > 0) {
                return res.status(400).json({ message: 'El docente seleccionado ya tiene una materia asignada en el turno' });
            }

        // Paso 5: Insertar la habilitación en la tabla enable
        const insertQuery = 'INSERT INTO enable (idTeaSub, month, dateStart, dateEnd, schedule, stateEnable, scoreQ1, scoreQ2, scoreQ3, scoreQ4, numEvaluations, groupe, stateSubject, limite, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        await req.db.promise().query(insertQuery, [idTeaSub, month, dateStart, dateEnd, schedule, stateEnable, 0, 0, 0, 0, 0, group, 'En progreso',limit, price]);
        
        return res.status(201).json({ message: 'Habilitación de materia exitosa' });


    } catch (error) {
        console.error('Error al habilitar la materia:', error);
        return res.status(500).json({ message: 'Error del servidor al habilitar la materia' });
    } finally {
        req.db.release();
    }
}

//Actualizar una habilitacion 
const updateEnable = async (req, res) => {
    try {
        const idEnable = req.params.idEnable;

        const {idTeaSub, subjectName, dateStart, dateEnd, schedule, group, limit, price} = req.body;
        const stateEnable = 'habilitado';
        const month = `${[
            'Enero', 'Febrero', 'Marzo', 
            'Abril', 'Mayo', 'Junio', 
            'Julio', 'Agosto', 'Septiembre', 
            'Octubre', 'Noviembre', 'Diciembre'][Number(req.body.month.slice(5,7) - 1)]} / ${req.body.month.slice(0,4)}` ;

        const errors = (checkFields({
                        Docente : idTeaSub,
                        Materia : subjectName,
                        Fecha_Habilitacion : dateStart,
                        Fecha_Finalizacion : dateEnd,
                        Horario : schedule,
                        Grupo : group,
                        Mes_Gestion : req.body.month,
                        Limite : limit,
                        Precio : price},res))
        if(errors)
            return res.status(404).json({ message: `Debe ingresar : ${errors}` });


        // Paso 1: Obtener el idSubject por el nombre de la materia
        const subjectQuery = 'SELECT idSubject FROM subjects WHERE subject = ?';
        const subjectResults = await req.db.promise().query(subjectQuery, [subjectName])

        if (!subjectResults || subjectResults.length === 0) {
            return res.status(404).json({ message : 'La materia especificada no existe' });
        }

        const idSubject = subjectResults[0].idSubject;


        // Paso 3: Verificar si la habilitación ya existe
        const checkEnableQuery = 'SELECT * FROM enable WHERE idTeaSub = ? AND month = ? AND stateEnable = ?';
        const checkResults = await req.db.promise().query(checkEnableQuery, [idTeaSub, month, stateEnable])

        // Si hay resultados, significa que ya existe una habilitación con los mismos datos
        if (!checkResults && checkResults.length >= 0) {
            return res.status(400).json({ message : 'La habilitación para este mes y estado no existe' });
        }

        // Paso 4: Actualizar la habilitación en la tabla enable
        const updateQuery = 'UPDATE enable SET idTeaSub = ?, month = ?, dateStart = ?, dateEnd = ?, schedule = ?, stateEnable = ?,scoreQ1 = ?, scoreQ2 = ?, scoreQ3 = ?, scoreQ4 = ?, numEvaluations = ?, limite = ?, price = ? WHERE idEnable = ?';
        const updateResults = await req.db.promise().query(updateQuery, [idTeaSub, month, dateStart, dateEnd, schedule, stateEnable, 0, 0, 0, 0 , 0, limit, price, idEnable])
        // Verificar si se actualizó correctamente
        if (updateResults.affectedRows === 0) {
            return res.status(500).json({ message : 'La habilitación especificada no existe' });
        }

        res.status(200).json({ message: 'Habilitación de materia actualizada correctamente' });
                    
    } catch (error) {
        console.error('Error al actualizar la habilitación:', error);
        res.status(500).json({ message : 'Error del servidor al actualizar la habilitación' });
    } finally {
        req.db.release();
    }
}

//Eliminar una habiliatcion
const deleteEnable = async (req, res) => {
    try {
        const idEnable = req.params.idEnable;
        // Ejecutar la consulta para eliminar la programación
        let query = 'SELECT stateEnable FROM enable WHERE idEnable=?'
        let [resultQuery] = await req.db.promise().query(query,[idEnable]);
        const newStateEnable = resultQuery[0].stateEnable === 'habilitado' ? 'deshabilitado' : 'habilitado';
        query = 'UPDATE enable SET stateEnable = ? WHERE idEnable = ?'
        await req.db.promise().query(query,[newStateEnable, idEnable]);
        res.status(200).json({ message: 'Habilitacion editada correctamente' });
    } catch (error) {
        console.error('Error al eliminar la programación:', error);
        res.status(500).json({ message : 'Error del servidor al eliminar la programación' });
    } finally {
        req.db.release();
      }
}

//Limpiar las programaciones
const cleanEnable = async (req, res) => {
    try {
        // Cambiar el estado a 'inhabilitado' solo para aquellos registros cuyo estado actual sea 'habilitado'
        const updateQuery = 'UPDATE enable SET stateEnable = "inhabilitado" WHERE stateEnable = "habilitado"';
        await req.db.promise().query(updateQuery, async (updateError, updateResults) => {
            if (updateError) {
                console.error('Error al actualizar los estados:', updateError);
                return res.status(500).json({ message : 'Error del servidor al actualizar los estados' });
            }

            // Resto del código...
        });
    } catch (error) {
        console.error('Error al actualizar los estados:', error);
        res.status(500).json({ message : 'Error del servidor al actualizar los estados' });
    } finally {
        req.db.release();
      }
}

//Obtener las materias de activas o porgramadas de un docente, por su id
const getActiveEnablesByTeacherId = async (req, res) => {
    const teacherId = req.query.teacherId; 
    try {      
        const query = `
            SELECT 
                e.idEnable,
                s.subject,
                s.code,
                c.career,
                s.year,
                e.month
            FROM 
                enable e
            JOIN 
                teachers_subjects ts ON e.idTeaSub = ts.idTeaSub
            JOIN 
                subjects s ON ts.idSubject = s.idSubject
            JOIN 
                teachers t ON ts.idTeacher = t.idTeacher
            JOIN 
                careers c ON s.idCareer = c.idCareer
            WHERE 
                t.idTeacher = ?
                AND e.stateEnable = 'habilitado'
                AND e.stateSubject = 'En progreso'
        `;

        const [results] = await req.db.promise().query(query,[teacherId]);

        const subjects = results.map((result) => ({
            idEnable: result.idEnable,
            subject: result.subject,
            code: result.code,
            career: result.career,
            year: result.year,
            month:result.month
        }));
            res.json(subjects);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    } finally {
        req.db.release();
      }
}
const getEnablesByIdStudent = async (req,res) => {
    try {

        const idStudent = req.params.idStudent;

        let sql = `SELECT sub.subject, en.schedule, en.groupe, CONCAT(usTea.paterno,' ', usTea.materno,' ', usTea.names) as nameTeacher,en.dateStart, en.dateEnd, en.idEnable, en.price
            FROM enable as en
            INNER JOIN teachers_subjects as teaSub ON en.idTeaSub = teaSub.idTeaSub
            INNER JOIN teachers as tea ON teaSub.idTeacher = tea.idTeacher
            INNER JOIN users as usTea on tea.idUser = usTea.idUser
            INNER JOIN subjects as sub ON teaSub.idSubject = sub.idSubject
            INNER JOIN careers as car ON sub.idCareer = car.idCareer
            INNER JOIN students as st ON car.idCareer = st.idCareer
            WHERE 
                st.idStudent = ? AND
                en.stateEnable = 'habilitado' AND
                NOW() BETWEEN en.dateStart AND en.dateEnd AND
                en.stateSubject = 'En progreso' AND
                (
                    en.idEnable NOT IN (
                    SELECT idEnable 
                    FROM programming 
                    WHERE 
                        idStudent = ?
                    )
                AND
                    sub.idSubject NOT IN(
                    SELECT sub.idSubject
                    FROM programming as pro 
                    INNER JOIN enable as en ON pro.idEnable = en.idEnable
                    INNER JOIN teachers_subjects as teaSub ON en.idTeaSub = teaSub.idTeaSub
                    INNER JOIN subjects as sub ON teaSub.idSubject = sub.idSubject
                    WHERE
                        pro.idStudent = ? AND
                        pro.final >= 65 AND
                        en.stateSubject = 'Finalizado'
                    )
                )
                AND 
                en.limite > (
                    SELECT count(*)
                    FROM programming
                    WHERE idEnable = en.idEnable
                )
            `;

        let [results] = await req.db.promise().query(sql,[idStudent, idStudent, idStudent])

        const data = results.map((result) => ({
            idEnable: result.idEnable,
            subject: result.subject,
            schedule: result.schedule,
            group: result.groupe,
            nameTeacher: result.nameTeacher,
            dateStart: result.dateStart,
            dateEnd: result.dateEnd,
            price: result.price,
            action: result.action
        }));

        sql = `SELECT pro.idProgramming
            FROM enable AS en
            INNER JOIN programming AS pro ON en.idEnable = pro.idEnable
            WHERE 
                pro.idStudent = ? AND
                en.stateSubject = 'Finalizado' AND
                pro.stateEvaluation ='NO'`;

        [results] = await req.db.promise().query(sql,[idStudent]);

            res.json({data, results});

    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    } finally {
        req.db.release();
    }
}

const finishEnableById = async(req, res) => {
    try {
        const idEnable = req.params.idEnable;
        const sql = `UPDATE enable
        SET stateSubject = 'Finalizado'
        WHERE idEnable = ?
        `
        await req.db.promise().query(sql,[idEnable]);
        res.json('success');
    } catch (error) {
        console.error(error);
        res.status(500).json({message:error});
    } finally{
        req.db.release()
    }
}

const updateEvaluation = async (req, res) => {
    try {
        const idProgramming = req.params.idProgramming;
        const data = req.body;
        let sql = `SELECT enable.scoreQ1, enable.scoreQ2, enable.scoreQ3, enable.scoreQ4, enable.numEvaluations, enable.idEnable
            FROM enable INNER JOIN programming ON enable.idEnable = programming.idEnable
            WHERE programming.idProgramming = ?`;

        let [response] = await req.db.promise().query(sql,[idProgramming]);

        const newNumEvaluation = (response[0].numEvaluations + 1);

        const newScoreQ1 = (response[0].scoreQ1 + data.q1);
        const newScoreQ2 = (response[0].scoreQ2 + data.q2);
        const newScoreQ3 = (response[0].scoreQ3 + data.q3);
        const newScoreQ4 = (response[0].scoreQ4 + data.q4);


        sql = ` UPDATE enable
            SET scoreQ1 = ?, scoreQ2 = ?, scoreQ3 = ?, scoreQ4 = ?, numEvaluations = ?
            WHERE idEnable = ?
        `
        await req.db.promise().query(sql,[newScoreQ1, newScoreQ2, newScoreQ3, newScoreQ4, newNumEvaluation, response[0].idEnable]);

        sql = `UPDATE programming
            SET stateEvaluation = ?
            WHERE idProgramming = ?
        `
        await req.db.promise().query(sql,['SI', idProgramming]);

        res.json('success');

    } catch (error) {
        console.error(error);
        res.status(500).json({message:error});
    } finally{
        req.db.release()
    }
}
const getSubjectsByMonth = async(req, res) => {
    try {

        const months= [
            'Enero', 'Febrero', 'Marzo', 
            'Abril', 'Mayo', 'Junio', 
            'Julio', 'Agosto', 'Septiembre', 
            'Octubre', 'Noviembre', 'Diciembre'];

        const month = `${months[req.params.month.slice(5,7) - 1]} / ${req.params.month.slice(0,4)}`;
        const idTeacher = req.params.idTeacher;

        console.log(month, idTeacher);

        const sql = `
            SELECT sub.subject, en.idEnable
            FROM enable as en 
            INNER JOIN teachers_subjects as teaSub ON en.idteaSub = teaSub.idTeaSub
            INNER JOIN subjects as sub ON teaSub.idSubject = sub.idSubject
            WHERE 
                en.month = ? AND
                teaSub.idTeacher = ? AND
                en.stateEnable = 'habilitado'`
        const [response] = await req.db.promise().query(sql,[month, idTeacher]);
        console.log(response);
        

        res.json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({message:error});
    } finally{
        req.db.release()
    }
}

const getPriceSubjectByIdSubject = async(req, res) => {
    try {
        const idSubject = req.params.idSubject
        const sql = `
            SELECT en.month , en.price, count(pro.idProgramming) as students
            FROM enable as en
            INNER JOIN teachers_subjects as teaSub ON en.idTeaSub = teaSub.idTeaSub
            INNER JOIN subjects as sub ON teaSub.idSubject = sub.idSubject
            INNER JOIN programming as pro ON en.idEnable = pro.idEnable
            WHERE sub.idSubject = ?
            GROUP BY en.month, en.price
        `
        const [response] = await req.db.promise().query(sql,[idSubject]);
        console.log(response);
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({message:error});
    }finally{
        req.db.release()
    }
}

module.exports = {getPriceSubjectByIdSubject, getAllActiveEnables, enableSubject, updateEnable, deleteEnable, cleanEnable, getActiveEnablesByTeacherId, getEnablesByIdStudent, finishEnableById, updateEvaluation, getSubjectsByMonth};
