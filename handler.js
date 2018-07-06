'use strict';

var AWS = require('aws-sdk');
var sns = new AWS.SNS();
var qs  = require('qs');
var Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const conf = require('./conf/config.json');
var _ = require('lodash');

const ALLOWED_ORIGINS = [
    'http://localhost:5001',
    'http://jeffsaenz.surge.sh'
];

const topicName = conf['topicName'];
const formKeys = conf['formKeys'];
const mailTitle = conf['mailTitle'];

module.exports.send_mail = (event, context, callback) => {
    const functionArnCols = context.invokedFunctionArn.split(':');
    const region = functionArnCols[3];
    const accountId = functionArnCols[4];
    const topicArn = 'arn:aws:sns:' + region + ':' + accountId + ':' + topicName;
    
    console.log(`topicArn=${topicArn}`);

    // cors
    const origin = event.headers.origin;
    let headers;

    if (ALLOWED_ORIGINS.includes(origin)) {
        headers = {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": true
        }
    }
    const done = (err, result) => callback(null, {
        statusCode: err ? '500' : '200',
        body: err ? err.message : JSON.stringify(result),
        headers: _.extend(
            {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            headers
        )
    });

    var obj = qs.parse(event.body);
    console.log("obj=" + JSON.stringify(obj));

    var message = "";
    formKeys.forEach(function(val, i) {
        message += val + ":" + entities.decode(""+obj[val]) + "\n";
    });
    message += "\n\n-----\n\n";
    sns.publish({
        Message: message,
        Subject: mailTitle,
        TopicArn: topicArn
    }, done);
};
