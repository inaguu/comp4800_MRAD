require("./utils");
require("dotenv").config();
const path = require("path");

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const saltRounds = 12;

const database = include("database_connection");
const db_utils = include("database/db_utils");
const db_users = include("database/users");

const success = db_utils.printMySQLVersion();

const port = process.env.PORT || 3000;

/* secret information section */

const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const mongodb_cluster = process.env.MONGODB_CLUSTER;

const node_session_secret = process.env.NODE_SESSION_SECRET; //ensures only a logged-in user can access the site
/* END secret section */

const app = express();

const expireTime = 60 * 60 * 1000; //expires after 1 hour  (hours * minutes * seconds * millis)

app.use(express.static(path.join(__dirname, "dist")));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

var mongoStore = MongoStore.create({
	mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}${mongodb_cluster}`,
	crypto: {
		secret: mongodb_session_secret,
	},
});

app.use(
	session({
		secret: node_session_secret,
		store: mongoStore, //default is memory store
		saveUninitialized: false,
		resave: true,
	})
);

app.get("/", (req, res) => {
	res.render("index");
});

app.get("/login", (req, res) => {
	res.render("login", {
		error: "none",
	});
});

app.post("/loggingin", async (req, res) => {
	var email = req.body.email;
	var password = req.body.password;
});

app.get("/signup", (req, res) => {
	res.render("signup");
});

app.post("/signup", (req, res) => {
	res.render("signup");
});

app.get("*", (req, res) => {
	res.status(404);
	res.render("404");
});

app.use(express.static(__dirname + "/public"));

app.listen(port, () => {
	console.log("Node application listening on port " + port);
});

// this is a test comment for my github (ian)
