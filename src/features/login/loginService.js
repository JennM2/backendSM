const mysql = require('../../database/database');
const { compareCrypt, cryptPass } = require('../../utils/utils');

const login = async (req, res) => {
    const { user, password } = req.body;



    if (!user || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }

    try {
        let [results] = await req.db.promise().query('SELECT idUser, rol, stateUser, password FROM users WHERE user=?', [user]);

        results = results[0];

        if(!compareCrypt(password, results.password)){
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        
        if (!results) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        

        if (results.stateUser !== 'habilitado') {
            return res.status(403).json({ message: 'Usuario no habilitado' });
        }

        let sql=''
        switch (results.rol) {
            case 'Secretario':
                sql = `
                    SELECT us.idUser, CONCAT (us.paterno, ' ',us.materno, ' ', us.names) as fullName, us.rol, sec.idSecretary
                    FROM users as us
                    INNER JOIN secretaries as sec ON us.idUser = sec.idUser
                    WHERE us.user=? and us.password=?
                `
                break;
            case 'Docente':
                sql = `
                    SELECT us.idUser, CONCAT (us.paterno, ' ',us.materno, ' ', us.names) as fullName, us.rol, tea.idTeacher
                    FROM users as us 
                    INNER JOIN teachers as tea ON us.idUser = tea.idUser
                    WHERE us.user=? and us.password=?
                `
                break;
            case 'Estudiante':
                sql = `
                    SELECT us.idUser, us.rol, CONCAT (us.paterno, ' ',us.materno, ' ', us.names) as fullName, st.idStudent, car.idCareer 
                    FROM users AS us
                    INNER JOIN students AS st ON us.idUser = st.idUser 
                    INNER JOIN careers AS car ON st.idCareer = car.idCareer 
                    WHERE us.user=? AND us.password = ?
                `
                break;
            case 'Administrador':
                sql = `
                    SELECT rol, CONCAT (paterno, ' ',materno, ' ', names) as fullName, idUser
                    FROM users 
                    WHERE user=? and password=?
                `
                break;
            case 'SuperUsuario':
                sql = `
                    SELECT us.idUser, us.user, CONCAT (us.paterno, ' ',us.materno, ' ', us.names) as fullName, us.rol, sec.idSecretary, st.idStudent, st.idCareer, tea.idTeacher
                    FROM users as us 
                    INNER JOIN secretaries as sec ON us.idUser = sec.idUser
                    INNER JOIN students as st ON us.idUser = st.idUser
                    INNER JOIN teachers as tea ON us.idUser = tea.idUser
                    WHERE us.user=? and us.password=?
                `
                break;
            default:
                return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        results = await req.db.promise().query(sql, [user, results.password]);

        results = results[0][0];
        console.log(results);
        res.status(200).json({ message: 'Inicio de sesión exitoso', data:results });
    } catch (error) {
        console.error('Error al realizar la consulta:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { login };
