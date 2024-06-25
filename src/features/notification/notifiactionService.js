const { checkFields } = require("../../utils/utils");

const getAllNotifications = async (req,res) => {
    try {
        const sql = `SELECT n.idNotification, tn.notification, n.message, n.dateNot FROM notifications AS n INNER JOIN type_notifications AS tn ON n.idTypNot = tn.idTypNot`
        const [results] = await req.db.promise().query(sql);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al obtener carreras de la base de datos");
    } finally {
        req.db.release()
    }
}

const getAllTypeNotifications = async (req,res) => {
    try {
        const sql = `SELECT * FROM type_notifications`
        const [results] = await req.db.promise().query(sql);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al obtener carreras de la base de datos");
    } finally {
        req.db.release()
    }
}

const addNotification = async (req,res) => {
    try {
        const {type, message, dateNot} = req.body;

        const errors = checkFields({
            Tipo : type,
            Mensaje :  message
        })

        if(errors)
            return res.status(500).send({message : `Debe ingresar: ${errors}`}); 

        const sql = `INSERT INTO notifications (idTypNot, message, dateNot) VALUES (?, ?, ?)`;
        await req.db.promise().query(sql,[type, message, dateNot]);
        res.json('Creado');
    } catch (error) {
        console.error(error);
        return res.status(500).send({message : error});
    } finally {
        req.db.release()
    }
}

module.exports = {getAllNotifications, getAllTypeNotifications, addNotification}