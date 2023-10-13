require('./utils');
require('dotenv').config();
const path = require('path');

const express = require('express');
const session = require('express-session');
const MongoStore = require("connect-mongo");

const port = process.env.PORT || 3000;
const node_session_secret = process.env.NODE_SESSION_SECRET;

const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const mongodb_host = process.env.MONGODB_REMOTE_HOST;

const app = express();
app.use(express.static(path.join(__dirname, 'dist')))
app.set("view engine", "ejs");

app.use(express.urlencoded({extended: false}));

var mongoStore = MongoStore.create({
	mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/?retryWrites=true&w=majority`,
	crypto: {
		secret: mongodb_session_secret,
	},
});

app.use(session({ 
    secret: node_session_secret,
    store: mongoStore,
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

app.get('/clinical_sites', (req,res) =>{
    res.render("clinical_sites")
})

// app.use(express.static(__dirname + "/public"));


app.get("*", (req, res) => {
    res.status(404)
    res.render("404")
})

app.listen(port, () => {
	console.log("Node application listening on port "+port);
}); 
