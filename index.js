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

const option_generator = include("generate_selections");
const db_admin = include("database/admin");
const db_query = include("database/query");
const db_selections = include("database/selections");

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
		user: "mrad.selection@gmail.com",
		pass: "nhwxozlwribtokpw",
	},
	secure: true, // upgrades later with STARTTLS -- change this based on the PORT
});

/* END */

const app = express();
app.use(express.static(path.join(__dirname, "dist")));
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

app.get("/login", (req, res) => {
	res.render("login");
});
// This is how you send emails
app.post("/send-mail", (req, res) => {
	console.log("attempt to send email");

	const data = {
		from: "mrad.selection@gmail.com", // sender address
		to: "uberduper2@gmail.com", // list of receivers
		subject: "Sending Email using Node.js",
		text: "That was easy!",
	};

	transporter.sendMail(data, (err, info) => {
		if (err) {
			console.log(err);
		}
		res.status(200).send({ message: "Mail send", message_id: info.messageId });
	});
});
// end of sending emails

app.get("/profile", async (req, res) => {
	if (!isValidSession(req)) {
		res.redirect("/");
	} else {
		let results = await db_users.getUser({
			email: req.session.email,
		});
		console.log(results[0]);

		let selectionsC1 = await db_selections.getStudentSelectionC1({
			user_id: req.session.user_id,
		});

		let selectionsC2 = await db_selections.getStudentSelectionC2({
			user_id: req.session.user_id,
		});

		let selectionsC3 = await db_selections.getStudentSelectionC3({
			user_id: req.session.user_id,
		});

		let selectionsC4 = await db_selections.getStudentSelectionC4({
			user_id: req.session.user_id,
		});

		let selectionsC5 = await db_selections.getStudentSelectionC5({
			user_id: req.session.user_id,
		});

		const user_selection = [
			{
				choice: 1,
				line_number: selectionsC1[0].line_number,
				sites: {
					site_1: selectionsC1[0].site_name_one,
					site_2: selectionsC1[0].site_name_two,
					site_3: selectionsC1[0].site_name_three,
				},
			},
			{
				choice: 2,
				line_number: selectionsC2[0].line_number,
				sites: {
					site_1: selectionsC2[0].site_name_one,
					site_2: selectionsC2[0].site_name_two,
					site_3: selectionsC2[0].site_name_three,
				},
			},
			{
				choice: 3,
				line_number: selectionsC3[0].line_number,
				sites: {
					site_1: selectionsC3[0].site_name_one,
					site_2: selectionsC3[0].site_name_two,
					site_3: selectionsC3[0].site_name_three,
				},
			},
			{
				choice: 4,
				line_number: selectionsC4[0].line_number,
				sites: {
					site_1: selectionsC4[0].site_name_one,
					site_2: selectionsC4[0].site_name_two,
					site_3: selectionsC4[0].site_name_three,
				},
			},
			{
				choice: 5,
				line_number: selectionsC5[0].line_number,
				sites: {
					site_1: selectionsC5[0].site_name_one,
					site_2: selectionsC5[0].site_name_two,
					site_3: selectionsC5[0].site_name_three,
				},
			},
		];

		if (results) {
			res.render("profile", {
				results: results[0],
				user_selection: user_selection,
			});
		}
	}
});

app.post("/profile/update", async (req, res) => {
	if (!isValidSession(req)) {
		res.redirect("/");
	} else {
		let results = await db_users.getUser({
			email: req.session.email,
		});

		let name = req.body.profile_name;
		let email = req.body.profile_email;

		if (name == "" && email == "") {
			res.redirect("/profile");
		} else if (email == "") {
			let db_email = results[0].email;

			let update_status = await db_users.updateUser({
				name: name,
				email: db_email,
				user_id: req.session.user_id,
			});

			if (update_status) {
				req.session.name = name;
				res.redirect("/profile");
			} else {
				console.log(update_status);
			}
		} else if (name == "") {
			let db_name = results[0].name;

			let update_status = await db_users.updateUser({
				name: db_name,
				email: email,
				user_id: req.session.user_id,
			});

			if (update_status) {
				req.session.email = email;
				res.redirect("/profile");
			} else {
				console.log(update_status);
			}
		} else {
			let update_status = await db_users.updateUser({
				name: name,
				email: email,
				user_id: req.session.user_id,
			});

			if (update_status) {
				req.session.name = name;
				req.session.email = email;
				res.redirect("/profile");
			} else {
				console.log(update_status);
			}
		}
	}
});

