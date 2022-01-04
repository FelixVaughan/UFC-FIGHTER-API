const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config();
const app = express();

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
  console.log(`Mongo connection establised on port ${process.env.DBPORT}`);
});