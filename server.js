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

app.get('/signup', (req, res) => {
    res.render('signup');
})

app.post('/signup/success', (req, res) => {
    var name = req.body.name;
    var age = req.body.age;
    var id = req.body.id;
    var pwd = req.body.pwd;
    var nickname = req.body.nickname;
    
    var sql = 'INSERT INTO USER (NAME, AGE, ID, PWD, NICKNAME) VALUES (?, ?, ?, ?, ?)';
    var params = [name, age, id, sha256(pwd+salt), nickname];
    
    conn.query(sql, params, function(err, rows, fields){
        if(err){
            throw err;
            res.status(500).send('Error Occured in /signup/success');
        }
        else{
            res.render('signupsuccess');
        }
    })
})

app.get('/login/logout', (req, res) => {
    delete req.session.nickname;
    
    var output = `
    <h1>Logout Successfully !</h1><br>
    <a href="/"><input type="button" value="LOGIN"></a>
    `;
    
    res.send(output);
})

app.get('/startchat', (req, res) => { 
    res.sendFile(__dirname + '/sub/startchat.html'); // ./sub 하면 안됨
});

var nicknames = [];

io.on('connection', function(socket){
    socket.on('new user', function(data, callback){
      if(nicknames.indexOf(data) != -1){ // nicknames 배열에 data 값이 있다면,,
        callback(false);
      }
      else{ // nicknames 배열에 data 값이 없다면,,
        callback(true);
        socket.nickname = data;
        nicknames.push(socket.nickname);
        updateNicknames();
      }
    })

    function updateNicknames(){
        io.emit('usernames', nicknames);
    }

    socket.on('send message', function(data){
      io.emit('new message', {msg:data, nick:socket.nickname});
    })
    
    socket.on('disconnect', function(data){
      if(!socket.nickname) return;
      nicknames.splice(nicknames.indexOf(socket.nickname), 1); // nickname 배열에서 유저가 나갔을 때, 해당 nickname 1개를 빼라.
      updateNicknames();
    })
});

// conn.end();

app.listen(port, () => {
    console.log(`Express http server listening on ${port}`);
});