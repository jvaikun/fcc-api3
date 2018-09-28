'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

// DB connection
mongoose.connect(process.env.MONGO_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

//Set up schema and model for short URLs
var shortSchema = new mongoose.Schema({
  original:String,
  short:Number
});
var ShortURL = mongoose.model('ShortURL', shortSchema);
  
// your first API endpoint... 
app.get("/api/shorturl/:num", function (req, res) {
  ShortURL.findOne({short:req.params.num}, function(err, data){
    if (err)
      console.log('Error:', err);
    else
      res.redirect(data.original);
  });
});

//Get data form POST
app.post('/api/shorturl/new', function(req,res){
  var shortNum = 0;
  ShortURL.countDocuments({}, function(err, count){
    if (err)
      console.log('Error:', err);
    else {
      var shortNum = count;
      var document = new ShortURL({original:req.body.url, short:count});
      document.save(function(err, data){
        if (err)
          console.log('Error:', err);
        else
          return data;
      });
    };
  });
  res.json({original_url:req.body.url, short_url:shortNum});
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});