app.post("/addClinicalSite", async (req, res) => {
	var siteName = req.body.siteName;
	var totalSpots = req.body.spotsNumber;
	var siteZone = req.body.siteLocation;

	var results = await db_query.insertClinicalSites({
		siteName: siteName,
		totalSpots: totalSpots,
		siteZone: siteZone,
	});
	res.redirect("admin-site-list");
});

app.post("/generateSiteOptions", async (req, res) => {
	const sites = await db_query.getActiveClinicalSites();
	let options = option_generator.generateOptions(sites);
	const intake_res = await db_query.getMaxIntake();

	const queryArr = [];
	for (let i = 0; i < options.length; i++) {
		queryArr.push([
			options[i][0].clinical_sites_id,
			options[i][1].clinical_sites_id,
			options[i][2].clinical_sites_id,
			intake_res.intake_max,
			options[i][3],
		]);
	}
	await db_query.insertOptionRows(queryArr);
	res.send(queryArr);
});

app.get("/admin-site-list", async (req, res) => {
	try {
		var [results] = await db_query.getClinicalSites();
	} catch (err) {
		console.log("Missing clinical sites");
	}
	res.render("admin_site_list", { sites: results });
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
				req.session.email = results[0].email;
				req.session.MRAd_id = results[0].MRAD_id;
				req.session.user_id = results[0].user_id;
				req.session.cookie.maxAge = expireTime;
				console.log(req.session.user_type);

				if (!isAdmin(req)) {
					//Goes to student landing page upon successful login
					res.redirect("/home");
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

app.get("/forgot-password/enter-email", (req, res) => {
	res.render("enter_email_fp");
});

app.post("/forgot-password/email-send", (req, res) => {
	let email = req.body.email;
	req.session.email = email;

	const data = {
		from: "mrad.selection@gmail.com", // sender address
		to: email, // list of receivers
		subject: "MRAD Password Reset",
		text: `Please click the link to reset your password. \n\n http://localhost:3000/forgot-password/enter-password \n\n If this was not you, then dismiss this email.`,
	};

	transporter.sendMail(data, (err, info) => {
		if (err) {
			console.log(err);
		}
		res.render("enter_email_fp");
	});
});

app.get("/forgot-password/enter-password", (req, res) => {
	res.render("enter_password_fp");
});

app.post("/forgot-password/password-send", async (req, res) => {
	let password = req.body.password;

	let hashedPassword = bcrypt.hashSync(password, saltRounds);

	let updated_password = await db_users.updateUserPassword({
		email: req.session.email,
		password: hashedPassword,
	});

	if (updated_password) {
		res.redirect("/");
	} else {
		console.log(updated_password);
	}
});

app.post("/logout", (req, res) => {
	req.session.authenticated = false;
	req.session.destroy();
	res.redirect("/login");
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
app.get("/admin", async (req, res) => {
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

app.get("/admin-view-students/:MRADid", async (req, res) => {
	if (!isAdmin(req)) {
		res.status(403);
		res.render("403");
	} else {
		let results = await db_admin.getSelectionResults({
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

app.get("/admin/tools", async (req, res) => {
	if (!isAdmin(req)) {
		res.status(403)
		res.render("403")
	} else {
		let intake = await db_query.getMaxIntake();
		let code = await db_admin.getSecurityCode();
		res.render("admin_tools", {code : code[0].security_code, intake: intake.intake_max})
	}
})

app.post("/admin/send-email", async (req, res) => {
	if (!isAdmin(req)) {
		res.status(403)
		res.render("403")
	} else {
		let emails = await db_admin.getStudentEmails()

		const data = {
			from: "mrad.selection@gmail.com", // sender address
			to: emails[0], // list of receivers
			subject: "MRAD Final Selection",
			text: `yo`,
		};
	
		transporter.sendMail(data, (err, info) => {
			if (err) {
				console.log(err);
			}
			res.redirect("/admin/tools");
		});
	}
})

app.get("/disclaimer", (req, res) => {
	res.render("disclaimer");
});

app.get("/signup", (req, res) => {
	res.render("signup");
});

app.post("/submituser", async (req, res) => {
	let name = req.body.name;
	let email = req.body.email;
	let password = req.body.password;
	let MRAD_id = req.body.MRAD_id;;
	let security_code = req.body.security_code;

	let hashedPassword = bcrypt.hashSync(password, saltRounds);

	let code = await db_admin.getSecurityCode();
	console.log(code)	
	
	if(security_code !== code[0].security_code){
		res.redirect('signup')
		
	} else {
		var success = await db_users.createUser({
			name: name,
			email: email,
			hashedPassword: hashedPassword,
			MRAD_id: MRAD_id,
		});
	
		if (success) {
			var results = await db_users.getUser({
				email: email,
			});
	
			req.session.authenticated = true;
			req.session.user_type = results[0].type;
			req.session.name = results[0].name;
			req.session.email = results[0].email;
			req.session.MRAd_id = results[0].MRAD_id;
			req.session.user_id = results[0].user_id;
			req.session.cookie.maxAge = expireTime;
			if (req.session.user_type === "student") {
				await db_query.setSelectionFirstTime({ user_id: results[0].user_id });
			}
			res.redirect("/home"); //Goes to landing page upon successful login
		} else {
			//Redirect to 404 or Page with Generic Error Message??
			console.log("error in creating the user");
		}
	}

});


function generateSecurityCode() {
	let code = '';
	let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@$';
	let charactersLength = characters.length;
	for (let j = 0; j < 7; j++) {
		code += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return code;
};

app.post('/generate-code', async (req, res) => {
	let code = generateSecurityCode(); // generate only one code now

	try {
		await db_admin.insertSecurityCode({code: code}); // inserting to db
		res.redirect("admin");
	} catch(err){
		console.log(`Error inserting code: ${code}`);
		console.log(err)
		res.status(500).json({ success: false, error: "failed to insert security code properly"});
	}
});

app.get("/selection", async (req, res) => {
	const optionLines = await db_query.getOptionRows();

	res.render("selection", { options: optionLines, requestMsg: "" });
});

app.post("/updateSites", async (req, res) => {
	const siteName = req.body.siteName;
	const siteSpots = req.body.siteSpots;
	const isActive = req.body.active === "on" ? 1 : 2;
	const clinical_id = req.body.siteID;

	if (siteName !== "" || siteSpots !== "") {
		var results = await db_query.updateClinicalSites({
			siteName: siteName,
			siteSpots: siteSpots,
			isActive: isActive,
			clinical_id: clinical_id,
		});
		console.log("Sucess Updating Clinical Site");
		res.redirect("admin-site-list");
	} else {
		console.log("Failed to update");
		res.redirect("admin-site-list");
	}
});

app.post("/saveChoices", async (req, res) => {
	const optionLines = await db_query.getOptionRows();

	var selection1 = parseInt(req.body.oneLine);
	var selection2 = parseInt(req.body.twoLine);
	var selection3 = parseInt(req.body.threeLine);
	var selection4 = parseInt(req.body.fourLine);
	var selection5 = parseInt(req.body.fiveLine);
	var user_id = req.session.user_id;

	if (
		selection1 !== selection2 &&
		selection1 !== selection3 &&
		selection1 !== selection4 &&
		selection1 !== selection5 &&
		selection2 !== selection3 &&
		selection2 !== selection4 &&
		selection2 !== selection5 &&
		selection3 !== selection4 &&
		selection3 !== selection5 &&
		selection4 !== selection5
	) {
		if (
			isNaN(selection1) ||
			isNaN(selection2) ||
			isNaN(selection3) ||
			isNaN(selection4) ||
			isNaN(selection5)
		) {
			res.render("selection", {
				options: optionLines,
				requestMsg: "You are missing a choice",
			});
		} else {
			try {
				var result = await db_query.saveSelection({
					selection1: selection1,
					selection2: selection2,
					selection3: selection3,
					selection4: selection4,
					selection5: selection5,
					user_id: user_id,
				});
				console.log("Success");
				res.render("selection", {
					options: optionLines,
					requestMsg: "Successfully Saved!",
				});
			} catch (error) {
				console.log("Failure");
				res.render("selection", {
					options: optionLines,
					requestMsg: "Failed to Save",
				});
			}
		}
	} else {
		res.render("selection", {
			options: optionLines,
			requestMsg: "Please pick 5 unique choices.",
		});
		console.log("Non-unique selections.");
	}
});

app.get("/getSelections", async (req, res) => {
	var [results] = await db_query.getActiveClinicalSites();
	return res.json(results);
});

app.post("/newIntake", async (req,res) => {
	await db_admin.createNewIntake();
	res.redirect("admin");
})

app.use(express.static(__dirname + "/public"));

app.get("*", (req, res) => {
	res.status(404);
	res.render("404");
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
function isValidSession(req) {
	if (req.session.authenticated) {
		return true;
	}
	return false;
}

app.listen(port, () => {
	console.log("Node application listening on port " + port);
});
