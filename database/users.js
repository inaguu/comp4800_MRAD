const database = include('database_connection');

async function createUser(postData) {
	let createUserSQL = `
		INSERT INTO users
		(name, email, password, MRAD_id, user_type_id, intake_number)
		VALUES
		(:name, :email, :hashedPassword, :MRAD_id, 2, (SELECT MAX(intake_id) FROM intake));
	`;

	let params = {
		name: postData.name,
		email: postData.email,
		hashedPassword: postData.hashedPassword,
		MRAD_id: postData.MRAD_id
	}

	try {
		const results = await database.query(createUserSQL, params);

		console.log("Successfully created user");
		console.log(results[0]);
		return true;
	} catch (err) {
		console.log("Error inserting user");
		console.log(err);
		return false;
	}
}

// async function getUsers(postData) {
// 	let getUsersSQL = `
// 		SELECT user_id, name, email, MRAD_id, type
// 		FROM users
// 		JOIN user_type USING (user_type_id);
// 	`;

// 	try {
// 		const results = await database.query(getUsersSQL);

// 		console.log("Successfully retrieved users");
// 		console.log(results[0]);		
// 		return results[0];			//!! Gets ALL users and returns the first user account !!
// 	} catch (err) {
// 		console.log("Error getting users");
// 		console.log(err);
// 		return false;
// 	}
// }

async function getUser(postData) {
	let getUserSQL = `
		SELECT user_id, name, email, password, MRAD_id, type, interior_bc, lower_mainland
		FROM users
		JOIN user_type USING (user_type_id)
		WHERE email = :email;
	`;

	let params = {
		email: postData.email
	}
	console.log(postData.email)

	try {
		const results = await database.query(getUserSQL, params);

		console.log("Successfully found user");
		console.log(results[0]);
		return results[0];
	} catch (err) {
		console.log("Error trying to find user");
		console.log(err);
		return false;
	}
}

async function updateUser(postData) {
	let updateUserSQL = `
		UPDATE users
		SET name = :name, email = :email
		WHERE user_id = :user_id
	`;

	let params = {
		name: postData.name,
		email: postData.email,
		user_id: postData.user_id
	}

	try {
		const results = await database.query(updateUserSQL, params);
		console.log("Successfully updated user");
		console.log(results[0]);
		return true;
	} catch (err) {
		console.log("Error trying to find user");
		console.log(err);
		return false;
	}
}

async function updateUserPassword(postData) {
	let updateUserPasswordSQL = `
		UPDATE users
		SET password = :password
		WHERE email = :email
	`;

	let params = {
		password: postData.password,
		email: postData.email,
	}

	try {
		const results = await database.query(updateUserPasswordSQL, params);
		console.log("Successfully updated user password");
		console.log(results[0]);
		return true;
	} catch (err) {
		console.log("Error trying to find user");
		console.log(err);
		return false;
	}
}

// temporary db query till we have a table or column for it
async function checkSecurityCode(postData){
	let checkCodeSQL = `
	SELECT COUNT(*) AS codeCount
	FROM security_code_table
	WHERE security_code = :code;
	`;
	
	let params = {
		code: postData.code
	};

	try {
		const results = await database.query(checkCodeSQL, params);
		return results[0];
	} catch(err){
		console.log("Error trying to validate security code");
		console.log(err);
		return false;
	}
}

module.exports = {
	createUser,
	getUser,
	updateUser,
	updateUserPassword,
	checkSecurityCode
};