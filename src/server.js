const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const app = express();

const { loginRoute } = require('./features/login/loginRoute');
const { adminRoute } = require('./features/admin/adminRoute');
const { usersRoute } = require('./features/users/usersRoute');
const { secretariesRoute } = require('./features/secretaries/secretariesRoute');
const { teachersRoute } = require('./features/teachers/teachersRoute');
const { studentsRoute } = require('./features/students/studentsRoute');

const { subTeaRoute } = require('./features/subjectTeacher/subjectTeacherRoute');
const { careersRoute } = require('./features/careers/careersRoute');
const { subjectsRoute } = require('./features/subjects/subjectsRoute');
const { enableRoute } = require('./features/enable/enableRoute');
const { evaluationsRoute } = require('./features/evaluations/evaluationsRoute');
const { studyPlanRoute } = require('./features/studyPlan/studyPlanRoute');
const { programmingRoute } = require('./features/programming/programmingRoute');
const { pool } = require('./database/database');
const { notificationRoute } = require('./features/notification/notificationRoute');
const { paymentRoute } = require('./features/payments/paymentsRoute');


app.use(cors());
app.use(bodyParser.json()); 

//const libelulaApiKey = process.env.LIBELULA_API_KEY; 


async function startServer(){
    try {     
        app.listen(process.env.PORT)
        console.log('Escuchando en puerto: ',process.env.PORT);

        app.use(async(req, res, next) => {
          
            console.log('entra algo')

            pool.getConnection((err, connection) => {
              console.log({
                port : process.env.DB_PORT,
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                connectionLimit: 10, // Establecer el límite máximo de conexiones
                queueLimit: 0
              })
              if (err) {
                console.log(err);
                return next(err); 
              }          
              req.db = connection;
              res.on('finish', () => {
                connection.release();
              });
          
              next();
            });
          });



        //Rutas del Sistema
        app.use('/api/login', loginRoute);
        app.use('/api/admin', adminRoute);
        app.use('/api/users', usersRoute);
        app.use('/api/secretaries', secretariesRoute);
        app.use('/api/teachers', teachersRoute);
        app.use('/api/students', studentsRoute);
        app.use('/api/subjectTeacher', subTeaRoute);
        app.use('/api/careers', careersRoute);
        app.use('/api/subjects', subjectsRoute);
        app.use('/api/enable', enableRoute);
        app.use('/api/evaluations', evaluationsRoute);
        app.use('/api/studyPlan', studyPlanRoute);
        app.use('/api/programming', programmingRoute);
        app.use('/api/notification', notificationRoute);
        app.use('/api/payments', paymentRoute);


    } catch (error) {
        console.error( error);
    }
}

startServer();
module.exports = {}





