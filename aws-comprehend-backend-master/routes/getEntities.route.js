const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');

var textList = [];

router.get('/getEntities', (req, res) => {
    console.log('inside getKeyEntities');
    getArray(fileName, result => {
        console.log(result);
        comprehend.batchDetectEntities({
            LanguageCode: 'en',
            TextList: textList
        }, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                console.log('Batch Detect KeyEntities Result==========');
                console.log(JSON.stringify(data, null, 4));
                var arrayOfObjects = [];
                for (i = 0; i < data.ResultList.length; i++) {
                    console.log('KeyEntitiesChanging' + i);
                    var json = {
                        "Tweet": "",
                        "KeyEntities": ""

                    }
                    json.Tweet = textList[i];
                    var sample = '';
                    for (j = 0; j < data.ResultList[i].Entities.length; j++) {

                        sample += "Text: " + data.ResultList[i].Entities[j].Text + "  entityType: " + data.ResultList[i].Entities[j].Type + " ,";
                        //console.log('sample'+sample);
                    }
                    sample = sample.slice(0, -1);
                    json.KeyEntities = sample;
                    console.log("Key Entities Array" + json);
                    arrayOfObjects.push(json);
                }
                res.render('getEntities.hbs', { "data": JSON.stringify(arrayOfObjects) });
                //res.send('success'+JSON.stringify(arrayOfObjects)); 
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