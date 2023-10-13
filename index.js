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
const mongodb_host = process.env.MONGODB_REMOTE_HOST;

const node_session_secret = process.env.NODE_SESSION_SECRET; //ensures only a logged-in user can access the site
/* END secret section */

const app = express();

const expireTime = 60 * 60 * 1000; //expires after 1 hour  (hours * minutes * seconds * millis)

app.use(express.static(path.join(__dirname, "dist")));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

var mongoStore = MongoStore.create({
	mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/?retryWrites=true&w=majority`,
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
	res.render("login");
});

app.post("/loggingin", async (req, res) => {
	var email = req.body.email;
	var password = req.body.password;

	var results = await db_users.getUser({
		email: email,
		hashedPassword: password,
	});

	//Checks DB for user credentials
	//If user exists, session is created.
	if (results) {
		if (results.length == 1) {
			//there should only be 1 user in the db that matches
			if (bcrypt.compareSync(password, results[0].hashedPassword)) {
				req.session.authenticated = true;
				req.session.user_type = results[0].user_type;
				req.session.username = results[0].username;
				req.session.user_id = results[0].user_id;
				req.session.cookie.maxAge = expireTime;

				res.redirect("/home"); //Goes to landing page upon successful login

				return;
			} else {
				console.log("invalid password");
			}
		} else {
			console.log(
				"invalid number of users matched: " + results.length + " (expected 1)."
			);
			res.render("login");
			return;
		}
	}

	console.log("user not found");
	//user and password combination not found
	res.render("login");
});

app.post("/logout", (req, res) => {
	req.session.authenticated = false;
	req.session.destroy();
	res.redirect("/");
});

//requires session auth
app.get("/home", (req, res) => {
	if (!isValidSession(req)) {
		res.redirect("/");
	} else {
		res.render("landing_page", {
			username: req.session.username,
		});
	}
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

function isValidSession(req) {
	if (req.session.authenticated) {
		return true;
	}
	return false;
}

app.use(express.static(__dirname + "/public"));

app.listen(port, () => {
	console.log("Node application listening on port " + port);
});
