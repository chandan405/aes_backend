// const mysql = require('mysql2');
// require('dotenv').config();
// const connection = mysql.createConnection({
//     port: process.env.DB_PORT,
//     host: process.env.HOST,
//     user: process.env.USER,
//     password: process.env.PASSWORD,
//     database: process.env.DATABASE
// });

// connection.connect((err) => {
//     if (err) {
//         console.error('Error connecting to the database:', err);
//         return;
//     }
//     console.log('Connected to the database!');
// });
// module.exports = connection;
const mysql = require('mysql2');
require('dotenv').config();

// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASSWORD);

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database!');
});

module.exports = connection;