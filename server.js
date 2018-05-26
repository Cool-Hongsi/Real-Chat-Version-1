var express = require('express');
var app = express();
const port = process.env.PORT || 8080;
var bodyParser = require('body-parser');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var sha256 = require('sha256');
var salt = 'fEWFGEG#3543fdfweq#$R@#';
var session = require('express-session');
var mysql = require('mysql');


var conn = mysql.createConnection({
    host : 'us-cdbr-iron-east-04.cleardb.net', // 'localhost',
    user : 'b0dd242e3864eb', // 'root',
    password : '811489ba', // '111111',
    database : 'heroku_e32bdbd71a00947' // 'signup'
});

conn.connect();


app.get('/', (req, res) => {
    res.send('HI !!');
})

app.listen(port, () => {
    console.log(`Express http server listening on ${port}`);
});