fileName = '';

var getEntities=require('./routes/getEntities.route');
var getHomepage=require('./routes/getHomepage.route');
var getPhrases=require('./routes/getPhrases.route');
var getSentiments=require('./routes/getSentiments.route');
var uploadFile=require('./routes/uploadFile.route');
var topicModeling=require('./routes/topicModeling.route');
var topicmodelingresult= require('./routes/topicmodelingresult.route');
const AWS = require('aws-sdk');
const express = require('express');
const fs = require('fs');
const bodyParser=require('body-parser');
const multer = require('multer');
const cors = require('cors');
var path = require('path');
var formidable = require('formidable');

var textList = [];

var app = express();


app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));



app.use('/',getSentiments);
app.use('/',getPhrases);
app.use('/',getEntities);
app.use('/',uploadFile);
app.use('/',topicModeling);
app.use('/',topicmodelingresult);

app.listen(8080, () => {
  console.log("server is runnig on port 8080");
});

