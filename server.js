var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const port = process.env.PORT || 8080;
var manager = {
    id : 'stotos',
    password : 'aaabbb123'
};
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

app.use(express.static('./sub')); // In order to use CSS file
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret : 'defWgw#$@$fadd1123',
    resave : false,
    saveUninitialized : true
}));

app.set('view engine', 'jade');
app.set('views', './sub');

app.get('/', function(req,res){
    var output = `
    <a href="/login"><input type="button" value="click"></a>
    `;
    res.send(output);
})

app.get('/login', function(req,res){
   res.render('login'); 
});

app.post('/login/success', function(req,res){
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

// var chatnick = [];

app.get('/welcome', function(req,res){
    // chatnick.push(req.session.nickname);
    if(req.session.nickname){
        res.render('loginsuccess', {nickname:req.session.nickname});
    }
    else{
        var output = `
        <h1>There is no matching USER</h1>
        <br>
        <a href="/login"><input type="button" value="BACK"></a>
        `;
        res.send(output);
    }
})

app.get('/signup', function(req,res){
    res.render('signup');
})

app.post('/signup/success', function(req,res){
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
            res.render('signupsuccess', {name:name, age:age, id:id, pwd:pwd, nickname:nickname});
        }
    })
})

app.get('/login/logout', function(req,res){
    delete req.session.nickname;
    
    var output = `
    <h1>Logout Successfully !</h1><br>
    <a href="/login"><input type="button" value="LOGIN"></a>
    `;
    
    res.send(output);
})

app.get('/manager', function(req,res){
    res.render('checkmanager');
})

app.post('/manager/success', function(req,res){
    var mid = req.body.mid;
    var mpwd = req.body.mpwd;
    
    if(mid === manager.id && mpwd === manager.password){
        var namedata = ['','','','','',''];
        var agedata = ['','','','','',''];
        var iddata = ['','','','','',''];
        var pwddata = ['','','','','',''];
        var nicknamedata = ['','','','','',''];
        var sql = 'SELECT *FROM USER';
        
        conn.query(sql, function(err, rows, fields){
            if(err){
                throw err;
                res.status(500).send('Error Occured in /manager/success');
            }
            else{
                for(var i=0; i<rows.length; i++){
                    namedata[i] += rows[i].NAME;
                    agedata[i] += rows[i].AGE;
                    iddata[i] += rows[i].ID;
                    pwddata[i] += rows[i].PWD;
                    nicknamedata[i] += rows[i].NICKNAME;
                }
                res.render('managersuccess', {name:namedata, age:agedata, id:iddata, pwd:pwddata, nickname:nicknamedata});
            }
        })
    }
    else{
        res.redirect('/welcome');
    }
})

app.get('/startchat', function(req, res){ 
    res.sendFile(__dirname + '/sub/startchat.html');
});

var nicknames = [];

/*
                socket.emit('new user', $('#nickname').val(), function(data){
                    if(data){ // 기존에 동일한 아이디가 없다면,
                        $('#nickWrap').hide(); // nickWrap 페이지를 없애고,
                        $('#contentWrap').show(); // contentWrap 페이지를 보여라.
                    }
                    else{ // 기존에 동일한 아이디가 있다면,
                        $('#nickError').text('That username is already take! Try Again!');
                    }
                })
*/

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
/*
io.on('connection', function(socket){
    // socket.emit -> 보내는 것
    // socket.on -> 받는 것
    // 'connection' event listener에 event가 발생하면 한번만 일어나는 코드들임 
    // console.log('user connected: ', socket.id); // 3-1
    // 사용자 이름을 만들어서 change name이란 event를 발생시킴 
    // emit은 event를 발생시키는 함수 
    // 이 event는 index.html의 해당 event listener에서 처리됨 
    // 해당 socket.id에만 event를 전달 
    // io.to(socket.id).emit('change name', name); // 3-1
    
    socket.emit('login', chatnick);
    
    socket.on('send message', function(name, txt){ // 3-3
    var msg = name + ' : ' + txt;
    io.emit('receive message', msg); // 전체
    });

    io.emit('usernames', chatnick);

    function updateNicknames(){
        io.emit('usernames', chatnick);
    };

    socket.on('disconnect', function(data){
        if(!chatnick) return;
        chatnick.splice(chatnick.indexOf(chatnick), 1);
        updateNicknames();
    });
});
*/



/*
app.get('/startchat', function(req,res){
    res.sendFile(__dirname + '/startchat.html');
})

io.on('connection', function(socket){
    socket.on('new user', function(data, callback){
      if(nicknames.indexOf(data) != -1){
        callback(false);
      }
      else{
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
      nicknames.splice(nicknames.indexOf(socket.nickname), 1);
      updateNicknames();
    })
});
*/

// https://www.youtube.com/watch?v=dOSIqJWQkXM (chat application)