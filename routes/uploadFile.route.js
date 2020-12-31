const express = require('express');
const router = express.Router();
var bodyParser = require('body-parser');
var path = require('path');
var multer = require('multer');
var request = require('request');
var fs = require('fs');
router.use(express.static(path.join(__dirname, 'uploads')));

var contents;
var fileName = '';

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },

    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({ storage: storage });

router.post('/upload', upload.single('uploadFile'), function (req, res) {
    //var jsonpath = '../uploads/' + req.file.originalname;
    fileName = req.file.originalname;
   // var jsondata = fs.readFileSync(jsonpath, 'utf8');
   // contents = JSON.parse(jsondata);
    console.log("Uploading type of file is=", req.body.uploadtype);
    res.end('success');
});

module.exports = router;



