const http = require('http');
const fs = require("fs");

var express = require('express')
var app = express()
var bodyparser = require('body-parser')

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    next();
}

app.use(allowCrossDomain)
app.use(express.json())

//https://stackoverflow.com/questions/11100821/javascript-regex-for-validating-filenames
var isValid=(function(){
    var rg1=/^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
    var rg2=/^\./; // cannot start with dot (.)
    var rg3=/^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
    return function isValid(fname){
      return rg1.test(fname)&&!rg2.test(fname)&&!rg3.test(fname);
    }
  })();
  

app.post('/', function(req, res) {
    var csv = req.body.data;

    console.log("Recieved a map with name", req.body.name)

    if (isValid(req.body.name)) {
        fs.writeFile("maps/"+req.body.name+".csv", csv, function (err) {
            if (err) return console.log(err);
        })
        res.end(JSON.stringify("successful"))
    }
    else {
        res.end(JSON.stringify("invalid_filename"))
    }
});

const server = http.createServer(app).listen(8000);