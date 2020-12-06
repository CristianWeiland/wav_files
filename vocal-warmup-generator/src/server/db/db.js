let credentials = require('../database.json');

// get the client
const mysql = require('mysql2');

// create the connection to database
const connection = mysql.createConnection(credentials);

module.exports = connection;