const mysql = require('mysql2/promise');
require('dotenv').config();


const pool = mysql.createPool({
    port : process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10, // Establecer el límite máximo de conexiones
    queueLimit: 0,
});

module.exports = pool;
