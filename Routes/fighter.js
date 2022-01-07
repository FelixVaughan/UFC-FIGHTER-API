const express = require('express');
var Fighter = require('../fighter');
const mongoose = require('mongoose'); 
const schema = require('../schema');
var dotenv = require('dotenv');
dotenv.config();
route = express.Router();

mongoose.connect(`mongodb://localhost:${process.env.DBPORT}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log(`Endpoint Mongo connection establised on port ${process.env.DBPORT}`);
});

schema.loadClass(Fighter);
const _Fighter = mongoose.model('Fighter', schema);


var handleRequestQuery = async (queryString) => {
    const numberedKeys = ['wins', 'losses', 'draws','weight', 'height', 'reach'];
    const stringKeys = ['firstName', 'lastName'];
    const allowedKeys = numberedKeys.concat(stringKeys, ['code'])
    let droppedKeys = {};
    let queryObject = {};
    let validNumber = (num) => !isNaN(num);
    let validString = (str) => (str.length > 0) &&  /^[A-Za-z]*$/.test(str);
    let splitNumerical = (num) => num.toString().split('.');
    for(const i in allowedKeys){
        let currentKey = allowedKeys[i];
        let value = queryString[currentKey];
        if(!value) continue;
        if (stringKeys.includes(currentKey) && validString(value)){
            queryObject[currentKey] = value; 
        }
        else if(numberedKeys.includes(currentKey) && validNumber(value)){
            switch(currentKey){
                case 'height':
                    value = (() => {
                        let v = splitNumerical(value);
                        return `${v[0]}' ${v[1]}"`;
                    })()
                    break;
                case 'weight':
                    value = value+" lbs.";
                    break;
                case 'reach':
                    value = value+"\"";
                    
            }
            queryObject[currentKey] = value; 
        }
        else if(currentKey === 'code' && /[A-Za-z0-9]/.test(value)){
            console.log(value)
            queryObject[currentKey] = value;
        }
        else droppedKeys[currentKey] = value;
    }
    let result = await _Fighter.findOne(queryObject, (err,fighters) => { 
        if(err){
            console.log(err);
        }
        return fighters
    }).clone().catch((err) => console.log(err));

    return result;
}


route.get('/', (req, res) => {
    let resultsFromQueryString = handleRequestQuery(req.query);
})

module.exports = route;