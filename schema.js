const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fighterSchema = new Schema({
    firstName: String,
    lastName: String,
    Alias: String,
    height: String,
    weight: String,
    reach: String,
    wins: Number,
    losses: Number,
    draws: Number,
    belt: String,
    code: String,
    fights: [String],
    dob: String,
    strikesLandedPerMin: Number,
    strikingTakenPerMinute: Number,
    averageTakedownper15Mins: Number,
    submssionAttemptsper15Mins: Number,
    strikingAccuracy: Number,
    strikesDefendedPerMin: Number,
    takedownAccuracy: Number,
    takedownDefence:Number,
});

module.exports = fighterSchema;