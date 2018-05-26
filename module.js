var fs = require('fs');

module.exports.login = function(){
    return new Promise(function(resolve, reject){
        fs.readFile('./sub/login.html', 'utf-8', function(err, data){
            if(err){
                reject(err);
            }
            else{
                resolve(data);
            }
        })
    })
}