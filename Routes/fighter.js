const express = require('express');
var Fighter = require('../fighter');
const mongoose = require('mongoose'); 
const schema = require('../schema');
var dotenv = require('dotenv');
dotenv.config();
app = express.Router();

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

app.get('/', (req, res) => {
    let firstname = req.query.firstName;
    let lastname =  req.query.lastName;
    if(firstname && lastname){
        console.log(firstname+" "+lastname);
        _Fighter.findOne({firstName: firstname, lastName:lastname}, (err,fighter) => { 
            if(err){
                console.log(err);
            }
            res.send(JSON.stringify(fighter, undefined, 4)); 
        });

    }
    else {
        //handle error 
    }
})

module.exports = app