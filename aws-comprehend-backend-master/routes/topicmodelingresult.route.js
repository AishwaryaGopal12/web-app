const AWS = require('aws-sdk');
const fs = require('fs');
//const targz = require('tar.gz');
const express=require('express');
const router = express.Router();
const decompress = require('decompress');
const decompressTargz = require('decompress-targz');
const path=require('path');

var bodyParser = require('body-parser');
var path = require('path');
var multer = require('multer');
var csv=require('csv-array');
var request = require('request');
var S3 = new AWS.S3(options = {
    region: 'us-east-1'
});


var S3Uri;
var noOfTopics;
var Results = [];
var result=[];
var topicK=[];
var fileName='';
router.post('/getTopicModelJobResult', function (req, res) {
    var outUrl= req.body.OUS3Uri;
    noOfTopics=req.body.noOfTopics;
    var inUrl=req.body.InS3Uri;
    S3Uri = outUrl.replace("s3://first-time-testing/","");
    params = {
        Bucket: "first-time-testing",
        Key: S3Uri
    };
    getUtterencesFile(inUrl,result=>{
            console.log("result contents"+result);
            fileName=result;
    S3.getObject(
        params,
        function (error, data) {
            if (error != null) {
                console.log(error);
            } else {
                
                fs.writeFileSync('./downloads/output.gz', data.Body);
                 decompress('./downloads/output.gz', './downloads/', {
                  plugins: [
                           decompressTargz()
                         ]
                            })
                    .then(() => {
                        console.log('Job done!');
                        var utterences = [];
                        var fileRead = fs.readFileSync('./uploads/' + fileName); //filename
                        utterences = fileRead.toString().split(/\r?\n/);
                        console.log("utterences",utterences,utterences.length);
                        console.log("hi topics",fs.existsSync("./downloads/doc-topics.csv"));
                        console.log("hi gz",fs.existsSync("./downloads/output.gz"));
                        csv.parseCSV("./downloads/doc-topics.csv", function (docTopics) { //extracting text from csv file into array
                            for (var i = 0; i < docTopics.length; i++) {
                                docTopics[i].docname = docTopics[i].docname.slice(docTopics[i].docname.lastIndexOf(':') + 1, docTopics[i].length);
                                docTopics[i].docname = utterences[parseInt(docTopics[i].docname)];
                            }
                            
                            csv.parseCSV("./downloads/topic-terms.csv", function (topicTerms) {
                                for (var i = 0; i < noOfTopics; i++) {
                                    topicK = topicTerms.filter(topicTerm => parseInt(topicTerm.topic) == i);
                                    result = docTopics.filter(doctopic => parseInt(doctopic.topic) == i);
                                    Results[i] = { topicNo: i, keywords: topicK, utterences: result }
                                    
                                    //   console.log(JSON.stringify(topicK,null,4));
                                    //   console.log(JSON.stringify(result,null,4));
                                    //   console.log(JSON.stringify(Results[i],null,4));
                                    
                                }
                             console.log(JSON.stringify(Results, null, 4));

                                res.json(Results);
                            });
                        });
                    });
            }
        }
    );
    });

});




function getUtterencesFile(inputUri,callback)
{
let fileName=path.basename(inputUri);
    console.log("filename",fileName);
inputUri=inputUri.replace("s3://first-time-testing/","");
S3.getObject(
        { Bucket: "first-time-testing",
        Key: inputUri},
        function (error, data) {
            if (error != null) {
                console.log(error);
            } else {
               // console.log(JSON.stringify(data.Body.toString('utf-8')));
                fs.writeFileSync('./downloads/'+fileName, data.Body);
                callback(fileName);
            }
        });
}
module.exports = router;