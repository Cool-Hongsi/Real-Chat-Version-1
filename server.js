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
    host : 'localhost', // 'us-cdbr-iron-east-04.cleardb.net', // 'localhost',
    user : 'root', // 'b6689869dac7b0', // 'root',
    password : '111111', // '4b440f39', // '111111',
    database : 'signup' // 'heroku_e24dec95234d587' // 'signup'
});

// DATABASE_URL= mysql://b6689869dac7b0:4b440f39@us-cdbr-iron-east-04.cleardb.net/heroku_e24dec95234d587?reconnect=true

conn.connect();


app.get('/', (req, res) => {
    res.send('HI !!');
})

app.listen(port, () => {
    console.log(`Express http server listening on ${port}`);
});