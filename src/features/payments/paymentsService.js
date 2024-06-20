
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

module.exports = {getAllpaymentbyIdStudent, getAllpayment}