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
var fs = require('fs');
var ejs = require('ejs');
// var modulefile = require('./module.js');


// clearmysql을 내 heroku app에 설정하고, 해당 정보를 하기와 같이 기재. 이후, navigator를 이용해서 테이블 수정
var conn = mysql.createConnection({
    host : 'us-cdbr-iron-east-04.cleardb.net',
    user : 'b0dd242e3864eb',
    password : '811489ba',
    database : 'heroku_e32bdbd71a00947'
});

conn.connect();

app.use(express.static('./sub')); // In order to use CSS file
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret : 'defWgw#$@$fadd1123',
    resave : false,
    saveUninitialized : true
}));

app.set('view engine', 'html');
app.set('views', './sub');
app.engine('html', ejs.renderFile);

app.get('/', (req, res) => {
    res.render('login');
})

app.post('/login/success', (req, res) => {
    var id = req.body.id;
    var pwd = req.body.pwd;
    
    var sql = 'SELECT *FROM user';
    conn.query(sql, function(err, rows, fields){
        if(err){
            throw err;
            res.status(500).send('Error Occured in /login/success');
        }
        else{
            for(var i=0; i<rows.length; i++){
                if(id === rows[i].ID && sha256(pwd+salt) === rows[i].PWD){
                    req.session.nickname = rows[i].NICKNAME;
                    res.redirect('/welcome');
                }
                else if(id === rows[i].ID || sha256(pwd+salt) === rows[i].PWD){
                    res.redirect('/welcome');
                }
            }
        }
    })
});

app.get('/welcome', (req, res) => {
    if(req.session.nickname){
        res.render('loginsuccess', {nickname:req.session.nickname});
    }
    else{
        var output = `
        <h1>There is no matching USER</h1>
        <br>
        <a href="/"><input type="button" value="BACK"></a>
        `;
        res.send(output);
    }
})


app.listen(port, () => {
    console.log(`Express http server listening on ${port}`);
});