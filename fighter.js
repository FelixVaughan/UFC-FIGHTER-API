const axios = require('axios');
const jsdom = require('jsdom');
const md5 = require('md5');
const {JSDOM} = jsdom;

class Fighter {
    constructor(first,last,alias,ht,wt,r,s,w,l,d,b){
        this.firstName = first,
        this.lastName = last;
        this.alias = alias ? alias : "--";
        this.height = ht;
        this.weight = wt;
        this.reach = r;
        this.stance = s;
        this.wins = w;
        this.losses = l;
        this.draws = d;
        this.belt = b ? b : "--";
        this.code = this.setCode();
        this.fights = []
    }

    async setFighterStats (url){
        const html = await axios.get(url);
        const dom = new JSDOM(html.data);
        const div1 = dom.window.document.querySelector('body > section > div > div > div.b-list__info-box.b-list__info-box_style_small-width.js-guide > ul');
        let dobContent = div1.querySelectorAll('li');
        const dobStr = dobContent[dobContent.length - 1].textContent;
        const dobMatch = dobStr.match(/[a-zA-Z]+\s[0-9]+,\s[0-9]+/);
        this.dob = dobMatch ? dobMatch[0] : "--";
        const careerContent = dom.window.document.querySelectorAll('.b-list__info-box-left > div');
        const box1 = careerContent[0].querySelectorAll('ul > li');
        const box2 = careerContent[1].querySelectorAll('ul > li');
        const decimalFormatted = [box1[0], box1[2], box2[1], box2[4]];
        const percentFormatted = [box1[1], box1[3], box2[2], box2[3]];
        let decimalStats = [];
        let percentStats = [];
        for(let i = 0; i < Math.min(decimalFormatted.length, percentFormatted.length); i++){
            let dec = decimalFormatted[i].textContent.match(/([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?/)[0];
            let perc = percentFormatted[i].textContent.match(/[0-9]/)[0];
            decimalStats.push(dec);
            percentStats.push(perc);
        }
        this.strikesLandedPerMin = decimalStats[0]; this.strikingTakenPerMinute = decimalStats[1];
        this.averageTakedownper15Mins = decimalStats[2]; this.submssionAttemptsper15Mins = decimalStats[3];
        this.strikingAccuracy = percentStats[0]; this.strikesDefendedPerMin = percentStats[1];
        this.takedownAccuracy = percentStats[2]; this.takedownDefence = percentStats[3];
        let fightTable = dom.window.document.querySelectorAll('.b-fight-details__table > tbody > tr');
        this.setFightStats(fightTable);
        //Get url of fight page then setFightStats(url)
    } 

    setCode(){
        const hashString = this.firstName+this.lastName+this.weight+this.dob;
        const hash = md5(hashString);
        return hash;
        //Shouldn't have to check for duplicates across weight classes as it should be pretty random
    }

    async setFightStats(fightRows){
        for(let i = 1; i < fightRows.length; i++){
            const fightRow = fightRows[i];
            const rowAttr = fightRow.querySelectorAll('td');
            let emptyRow = false;
            let fight = {} 
            let fightAnalysisLink = ""
            for(let j = 0; j < rowAttr.length; j++){
                let currentAttr = rowAttr[j];
                switch(j){
                    case 6:
                        break;
                    case 0:
                        let fightStatus = currentAttr.textContent.replace(/\s+/g, '');
                        if (fightStatus != "next"){
                            fightAnalysisLink = currentAttr.querySelector('p > a').href;
                            fight.status = fightStatus;
                        }
                        else emptyRow = true;
                        break;
                    case 1:
                        let opponent = currentAttr.querySelectorAll('p')[1].textContent.trim();
                        fight.opponent = opponent;
                        break;
                    case 2: 
                        let knockdowns = currentAttr.querySelectorAll('p');
                        fight.fighterKnockdowns = knockdowns[0].textContent; fight.opponentKnockdowns = knockdowns[1].textContent;
                        break;
                    case 3:
                        let strikes = currentAttr.querySelectorAll('p');
                        fight.fighterstrikes = strikes[0].textContent; fight.opponentStrikes = strikes[1].textContent;
                        break;
                    case 4:
                        let takeDowns = currentAttr.querySelectorAll('p');
                        fight.fighterTakedowns = takeDowns[0].textContent; fight.opponentTakedowns = takeDowns[1].textContent;
                        break;
                    case 5:
                        let submisisons = currentAttr.querySelectorAll('p');
                        fight.fighterSubmissions = submisisons[0].textContent; fight.opponentSubmissions = submisisons[1].textContent;
                        break;
                    case 7:
                        fight.decision = currentAttr.querySelectorAll('p')[0].textContent;
                        break;
                    case 8:
                        fight.roundEnded = currentAttr.querySelector('p').textContent;
                        break;
                    case 9:
                        fight.timeEnded = currentAttr.querySelector('p').textContent;
                }
                if(emptyRow) break;
            }
            Object.keys(fight).map((key, index) => {
                    fight[key] = fight[key].trim();
            });
            const stringifiedFight = JSON.stringify(fight);
            this.fights.push(stringifiedFight);
        }
    }

    serialize(){
        return JSON.stringify(this, undefined, 4);
    }
}

module.exports = Fighter;

// todo
// get stats per fight (make another fight class)
// store all stats in mongoDB (get all data in array then if entry already in db ignore)
    //change code function
    // setup crontabs to periodically run scraper function


// setup endpoints to access stats

// dockerize 
// deploy
// error handling
