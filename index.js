require("./utils");
require("dotenv").config();
const path = require("path");

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer")
const saltRounds = 12;

const database = include("database_connection");
const db_utils = include("database/db_utils");
const db_users = include("database/users");
const db_query = include("database/query")

const success = db_utils.printMySQLVersion();

const port = process.env.PORT || 3000;

/* START secret information section */

const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const mongodb_host = process.env.MONGODB_REMOTE_HOST;

const node_session_secret = process.env.NODE_SESSION_SECRET; //ensures only a logged-in user can access the site

/* END secret information section */

/* function for mail sending (auth and stuff) */

const transporter = nodemailer.createTransport({
	service: "gmail",
    port: 465,
    host: "smtp.gmail.com",
    auth: {
        user: 'mrad.selection@gmail.com',
        pass: 'nhwxozlwribtokpw',
    },
    secure: true, // upgrades later with STARTTLS -- change this based on the PORT
});

/* END */

const app = express();
app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.static(__dirname + "/public"));

const expireTime = 60 * 60 * 1000; //expires after 1 hour  (hours * minutes * seconds * millis)
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
	res.render("login");
});

// This is how you send emails
app.post("/send-mail", (req, res) => {
	console.log("attempt to send email")

	const data = {
		from: 'mrad.selection@gmail.com',  // sender address
		to: 'uberduper2@gmail.com',   // list of receivers
		subject: 'Sending Email using Node.js',
		text: 'That was easy!',
	}

	transporter.sendMail(data, (err, info) => {
		if (err) {
			console.log(err)
		}
		res.status(200).send({ message: "Mail send", message_id: info.messageId });
	})
})
// end of sending emails

app.get('/profile', async (req, res) => {
	if (!isValidSession(req)) {
		res.redirect("/");
	} else {
		let results = await db_users.getUser({
			email: req.session.email
		})

		// let selections = await db_query.getStudentChoice({
		// 	user_id: req.session.user_id
		// })

		const students = [
			{ id: 1, sites: {site_1: 'VGH', site_2: 'Kelowna', site_3: 'Richmond', site_4: 'Port Coquitlam', site_5: 'North Vancouver' }},
			{ id: 2, sites: {site_1: 'VGH', site_2: 'Kelowna', site_3: 'Richmond', site_4: 'Port Coquitlam', site_5: 'North Vancouver' }},
			{ id: 3, sites: {site_1: 'VGH', site_2: 'Kelowna', site_3: 'Richmond', site_4: 'Port Coquitlam', site_5: 'North Vancouver' }},
			{ id: 4, sites: {site_1: 'VGH', site_2: 'Kelowna', site_3: 'Richmond', site_4: 'Port Coquitlam', site_5: 'North Vancouver' }},
			{ id: 5, sites: {site_1: 'VGH', site_2: 'Kelowna', site_3: 'Richmond', site_4: 'Port Coquitlam', site_5: 'North Vancouver' }},
		]
	
		if (results) {
			res.render("profile", {
				results: results[0],
				students: students
			})
		}
	}
})

app.post("/profile/update", async (req, res) => {
	if (!isValidSession(req)) {
		res.redirect("/");
	} else {
		let results = await db_users.getUser({
			email: req.session.email
		})

		let name = req.body.profile_name
		let email = req.body.profile_email

		if (name == '') {
			let db_name = results[0].name

			let update_status = await db_users.updateUser({
				name: db_name,
				email: email,
				user_id: req.session.user_id
			})

			if (update_status) {
				req.session.email = email
				res.redirect("/profile")
			} else {
				console.log(update_status)
			}

		} else if (email == '') {
			let db_email = results[0].email

			let update_status = await db_users.updateUser({
				name: name,
				email: db_email,
				user_id: req.session.user_id
			})

			if (update_status) {
				req.session.name = name
				res.redirect("/profile")
			} else {
				console.log(update_status)
			}			

		} else {
			let update_status = await db_users.updateUser({
				name: name,
				email: email,
				user_id: req.session.user_id
			})

			if (update_status) {
				req.session.name = name
				req.session.email = email
				res.redirect("/profile")
			} else {
				console.log(update_status)
			}
		}
	}
})

