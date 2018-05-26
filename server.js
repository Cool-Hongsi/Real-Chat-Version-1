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

// clearmysql을 내 heroku app에 설정하고, 해당 정보를 하기와 같이 기재. 이후, navigator를 이용해서 테이블 수정
var conn = mysql.createConnection({
    host : 'us-cdbr-iron-east-04.cleardb.net',
    user : 'b0dd242e3864eb',
    password : '811489ba',
    database : 'heroku_e32bdbd71a00947'
});

conn.connect();

app.get('/', (req, res) => {
    var sql = 'SELECT *FROM user';
    conn.query(sql, function(err, rows, fields){
        if(err){
            throw err;
        }
        else{
            res.send(1);
        }
    })
})


app.listen(port, () => {
    console.log(`Express http server listening on ${port}`);
});