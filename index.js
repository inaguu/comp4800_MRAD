require('./utils');
require('dotenv').config();
const path = require('path');

const express = require('express');
const session = require('express-session');

const port = process.env.PORT || 3000;
const node_session_secret = process.env.NODE_SESSION_SECRET;

const app = express();
app.use(express.static(path.join(__dirname, 'dist')))
app.set("view engine", "ejs");

app.use(express.urlencoded({extended: false}));

app.use(session({ 
    secret: node_session_secret,
    //default is memory store 
	saveUninitialized: false, 
	resave: true
}
));

app.get('/', (req, res) => {
    res.render("index")
})

app.get('/profile', (req, res) => {
    res.render("profile")
})

// app.use(express.static(__dirname + "/public"));


app.get("*", (req, res) => {
    res.status(404)
    res.render("404")
})

app.listen(port, () => {
	console.log("Node application listening on port "+port);
}); 

// this is a test comment for my github (ian)