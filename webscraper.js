const axios = require('axios');
const jsdom = require('jsdom');
const express = require("express");
var dotenv = require('dotenv');
var Fighter = require('./fighter');
const mongoose = require('mongoose'); 
const schema = require('./schema');
const cron = require('node-cron');

const app = express();
const {JSDOM} = jsdom;
dotenv.config();
schema.loadClass(Fighter);
const _Fighter = mongoose.model('Fighter', schema);

app.use(express.json());
mongoose.connect(`mongodb://localhost:${process.env.DBPORT}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log(`Webscraper connection establised on port ${process.env.DBPORT}`);
});

const BASE_URl = "http://ufcstats.com/statistics/fighters" 

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

var parseFighter = async (row) => {
        let rowCols = row.querySelectorAll('td');
        let s = [];
        fightStatsUrl = "";
        anchorCounter = 0;
        for(col of rowCols){
            if(anchorCounter++ < 2){
                let anchor = col.querySelector('a');
                s.push(anchor.textContent);
                fightStatsUrl = anchor.href;
                continue;
            }
            s.push(col.textContent);
        }
        if(s.length > 0){
            s = s.map(x => x.trim());
            var fighter = new Fighter(s[0],s[1],s[2],s[3],s[4],s[5],s[6],s[7],s[8],s[9],s[10]);
            await fighter.setFighterStats(fightStatsUrl);
            //check if f exists in db with same code. if not save.
            let query = {code: fighter.code}
            const fighterInDB = await _Fighter.findOne(query);
            const newInstance = new _Fighter(fighter);
            if(fighterInDB) {
                if(fighterInDB._id.equals(newInstance._id)){
                    _Fighter.deleteOne(query, (err) => {
                        if(err) console.log(err);
                        else console.log("Successful deletion");
                    });
                    newInstance.save()
                    console.log(`Updated DB entry for ${fighter.firstName} ${fighter.lastName}`);
                }else console.log(`Entry for ${fighter.firstName} ${fighter.lastName} unaltered`);
            }
            else {
                newInstance.save();
                console.log(`Saved entry to db for ${fighter.firstName} ${fighter.lastName}`);
            }
    
        }
    }



var scrape = async () => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    var urlModifier = (index) => `${BASE_URl}?char=${index}&page=all`;
    for(const a of alphabet){
        let url = urlModifier(a);
        const html = await axios.get(url)
        const dom = new JSDOM(html.data)
        const table = dom.window.document.querySelector('table');
        if(table){
            const rows = table.querySelectorAll('tr');
            for(let i = 2; i < rows.length; i++){
                parseFighter(rows[i]);
                await sleep(1000);   
            }
        } 
        else{
            console.log(`Table not found at query index ${a}`);
        }
    }
}

if (process.env.DEV == "True") 
    scrape();
else 
    cron.schedule('0 0 * * *', scrape);