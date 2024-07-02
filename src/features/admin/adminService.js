const mysql = require('../../database/database');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const { cryptPass } = require('../../utils/utils');


// Obtener datos del administrador
const getAdmin = async (req, res) => {
    try {
        const sql = `SELECT 
            adm.idAdmin, usr.user, usr.paterno, usr.materno, usr.names, usr.ci, usr.email, usr.phone, usr.stateUser 
            FROM admin AS adm INNER JOIN users AS usr ON adm.idUser = usr.idUser`
        const [results] = await req.db.promise().query(sql);
        res.json(results);
    } catch (error) {
        console.error(error);
    } finally {
        req.db.release()
    }
}

// Actualizar información del administrador
const updateAdmin = async (req, res) => {
    try {
        const idAdmin = req.params.id;

        let { password, paterno, materno, names, ci, email, phone, stateUser } = req.body;

        let errors = ''
        
        if(!names)
        errors += 'Nombre '
        if(!ci)
        errors += 'CI '
        if(!email)
        errors += 'Correo '
        if(!phone)
        errors += 'Telefono '
        if(!paterno)
        errors += 'Ap_Paterno '
        if(!materno)
        errors += 'Ap_Materno '

        if (!names || !ci || !email || !phone || !paterno || !materno) {
        return res
            .status(400)
            .json({ message: `Debe ingresar: ${errors}` });
        }

        const [adminResults] = await req.db.promise().query(
            "SELECT * FROM admin WHERE idAdmin = ?",
            [idAdmin]
          );
      
          if (adminResults.length === 0) {
            return res.status(404).json({ message: "Administrador no encontrado" });
          }


        // Obtener la contraseña actual del usuario
        const [userResults] = await req.db.promise().query(
            "SELECT users.password FROM users INNER JOIN admin ON users.idUser = admin.idUser WHERE admin.idAdmin = ?",
            [idAdmin]
        );
    
        if (userResults.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
    
        // Si no se proporciona una nueva contraseña, conservar la anterior
        const currentPassword = userResults[0].password;
        const newPassword = password ? cryptPass(password) : currentPassword;

        await req.db.promise().query(
            "UPDATE users INNER JOIN admin ON users.idUser = admin.idUser SET users.password = ?, users.paterno = ?, users.materno = ?, users.names = ?, users.ci = ?, users.email = ?, users.phone = ?, users.stateUser = ? WHERE admin.idAdmin = ?",
            [
              newPassword,
              paterno,
              materno,
              names,
              ci,
              email,
              phone,
              stateUser,
              idAdmin,
            ]
          );

        res.status(200).json({ message: "Secretario actualizado correctamente" });
    } catch (error) {
        console.error('Error al actualizar administrador:', error);
        res.status(500).send('Error al actualizar información del administrador');
    }  finally {
        req.db.release()
    }
}

const getConfigBackup = async (req, res) => {
    try {
        const sql = `SELECT * FROM configBack WHERE idconfigBack = 1`
        let [results] = await req.db.promise().query(sql);
        results = results[0];
        const dayOfWeek = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
        if(dayOfWeek.includes(results.rule)){
            res.json({
                monthly:false,
                value:results.rule
            });
        }else{
            res.json({
                monthly:true,
                value:results.rule
            });
        }
        
    } catch (error) {
        console.error('Error', error);
        res.status(500).send({message:error});
    } finally {
        req.db.release()
    }
}

const getAllBackup = async (req,res) => {
    try {
        console.log(schedule.scheduledJobs['myBackUpTask']?.nextInvocation()?._date.ts);
        const folderbackUp = '../backup/';
        fs.readdir(folderbackUp, async(err, files) => {
            if (err) {
                console.error(`Error al leer la carpeta: ${err}`);
                return;
            }
            const list = [];
            // Recorrer los archivos y obtener los metadatos
            for (const file of files) {

                const filePath = path.join(folderbackUp, file);
                try {
                const stats = await fs.promises.stat(filePath);
                const fileObj = {
                    name: file,
                    size: `${stats.size} bytes`,
                    createAt: stats.birthtime
                };
                list.push(fileObj);
                } catch (error) {
                console.error(`Error al obtener los metadatos de ${file}: ${error}`);
                }
            }
            res.json(list);
        });
    } catch (error) {
        console.log(error)
        res.status(500).send({message:error});
    }  finally {
        req.db.release()
    }
}

const backup = async (res=false) => {
    const date = Date.now();

        const port = process.env.MYSQLPORT;
        const host = process.env.MYSQLHOST;
        const user = process.env.MYSQLUSER;
        const password = process.env.MYSQLPASSWORD;
        const database = process.env.MYSQLDATABASE;

        const archive = `../backup/BackUp_${date}_.sql`;

        const command = `mysqldump -h ${host} -P ${port} -u ${user} -p${password} ${database} > ${archive}`;

        exec(command,(error, stdout, stderr) => {
            if (error) {
            console.error('Error al generar la copia de respaldo:', error);
            throw new Error('Error al generar la copia de respaldo')
            } else {
                if(res){
                    res.json({ message: 'Generado' });
                    console.log('Copia de respaldo generada correctamente');
                }else{
                    console.log('Copia de respaldo generada correctamente');
                    return true
                }
                
            }
        });
}

const generateBackup = async(req, res) => {
    try {
        backup(res)
    } catch (error) {
        console.log(error);
        res.status(500).send({message:error});
    }  finally {
        req.db.release()
    }
}


const configTaskBackup = async(req, res) => {
    try {
        console.log(req.body);
        let rule = new schedule.RecurrenceRule();
        if(req.body.monthly){
            rule.date = req.body.value
        }else{
            rule.dayOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'].findIndex(item=>item===req.body.value) + 1
        }
        if(schedule.scheduledJobs['myBackUpTask']){
            const tarea = schedule.scheduledJobs['myBackUpTask'];
            tarea.reschedule(rule);
        }else{
        schedule.scheduleJob('myBackUpTask',rule, backup);
        }

        const sql = `UPDATE configBack SET rule = ? WHERE idconfigBack = 1`
        await req.db.promise().query(sql,[req.body.value]);

        res.json({ message: 'Configurado' });
    } catch (error) {
        console.log(error)
        res.status(500).send({message:error});
    }  finally {
        req.db.release()
    }
}

const addAdmin = async (req, res) => {
    try {
        let { user, password, paterno, materno, names, ci, email, phone } =
      req.body;
    const rol = "Administrador";
    const stateUser = "habilitado";

    password =  cryptPass(password);

    let errors = ''
    if(!user)
      errors += 'Usuario '
    if(!password)
      errors += 'Contrasena '
    if(!names)
      errors += 'Nombre '
    if(!ci)
      errors += 'CI '
    if(!email)
      errors += 'Correo '
    if(!phone)
      errors += 'Telefono '
    if(!paterno)
      errors += 'Ap_Paterno '
    if(!materno)
      errors += 'Ap_Materno '

    if (!user || !password || !names || !ci || !email || !phone || !paterno || !materno) {
      return res
        .status(400)
        .json({ message: `Debe ingresar: ${errors}` });
    }

    // Verificar si el usuario ya existe
    const [duplicateResults] = await req.db.promise().query(
      "SELECT COUNT(*) AS count FROM users WHERE user = ?",
      [user]
    );
    if (duplicateResults[0].count > 0) {
      return res
        .status(400)
        .json({ message: "El usuario ya existe en la base de datos" });
    }

    // Insertar nuevo secretario
    const [insertResults] = await req.db.promise().query(
      "INSERT INTO users (user, password, rol, paterno, materno, names, ci, email, phone, stateUser) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        user,
        password,
        rol,
        paterno,
        materno,
        names,
        ci,
        email,
        phone,
        stateUser,
      ]
    );

    const idUser = insertResults.insertId; // Obtener el ID del usuario recién insertado

    // Insertar el ID del usuario en la tabla secretaries

    await req.db.promise().query("INSERT INTO admin (idUser) VALUES (?)", [idUser]);

    // Obtener el ID del secretario recién insertado
    const [adminResults] = await req.db.promise().query(
      "SELECT idAdmin FROM admin WHERE idUser = ?",
      [idUser]
    );
    const idAdmin = adminResults[0].idAdmin;

    res
      .status(201)
      .json({ idAdmin, message: "Admin agregado correctamente" });
    } catch (error) {
        console.log(error)
        res.status(500).send({message:error});
    } finally {
        req.db.release();
    }
}

const disableAdmin = async (req, res) => {
    try {
        const idAdmin = req.params.idAdmin;

        const [adminResults] = await req.db.promise().query(
        "SELECT * FROM admin WHERE idAdmin = ?",
        [idAdmin]
        );

        if (adminResults.length === 0) {
        return res.status(404).json({ message: "Administrador no encontrado" });
        }

        await req.db.promise().query(
        "UPDATE users INNER JOIN admin ON users.idUser = admin.idUser SET users.stateUser = ? WHERE admin.idAdmin = ?",
        ["deshabilitado", idAdmin]
        );

        res.status(200).json({ message: "Administrador deshabilitado correctamente" });
    } catch (error) {
        console.error("Error al deshabilitar el secretario:", error);
        res.status(500).json({
        error:
            "Error del servidor al deshabilitar secretario en la base de datos",
        }); 
    } finally {
        req.db.release();
    }
}

module.exports = { getAdmin, updateAdmin, generateBackup, getAllBackup, configTaskBackup, addAdmin, disableAdmin, getConfigBackup};
