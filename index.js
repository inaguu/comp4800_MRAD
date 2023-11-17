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
const db_admin = include("database/admin");

const success = db_utils.printMySQLVersion();

const port = process.env.PORT || 3000;

/* START secret information section */

const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const mongodb_host = process.env.MONGODB_REMOTE_HOST;

const node_session_secret = process.env.NODE_SESSION_SECRET; //ensures only a logged-in user can access the site

/* END secret information section */

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
	});

	//Checks DB for user credentials
	//If user exists, session is created.
	if (results) {
		if (results.length == 1) {
			console.log();
			//there should only be 1 user in the db that matches
			if (bcrypt.compareSync(password, results[0].password)) {
				req.session.authenticated = true;
				req.session.user_type = results[0].type;
				req.session.name = results[0].name;
				req.session.user_id = results[0].user_id;
				req.session.cookie.maxAge = expireTime;
				console.log(req.session.user_type);

				if (!isAdmin(req)) {
					//Goes to student landing page upon successful login
					res.redirect("/home", {
						name: req.session.name,
					});
				} else {
					res.redirect("/admin"); //Goes to admin landing page upon successful login
				}

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
			name: req.session.name,
		});
	}
});

//requires session auth
app.get("/admin", (req, res) => {
	if (!isAdmin(req)) {
		res.status(403);
		res.render("403");
	} else {
		res.render("admin_home");
	}
});

//requires admin auth
app.get("/admin-view-students", async (req, res) => {
	if (!isAdmin(req)) {
		res.status(403);
		res.render("403");
	} else {
		let results = await db_admin.getStudents();
		console.log(results);
		if (results) {
			console.log(
				"Server: Successfully retrieved Students MRAD IDs from database."
			);
			res.render("admin_user_list", {
				students: results,
			});
		} else {
			console.log(
				"Server: Error in retrieving Students MRAD IDs from database."
			);
		}
	}
});

//requires admin auth
app.get("/admin-view-students/:MRADid", async (req, res) => {
	if (!isAdmin(req)) {
		res.status(403);
		res.render("403");
	} else {
		let results = await db_admin.getOneStudent({
			MRADid: req.params.MRADid,
		});

		console.log(results);

		if (results) {
			console.log(
				"Server: Successfully retrieved student details from database."
			);
			res.render("admin_profile_view", {
				student: results,
			});
		} else {
			console.log("Server: Error in retrieving student details from database.");
			res.redirect("/admin-view-students");
		}
	}
});

app.get("/signup", (req, res) => {
	res.render("signup");
});

app.post("/submituser", async (req, res) => {
	let username = req.body.username;
	let email = req.body.email;
	let password = req.body.password;

	let hashedPassword = bcrypt.hashSync(password, saltRounds);

	var success = await db_users.createUser({
		username: username,
		email: email,
		hashedPassword: hashedPassword,
	});
	console.log(username);
	console.log(email);
	console.log(hashedPassword);

	if (success) {
		var results = await db_users.getUser({
			email: email,
		});
		req.session.authenticated = true;
		req.session.user_type = results[0].user_type;
		req.session.username = results[0].username;
		req.session.user_id = results[0].user_id;
		req.session.cookie.maxAge = expireTime;
		console.log(results[0].user_id);

		res.redirect("/home"); //Goes to landing page upon successful login
	} else {
		//Redirect to 404 or Page with Generic Error Message??
		console.log("error in creating the user");
	}
});

function isAdmin(req) {
	console.log(req.session.user_type);
	if (req.session.user_type == "admin") {
		return true;
	}
	return false;
}

function adminAuthorization(req, res, next) {
	if (!isAdmin(req)) {
		res.status(403);
		res.render("403", {
			error: "Not Authorized",
		});
		return;
	} else {
		next();
	}
}

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
