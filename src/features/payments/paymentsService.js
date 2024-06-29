const { default: axios } = require("axios");
const { AddProgramming } = require("../programming/programmingService");

const getAllpaymentbyIdStudent = async (req, res) => {
    try {
        const idStudent = req.params.idStudent;
        const sql = `
            SELECT sub.subject, en.month, pay.datePay, sta.statePay
            FROM payments AS pay INNER JOIN programming AS pro ON pay.idProgramming = pro.idProgramming
            INNER JOIN enable as en ON pro.idEnable = en.idEnable
            INNER JOIN teachers_subjects as teaSub ON en.idTeaSub = teaSub.idTeaSub
            INNER JOIN subjects as sub ON teaSub.idSubject = sub.idSubject
            INNER JOIN state_pay as sta ON pay.idStatePay = sta.idStatePay
            WHERE pro.idStudent = ?
        `
        const [results] = await req.db.promise().query(sql,[idStudent]);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    } finally {
        req.db.release()
    }
}
const getAllpayment = async (req, res) => {
    try {
        const idStudent = req.params.idStudent;
        const sql = `
            SELECT CONCAT(us.paterno, ' ',us.materno, ' ',us.names ) AS fullName, st.idStudent,  sub.subject, en.month, pay.amount, pay.datePay, sta.statePay
            FROM payments AS pay 
            INNER JOIN programming AS pro ON pay.idProgramming = pro.idProgramming
            INNER JOIN students AS st ON pro.idStudent = st.idStudent
            INNER JOIN users as us ON st.idUser = us.idUser
            INNER JOIN enable as en ON pro.idEnable = en.idEnable
            INNER JOIN teachers_subjects as teaSub ON en.idTeaSub = teaSub.idTeaSub
            INNER JOIN subjects as sub ON teaSub.idSubject = sub.idSubject
            INNER JOIN state_pay as sta ON pay.idStatePay = sta.idStatePay
        `
        const [results] = await req.db.promise().query(sql,[idStudent]);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    } finally {
        req.db.release()
    }
}

const addPayment = async(req, res) => {
    try {
        const {idStudent, idEnable, amount} = req.body;
        let sql = `
            SELECT idPayment 
            FROM payments WHERE
            idStudent = ? AND idEnable = ? AND idStatePay in (1,2)
        `
        /*
        let [results] = await req.db.promise().query(sql,[idStudent, idEnable]);

        ///Verificar si existe pagos pendientes o finalizados para el enable
        if(results.length > 0){
            const idPayment = results[0].idPayment;
            const data = {"appkey": process.env.APIKEY,
                "identificador": '8888888888000000' + Number(idPayment)}
            results = await axios.post(process.env.APIIDENTIFY,data)

            ///Verificamos si la deuda expiro
            if(!results.data.datos.deuda_expirada){
                return res.json({url:results.data.datos.url_pasarela_pagos});
            }else{
                sql = `
                    UPDATE payments SET idStatePay = 3 WHERE idPayment = ?
                `
                await req.db.promise().query(sql,[idPayment]);
            }
        }*/

        ///Insertamos nuevo pago con pago pendiente
        sql = `
            INSERT INTO payments (idStudent, amount, datePay, idStatePay, idEnable) VALUES (?, ?, NOW(), 2, ?)
        `
        results = await req.db.promise().query(sql,[idStudent, amount, idEnable]);
        const idPayment = results[0].insertId;
        const today = new Date().toISOString().slice(0,10);

        /*
        ///Generamos deuda en API libelula
        sql = `
            SELECT us.email, us.names, CONCAT(us.paterno,' ',us.materno) as lastName, us.ci
            FROM students AS st INNER JOIN users AS us ON st.idUser = us.idUser WHERE idStudent = ?
        `
        let [dataStudent] = await req.db.promise().query(sql,[idStudent]);
        dataStudent = dataStudent[0]
        sql = `
            SELECT sub.subject, sub.code , en.price, en.month
            FROM enable AS en 
            INNER JOIN teachers_subjects AS teaSub ON en.idTeaSub = teaSub.idTeaSub 
            INNER JOIN subjects AS sub ON teaSub.idSubject = sub.idSubject 
            WHERE idEnable = ?
        `
        let [dataEnable] = await req.db.promise().query(sql,[idEnable]);
        dataEnable = dataEnable[0]

        const data = {
            "appkey": process.env.APIKEY,
            "email_cliente": dataStudent.email,
            "identificador": '8888888888000000' + Number(idPayment),
            "callback_url": process.env.APICALLBACK,
            "url_retorno": process.env.APIURLRETURN,
            "descripcion": "Pago por materia",
            "nombre_cliente": dataStudent.names,
            "apellido_cliente": dataStudent.lastName,
            "ci": dataStudent.ci,
            "fecha_vencimiento": `${today} 23:59`,
            "lineas_detalle_deuda": [
            { "concepto":`Programacion ${dataEnable.subject} (${dataEnable.code}) ${dataEnable.month}`, "cantidad":1, "costo_unitario":dataEnable.price}],
        }
        results = await axios.post(process.env.APIREGISTER,data);

        console.log(results.data);

        const url = results.data.url_pasarela_pagos;
        const idTransaction = results?.data?.id_transaccion || '';

        sql = 'UPDATE payments SET idTransaction = ? where idPayment = ?';
        await req.db.promise().query(sql,[idTransaction, idPayment]);
        */

        ///return res.json({url:url});
        return res.json();
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    } finally {
        req.db.release()
    }
}

const confirmPay = async (req) => {
    try {
        const idTransaction = req.query.transaction_id

        let sql = `UPDATE payments SET idStatePay = 1 WHERE idPayment = ?`
        await req.db.promise().query(sql,[idTransaction]);

        sql = `SELECT * FROM payments WHERE idPayment = ?`
        let [result] = await req.db.promise().query(sql,[idTransaction]);
        result = result[0]
        await AddProgramming(result.idEnable, result.idStudent, idTransaction, req);

        return result.idEnable;
    } catch (error) {
        console.error(error);
    } finally {
        req.db.release()
    }
}

const updatePay = async(req, res) => {
    try {
        const {idStudent} = req.params;
        let sql = `
            SELECT * 
            FROM payments
            WHERE idStudent = ? AND idStatePay = 2
        `
        const [result] = await req.db.promise().query(sql,[idStudent]);
        const finalResult = [];
        for (let index = 0; index < result.length; index++) {
            const element = result[index];
            /*
            const results = await axios.post('https://api.libelula.bo/rest/deuda/consultar_deudas/por_identificador',
                {
                    "appkey": process.env.APIKEY,
                    "identificador": '8888888888000000' + Number(element.idPayment)
                }
            );
            const item = results.data
            if(item.datos !== null){
                if(item.datos.pagado){
                    req.query.transaction_id = element.idTransaction;
                    finalResult.push(await confirmPay(req));
                }
            }*/
                req.query.transaction_id = element.idPayment;
                finalResult.push(await confirmPay(req));
        }
        return res.json(finalResult);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    } finally {
        req.db.release()
    }
}

module.exports = {getAllpaymentbyIdStudent, getAllpayment, addPayment, confirmPay, updatePay}