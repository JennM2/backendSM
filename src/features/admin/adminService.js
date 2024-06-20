const mysql = require('../../database/database');

// Obtener datos del administrador
const getAdmin = async (req, res) => {
    try {
        const [results] = await req.db.promise().query(`SELECT idUser, user, paterno, materno, names, ci, email FROM users WHERE rol = "Administrador"`);

        res.json(results);
    } catch (error) {
        console.error(error);
    }
}

// Actualizar información del administrador
const updateAdmin = async (req, res) => {
    try {
        const idUser = req.params.id;
        const { user, password, ci, email, phone, paterno, materno, names } = req.body;

        // Verificar que los campos obligatorios no estén vacíos
        if (!user || !password || !ci || !email || !phone) {
            return res.status(400).json({ message: 'Todos los campos obligatorios deben estar presentes' });
        }

        // Actualizar la información del administrador en la base de datos
        await req.db.promise().query('UPDATE users SET user = ?, password = ?, paterno = ?, materno = ?, names = ?, ci = ?, email = ?, phone = ? WHERE idUser = ?', [user, password, paterno, materno, names, ci, email, phone, idUser]);
        
        res.json({ message: 'Información del administrador actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar administrador:', error);
        res.status(500).send('Error al actualizar información del administrador');
    }
}

module.exports = { getAdmin, updateAdmin };
