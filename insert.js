const express = require('express');
const app = express();
const path = require("path");
const http = require('http');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const nodemailer = require('nodemailer');

const hostname = '10.10.193.142';
const port = 10034;

var crypto = require('crypto');

const server = http.createServer(app).listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});

var connection = mysql.createConnection({
  database: 'prj566_182a08',
  host: 'zenit.senecac.on.ca',
  path: '/phpMyAdmin/',
  user: 'prj566_182a08',
  password: 'jaMW2249'
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("Database connected successfully.");
});

app.use(express.static('Rent-emAll-Web-Portal'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({ 
  secret: '@#@$MYSIGN#@$#$',
  resave: false,
  saveUninitialized: true
}));


app.post('/postItem', function (req, res) {

  console.log("Post Item is clicked!!!");

	connection.query("INSERT INTO testTbl(name, description) VALUES ('Sali', 'Good Sali')", function (err, result) {
		if (err) throw err;
		console.log("Sali inseretd 1 record inserted");
	});

});

