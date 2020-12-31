const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');

var textList = [];

router.get('/getSentiments', (req, res) => {
    console.log('inside analytics');
    getArray(fileName, result => {
        console.log(result);
        comprehend.batchDetectSentiment({
            LanguageCode: 'en',
            TextList: textList
        }, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                console.log('Batch Detect Sentiment Result==========');
                console.log(JSON.stringify(data, null, 4));
                var arrayOfObjects = [];
                for (i = 0; i < data.ResultList.length; i++) {
                    console.log('changing' + i);
                    var json = {
                        "Tweet": "",
                        "Sentiment": "",
                        "Score": ""
                    }
                    json.Tweet = textList[i];
                    json.Sentiment = data.ResultList[i].Sentiment;
                    var string = json.Sentiment;
                    json.Score = data.ResultList[i].SentimentScore[string.charAt(0) + string.slice(1).toLocaleLowerCase()];
                    console.log("json score=", string, json.score);
                    arrayOfObjects.push(json);
                }
                console.log('arrayOfObjects' + JSON.stringify(arrayOfObjects, null, 4));
                res.render('getSentiments.hbs', {
                    "data": JSON.stringify(arrayOfObjects)
                });
            }
        });

    });


});

var getArray = function comprehend(fileName, callback) {
    console.log('comprehend' + fileName);
    var fileRead = fs.readFileSync('../uploads/' + fileName);
    console.log(fileRead.toString());
    textList = fileRead.toString().split(/\r?\n/);
    console.log(textList);
    callback(textList);
}

module.exports = router;