const database = include('database_connection');

async function createUser(postData) {
	let createUserSQL = `
		INSERT INTO user
		(username, email, hashedPassword, user_type_id)
		VALUES
		(:user, :email, :hashedPassword, 1);
	`;

	let params = {
		user: postData.username,
		email: postData.email,
		hashedPassword: postData.hashedPassword
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

async function getUsers(postData) {
	let getUsersSQL = `
		SELECT user_id, username, user_type
		FROM user
		JOIN user_type USING (user_type_id);
	`;

	try {
		const results = await database.query(getUsersSQL);

		console.log("Successfully retrieved users");
		console.log(results[0]);		
		return results[0];			//!! Gets ALL users and returns the first user account !!
	} catch (err) {
		console.log("Error getting users");
		console.log(err);
		return false;
	}
}

async function getUser(postData) {
	let getUserSQL = `
		SELECT user_id, username, email, hashedPassword, user_type_id, user_type
		FROM user
		JOIN user_type USING (user_type_id)
		WHERE email = :email;
	`;

	let params = {
		email: postData.email
	}

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


module.exports = {
	createUser,
	getUsers,
	getUser
};