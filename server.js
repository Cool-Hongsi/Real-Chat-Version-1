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

// clearmysql을 내 heroku app에 설정하고, 해당 정보를 하기와 같이 기재. 이후, mysql connector를 이용해서 테이블 수정
var conn = mysql.createConnection({
    host : 'us-cdbr-iron-east-04.cleardb.net',
    user : 'bb7619d1a2d2a9',
    password : '366b4056',
    database : 'heroku_5c11217a00e23b5'
});

conn.connect();

app.use(express.static('./sub/css')); // In order to use CSS file
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret : 'defWgw#$@$fadd1123',
    resave : false,
    saveUninitialized : true
}));

app.set('view engine', 'html');
app.set('views', './sub/html');
app.engine('html', ejs.renderFile);

app.get('/', (req, res) => {
    res.render('login');
})

// 필수 : DB 안에 ID가 같은게 있거나, PWD가 같은게 있으면 에러 발생

app.post('/login/success', (req, res) => {
    var id = req.body.id;
    var pwd = req.body.pwd;
    
    var sql = 'SELECT *FROM USER';
    conn.query(sql, function(err, rows, fields){
        if(err){
            throw err;
            res.status(500).send('Error Occured in /login/success');
        }
        else{
            for(var i=0; i<rows.length; i++){
                // if(id === rows[i].ID && sha256(pwd+salt) === rows[i].PWD){
                //     req.session.nickname = rows[i].NICKNAME;
                //     res.redirect('/welcome');
                // }
                // else if(id === rows[i].ID || sha256(pwd+salt) === rows[i].PWD){
                //     res.redirect('/welcome');
                if (id === rows[i].ID)
                {
                    for(var j=0; j<rows.length; j++){
                        if(sha256(pwd+salt) === rows[j].PWD){
                        req.session.nickname = rows[j].NICKNAME;
                        res.redirect('/welcome');
                        break;
                    }
                    }
                }
            }
        }
    })
});

app.get('/welcome', (req, res) => {
    if(req.session.nickname){
       // res.render('loginsuccess', {nickname:req.session.nickname});
       var output = `            
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
                <meta name="description" content="">
                <meta name="author" content="">
                <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css" integrity="sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp" crossorigin="anonymous">
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.0/umd/popper.min.js"></script>
                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js"></script>

                <title>Login Success</title>

                <!-- Bootstrap core CSS -->
                <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css" rel="stylesheet">

                <!-- Custom styles for this template -->
                <link href="welcome.css" rel="stylesheet">
            </head>
            <body>
            <div class="container-fluid">
                <p class="h1"><i class="fas fa-hand-peace" sytle="color: babypink"></i> Welcome
                <small class="text-muted"><span>${req.session.nickname}</span></small></p>
                <p class="h2">How was your today?</p>
                <div class="hello">
                <p class="lead">
                <strong>Hello</strong>, We tried to make <mark>Real-Chat Application</mark> to utilize our knowledge we have learned<br>
                <mark>JavaScript, Node.js, MySQL for database, HTML, CSS(Bootstrap), Heroku</mark><br>
                Thank you, Enjoy! <br><br>
                <em>Sungjun Hong and Yuseon Kang<small class="text-muted"><br>May, 2018</small></em>
                </div>
                </p>
                <br><br>
                </div>
                <a href="/startchat"><button type="button" class="btn btn-secondary btn-lg" value="START CHAT">Start Chat</button></a>
                <a href="/login/logout"><button type="button" class="btn btn-light btn-lg" value="LOGOUT">Logout</button></a>
            </body>
            </html>`;
                res.send(output);
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

// 필수 : DB 안에 ID가 같은게 있거나, PWD가 같은게 있으면 에러 발생

app.post('/signup/success', (req, res) => {
    var name = req.body.name;
    var id = req.body.id;
    var pwd = req.body.pwd;
    var nickname = req.body.nickname;
    
    var sql = 'INSERT INTO USER (NAME, ID, PWD, NICKNAME) VALUES (?, ?, ?, ?)';
    var params = [name, id, sha256(pwd+salt), nickname];
    
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
    res.sendFile(__dirname + '/sub/html/startchat.html'); // ./sub 하면 안됨
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

server.listen(port, () => { // never app.listen
    console.log(`Express http server listening on ${port}`);
});

// CHANGE THE APP IN HEROKU
// PS C:\Users\hongs\dev\js\server_side_javascript\RealChat> git remote rm heroku
// PS C:\Users\hongs\dev\js\server_side_javascript\RealChat> heroku git:remote -a fast-spire-12846 (new app name)
// fatal: 'heroku' does not appear to be a git repository

//aaaaaaaaaaaaa