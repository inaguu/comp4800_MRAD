const database = include("database_connection");

async function getStudents(postData) {
	let getStudentsSQL = `
        SELECT MRAD_id
        FROM users
        JOIN user_type USING (user_type_id)
        WHERE type = 'student';
	`;

	try {
		const results = await database.query(getStudentsSQL);

		console.log("Successfully found students MRAD IDs");
		console.log(results);
		return results[0];
	} catch (err) {
		console.log("Error trying to find students MRAD IDs");
		console.log(err);
		return false;
	}
}

async function getOneStudent(postData) {
	let getOneStudentSQL = `
        SELECT *
        FROM users
        JOIN user_type USING (user_type_id)
        WHERE MRAD_id = :MRADid;
	`;

	let params = {
		MRADid: postData.MRADid,
	};

	try {
		const results = await database.query(getOneStudentSQL, params);

		console.log("Successfully found students MRAD IDs");
		console.log(results);
		return results[0][0];
	} catch (err) {
		console.log("Error trying to find students MRAD IDs");
		console.log(err);
		return false;
	}
}

module.exports = {
	getStudents,
	getOneStudent,
};
