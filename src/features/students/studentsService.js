const mysql = require('../../database/database');
const { cryptPass } = require('../../utils/utils');

// Obtener todos los estudiantes y sus carreras
const getAllStudents = async (req, res) => {
    try {
        const [results] = await req.db.promise().query('SELECT s.idStudent, u.user, u.paterno, u.materno, u.names, u.ci, u.email, u.phone, c.career AS carrera, u.idUser FROM students s JOIN users u ON s.idUser = u.idUser JOIN careers c ON s.idCareer = c.idCareer WHERE u.stateUser = "habilitado"');
        res.json(results);
    } catch (error) {
        console.error('Error al obtener estudiantes:', error);
        res.status(500).send('Error al obtener estudiantes de la base de datos');
    } finally {
        req.db.release();
    }
}

//Agregar nuevo estudiante
const addStudent = async (req, res) => {
    try {

        let {user, password, paterno, materno, name, ci, email, phone, career} = req.body;

        let errors='';

        if(!user)
            errors += 'Usuario '
        if(!password)
        errors += 'Contrasena '
        if(!paterno)
        errors += 'Ap_paterno '
        if(!materno)
        errors += 'Ap_materno '
        if(!name)
        errors += 'Nombre '
        if(!ci)
        errors += 'CI '
        if(!email)
        errors += 'Correo '
        if(!career)
        errors += 'Carrera '
      
          if (!user || !password || !paterno || !materno || !name || !ci || !email || !career) {
            return res
              .status(400)
              .json({ message: `Debe ingresar: ${errors}` });
          }

        password = cryptPass(password);

        const stateUser = "habilitado";

        const [existingUsers] = await req.db.promise().query('SELECT * FROM users WHERE user = ?', [user]);

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: `El usuario ya existe` });
        }

        const [existingCareer] = await req.db.promise().query('SELECT idCareer FROM careers WHERE career = ?', [career]);

        let idCareer = 0;

        if (existingCareer.length > 0) {
            idCareer = existingCareer[0].idCareer;
        }else{
            return res.status(400).json({ message: `La carrera no existe` });
        }

        const userInsertSql = `
            INSERT INTO users 
            (user, password, rol, paterno, materno, names, ci, email, phone, stateUser) 
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const userInsertValues = [
            user,
            password,
            "Estudiante",
            paterno,
            materno,
            name,
            ci,
            email,
            phone,
            stateUser
        ];

        const [result] = await req.db.promise().query(userInsertSql, userInsertValues);
        const idUser = result.insertId;

       
        const studentInsertSql = `
            INSERT INTO students 
            (idUser, idCareer) 
            VALUES 
            (?, ?)
        `;
        
        const studentInsertValues = [
            idUser,
            idCareer
        ];

        await req.db.promise().query(studentInsertSql, studentInsertValues);

        res.status(200).send({ message: 'Estudiante agregado exitosamente'});
    } catch (error) {
        console.error('Error al agregar el estudiante:', error);
        res.status(500).json({ message: `Error al agregar el estudiante en la base de datos` });
    } finally {
        await req.db.release(); 
    }
}

// Actualizar al estudiante
const updateStudent = async (req, res) => {
    
    try {
        const { career, ci, email, paterno, materno, name, password, phone} = req.body;
        const idStudent = req.params.idStudent;
        const stateUser = 'habilitado';

        let errors = ''
        if(!career)
        errors += 'Carrera '
        if(!ci)
        errors += 'CI '
        if(!email)
        errors += 'Correo '
        if(!paterno)
        errors += 'Ap_paterno '
        if(!materno)
        errors += 'Ap_materno '
        if(!name)
        errors += 'Nombre '

        if (!career || !ci || !email || !paterno || !materno || !name) {
        return res
            .status(400)
            .json({ message: `Debe ingresar: ${errors}` });
        }

        const [studentResult] = await req.db.promise().query(
            "SELECT * FROM students WHERE idStudent = ?",
            [idStudent]
        );
        if (studentResult.length === 0) {
            return res.status(404).json({ message: "Estudiante no encontrado" });
        }

        const [userResults] = await req.db.promise().query(
            "SELECT users.password FROM users INNER JOIN students ON users.idUser = students.idUser WHERE students.idStudent = ?",
            [idStudent]
            );
        
        if (userResults.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const [careerResults] = await req.db.promise().query(
            "SELECT idCareer FROM careers WHERE career = ?",
            [career]
            );
        if (careerResults.length === 0) {
            return res.status(404).json({ message: "Carrera no encontrada" });
            }

        const idCareer = careerResults[0].idCareer;

        const currentPassword = userResults[0].password;
        console.log(currentPassword)
        
        const newPassword = password ? cryptPass(password) : currentPassword;
        console.log(newPassword)

        await req.db.promise().query(
            "UPDATE users INNER JOIN students ON users.idUser = students.idUser SET users.password = ?, users.paterno = ?, users.materno = ?, users.names = ?, users.ci = ?, users.email = ?, users.phone = ?, users.stateUser = ? WHERE students.idStudent = ?",
            [
            newPassword,
            paterno,
            materno,
            name,
            ci,
            email,
            phone,
            stateUser,
            idStudent,
            ]
        );

        await req.db.promise().query(
            "UPDATE students SET idCareer = ? WHERE idStudent = ?",
            [idCareer,idStudent]
        )
        
        return res.status(200).json({ message: "Estudiante actualizado correctamente" });
    } catch (error) {
        console.error('Error al actualizar el estudiante:', error);
        res.status(500).json({ message : 'Error del servidor al actualizar estudiante en la base de datos'});
    } finally {
        req.db.release();
    }
}


// Obtener estudiantes por carrera ejemplo "contabilidad"
const getAllStudentsByCareer = async (req, res) => {
    try {
        const { idCareer } = req.params; // Obtener id de carrera desde los parámetros de la solicitud
        await req.db.promise().query('SELECT s.idStudent, u.paterno, u.materno, u.names FROM students s JOIN users u ON s.idUser = u.idUser WHERE s.idCareer = ?', [idCareer], (error, results) => {
            if (error) {
                console.error('Error al ejecutar la consulta:', error);
                res.status(500).json({ message : 'Error del servidor al obtener estudiantes por carrera' });
                return;
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        res.status(500).json({ message : 'Error del servidor al obtener estudiantes por carrera' });
    } finally {
        req.db.release();
    }
}

const getStudentsById = async (req, res) => {
    try {
        const { idStudent } = req.params; 
        await req.db.promise().query('SELECT s.idStudent, u.paterno, u.materno, u.names FROM students s JOIN users u ON s.idUser = u.idUser WHERE s.idCareer = ?', [idStudent], (error, results) => {
            if (error) {
                console.error('Error al ejecutar la consulta:', error);
                res.status(500).json({ message : 'Error del servidor al obtener estudiantes por carrera' });
                return;
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        res.status(500).json({ message : 'Error del servidor al obtener estudiantes por carrera' });
    } finally {
        req.db.release();
    }
}

module.exports = { getAllStudents,addStudent, updateStudent, getAllStudentsByCareer, getStudentsById };
