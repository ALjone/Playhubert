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

app.post('/', express.json(), function(req, res) {
    //console.log(req.body); // getting {} empty object here....
    //console.log(req.body);

    var csv = req.body.data;
    console.log((req.body))
    console.log(typeof csv)
    fs.writeFile("maps/req.csv", csv, function (err) {
        if (err) return console.log(err);
        console.log('Hello World > helloworld.txt');
      })
});

const server = http.createServer(app).listen(8000);