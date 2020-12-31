const AWS = require('aws-sdk');
const fs = require('fs');
const targz = require('tar.gz');
const express = require('express');
const router = express.Router();
var bodyParser = require('body-parser');
var path = require('path');
var multer = require('multer');
var request = require('request');
var url = require('url');

router.use(express.static(path.join(__dirname, 'uploads')));

var bucketName = 'first-time-testing';
var JobId = '';
var params = '';
var readStream = '';
var csvFileLocation = '';
var noOfTopics = '';
var jobName = '';
var key = '';
var jobStatus = '';
var fileName = '';


//configuration settings
AWS.config.update({
    accessKeyId: "AKIAJZJJQZTAJN2NBCQQ",
    secretAccessKey: "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"
});
var comprehend = new AWS.Comprehend(options = {
    region: 'us-east-1'
});
var S3 = new AWS.S3(options = {
    region: 'us-east-1'
});


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },

    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({ storage: storage });


// router.post('/upload',upload.array("uploads[]", 50), function (req, res) {
//     fileName = req.file.originalname;
//     console.log("Uploading type of file is=", req.body.uploadtype);
//     res.end('success');
// });

//put object in bucket and thens tart topic modeling job
router.post('/startTopicModeling', upload.single('uploadFile'), function (req, res) {
    fileName = req.file.originalname;;
    jobName = req.body.jobName;
    noOfTopics = req.body.noOfTopics;
    console.log("Jobname=", jobName);
    console.log("topics=", noOfTopics);
    putObjectInBucket(fileName, (uploadResult) => {
        key = uploadResult[0];
        var location = "s3://" + bucketName + "/" + key;
        startTopicModelingJob(location, jobName, noOfTopics, (jobResult) => {
            //jobId = jobResult[0];
           // jobStatus = jobResult[1];
            if(jobResult[0]=='error')
            {
                res.json({ "statusCode":jobResult[1],"data": jobResult[2] });
            }
            else
            { jobId = jobResult[2];
            jobStatus = jobResult[3];
                 res.json({ "statusCode":jobResult[1], 
                 "data":{jobId: jobId, status: jobStatus}
                });
            }
            
        });
    });

});

router.get('/listAllTopicModeling', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var jobStatus = req.query.jobStatus;
    console.log(jobStatus);
    comprehend.listTopicsDetectionJobs(
        {
            Filter: {
                JobStatus: jobStatus
            }   //COMPLETED,IN_PROGRESS,FAILED
        }, function (err, data) {
            if (err) {
                res.json({ "statusCode":err.statusCode,"data": err.message });
                console.log("error",err.stack);
            }
            else {
                res.json({ "statusCode":200,"data": data })
                console.log(data);
            }
        });
});

//utility function's
function putObjectInBucket(fileName, callback) {
    // readStream = fs.createReadStream(__dirname + '../uploads/' + fileName);
    // readStream = fs.createReadStream(path.join(__dirname, './uploads/') + fileName, 'utf8');
    var jsonpath = path.join(__dirname, '../uploads/') + fileName;
    console.log(jsonpath);
    readStream = fs.readFileSync(jsonpath, 'utf8');
    params = {
        Bucket: bucketName,
        Body: readStream,
        Key: "TopicModeling " + Date().toString() + "/" + fileName
    };
    S3.upload(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            callback([err, err.stack]);
        } else {
            callback([data.Key]);
            console.log("Key=", data.Key);
        }
    });
}

function startTopicModelingJob(fileLocation, jobName, noOfTopics, callback) {
    params = {
        DataAccessRoleArn: 'arn:aws:iam::403617533140:role/service-role/AmazonComprehendServiceRoleS3FullAccess-sushant',
        /* required */
        InputDataConfig: {
            S3Uri: fileLocation,
            InputFormat: "ONE_DOC_PER_LINE"
        },
        OutputDataConfig: {
            S3Uri: "s3://" + bucketName
        },
        JobName: jobName,
        NumberOfTopics: noOfTopics
    };
    comprehend.startTopicsDetectionJob(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            callback(["error",err.statusCode,err.message]);
        } else {
            callback(["data",200,data.JobId, data.JobStatus]);
        }
    });
}

function getStatusOfJob(jobId, callback) {
    params = {
        JobId: jobId
    };
    comprehend.describeTopicsDetectionJob(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            callback([err, err.stack]);
        } else {
            callback([data]);
        }
    });
}

module.exports = router;