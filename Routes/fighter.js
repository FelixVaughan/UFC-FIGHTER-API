const express = require('express');
var Fighter = require('../fighter');
const mongoose = require('mongoose'); 
const schema = require('../schema');
const bodyParser = require('body-parser');
var dotenv = require('dotenv');
dotenv.config();
const DB_ADDR = process.env.MONGO_ADDR || process.env.DEV_DB_ADDR;
route = express.Router();
route.use(bodyParser.urlencoded({ extended: true }));


(async () => {
    await mongoose.connect(`mongodb://${DB_ADDR}`,{
        useNewUrlParser: true, useUnifiedTopology: true
    })
})();

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log(`API connection to DB establised at ${DB_ADDR}`);
});

schema.loadClass(Fighter);
const _Fighter = mongoose.model('Fighter', schema);


var parseQuery = async (query) => {
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
        let value = query[currentKey];
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
            queryObject[currentKey] = value;
        }
        else continue;
    }
    droppedKeys = Object.keys(query).filter(x => !Object.keys(queryObject).includes(x));
    return [queryObject, droppedKeys];
}

var parseBody = (body) => {
    if(body){
        let result = []
        for(const i in body){
            let fighterArr = body[i];
            let subResult = {}
            for(let i = 0; i < fighterArr.length; i++){
                let str = fighterArr[i];
                let keyVal = str.split("=");
                subResult[keyVal[0]] = keyVal[1];
            }
            result.push(subResult);
        }
        return result;
    }
    return null;
} 

var queryDB = async (queryObject) => {
    queryObject['wins'] = queryObject['wins']; 
    return await _Fighter.find(queryObject, (err,fighters) => { 
        if(err){
            return null;
        }
        return fighters;
    }).clone().catch((err) => null);
}

route.get('/', async (req, res) => {
    let cleanedQuery = await parseQuery(req.query);
    let queryObject = cleanedQuery[0];    
    let dirtyKeys = cleanedQuery[1];    
    console.log(dirtyKeys)
    let result = await queryDB(queryObject);
    if(result) result['unacceptedKeys'] = dirtyKeys;
    res.send(result);
})

route.post('/', async (req, res) => {
    let queries = parseBody(req.body);
    queries = queries.concat(req.query);
    cleanedQueries = []
    for(let i = 0; i < queries.length; i++){
        let query = queries[i];
        let cleanedQuery = await parseQuery(query);
        cleanedQueries.push(cleanedQuery)
    }
    let queryResults = []
    for(const subArr of cleanedQueries){
        const queryObject = subArr[0];
        const unacceptedKeys = subArr[1];
        let result = Object.keys(queryObject).length != 0 ? await queryDB(queryObject) : null
        if(result){
            result = Object.entries(result).reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});
            result['unacceptedKeys'] = unacceptedKeys;
            queryResults.push(result);
        }
    }
    res.json(queryResults);
})

module.exports = route;