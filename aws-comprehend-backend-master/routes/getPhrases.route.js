const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');

var textList = [];

router.get('/getPhrases', (req, res) => {
    console.log('inside getKeyPhrases');
    getArray(fileName, result => {
        console.log(result);
        comprehend.batchDetectKeyPhrases({
            LanguageCode: 'en',
            TextList: textList
        }, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                console.log('Batch Detect KeyPhrases Result==========');
                console.log(JSON.stringify(data, null, 4));
                var arrayOfObjects = [];
                for (i = 0; i < data.ResultList.length; i++) {
                    console.log('KeyPhrasesChanging' + i);
                    var json = {
                        "Tweet": "",
                        "KeyPhrases": ""
                    }
                    json.Tweet = textList[i];
                    var sample = '';
                    for (j = 0; j < data.ResultList[i].KeyPhrases.length; j++) {

                        sample += data.ResultList[i].KeyPhrases[j].Text + " ,";
                        //console.log('sample'+sample);
                    }
                    sample = sample.slice(0, -1);
                    json.KeyPhrases = sample;
                    console.log("Key Phrases Array" + json);
                    arrayOfObjects.push(json);
                }
                res.render('getPhrases.hbs', { "data": JSON.stringify(arrayOfObjects) });
            } // successful response
        });
        //res.end('success ');
    });
});


var getArray = function comprehend(fileName, callback) {
    console.log('comprehend' + fileName);
    //callback();
    var fileRead = fs.readFileSync('../uploads/' + fileName);
    console.log(fileRead.toString());
    textList = fileRead.toString().split(/\r?\n/);
    console.log(textList);
    callback(textList);
}

module.exports = router;