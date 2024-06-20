const mysql = require('mysql2/promise');
require('dotenv').config();


const pool = mysql.createPool({
    port : process.env.MYSQLPORT,
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    connectionLimit: 10, // Establecer el límite máximo de conexiones
    queueLimit: 0,
});

module.exports = pool;