app.post('/addClinicalSite', async (req,res) => {
	var siteName = req.body.siteName;
	var totalSpots = req.body.spotsNumber;
	var siteZone = req.body.siteLocation;

	var results = await db_query.insertClinicalSites({
		siteName: siteName,
		totalSpots: totalSpots,
		siteZone: siteZone
	})
	res.redirect('admin-site-list');
})

app.get('/admin-site-list', async (req,res) =>{	
	try {
		var [results] = await db_query.getClinicalSites()

	}catch(err) {
		console.log("Missing clinical sites")
	}
    res.render("admin_site_list", {sites: results})
})

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
			//there should only be 1 user in the db that matches
			if (bcrypt.compareSync(password, results[0].password)) {
				req.session.authenticated = true;
				req.session.user_type = results[0].type;
				req.session.name = results[0].name;
				req.session.email = results[0].email;
				req.session.MRAd_id = results[0].MRAD_id;
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

app.get("/forgot-password/enter-email", (req, res) => {
	res.render("enter_email_fp")
})

app.post("/forgot-password/email-send", (req, res) => {
	let email = req.body.email
	req.session.email = email

	const data = {
		from: 'mrad.selection@gmail.com',  // sender address
		to: email,   // list of receivers
		subject: 'MRAD Password Reset',
		text: `Please click the link to reset your password. \n\n http://localhost:3000/forgot-password/enter-password \n\n If this was not you, then dismiss this email.`,
	}

	transporter.sendMail(data, (err, info) => {
		if (err) {
			console.log(err)
		}
		res.render("enter_email_fp")
	})
})

app.get("/forgot-password/enter-password", (req, res) => {
	res.render("enter_password_fp")
})

app.post("/forgot-password/password-send", async (req, res) => {
	let password = req.body.password

	let hashedPassword = bcrypt.hashSync(password, saltRounds);

	let updated_password = await db_users.updateUserPassword({
		email: req.session.email,
		password: hashedPassword
	})

	if (updated_password) {
		res.redirect("/")
	} else {
		console.log(updated_password)
	}
})

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

app.get("/signup", (req, res) => {
	res.render("signup");
});

app.post("/submituser", async (req, res) => {
	let name = req.body.name;
	let email = req.body.email;
	let password = req.body.password;
	let MRAD_id = req.body.MRAD_id

	let hashedPassword = bcrypt.hashSync(password, saltRounds);

	var success = await db_users.createUser({
		name: name,
		email: email,
		hashedPassword: hashedPassword,
		MRAD_id: MRAD_id
	});


	
	console.log(name);
	console.log(email);
	console.log(hashedPassword);
	console.log(MRAD_id)

	if (success) {
		var results = await db_users.getUser({
			email: email
		});
		
		req.session.authenticated = true;
		req.session.user_type = results[0].type;
		req.session.name = results[0].name;
		req.session.email = results[0].email;
		req.session.MRAd_id = results[0].MRAD_id;
		req.session.user_id = results[0].user_id;
		req.session.cookie.maxAge = expireTime;

		await db_query.setSelectionFirstTime({user_id : results[0].user_id})
		res.redirect("/home"); //Goes to landing page upon successful login
	} else {
		//Redirect to 404 or Page with Generic Error Message??
		console.log("error in creating the user");
	}
});

app.get('/selection', (req, res) => {
    res.render("selection", { selectedValue: 0});
})

app.post('/saveChoices', async (req, res) => {
	var selection1 = parseInt(req.body.oneLine);
	var selection2 = parseInt(req.body.twoLine);
	var selection3 = parseInt(req.body.threeLine);
	var selection4 = parseInt(req.body.fourLine);
	var selection5 = parseInt(req.body.fiveLine);
	var user_id = req.session.user_id;

	if(isNaN(selection1) || isNaN(selection2) || isNaN(selection3) || isNaN(selection4) || isNaN(selection5)){
		console.log("You are missing a choice")
		res.redirect("/selection")
	} else {
		try {
			var result = await db_query.saveSelection({
				selection1 : selection1, 
				selection2 : selection2,
				selection3 : selection3,
				selection4 : selection4,
				selection5 : selection5,
				user_id : user_id
			})
			console.log("Success")
			res.redirect("/selection")
		} catch (error) {
			console.log("Failure")
			res.redirect("/selection")
		}
	}
})

app.use(express.static(__dirname + "/public"));

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

app.listen(port, () => {
	console.log("Node application listening on port " + port);
});
