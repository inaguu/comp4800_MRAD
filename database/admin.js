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
	// let getOneStudentSQL = `
    //     SELECT *
    //     FROM users
    //     JOIN user_type USING (user_type_id)
    //     WHERE MRAD_id = :MRADid;
	// `;

	let getStudentChoicesSQL = `
	SELECT u.*, ut.type,
	cs1.site_name AS choice_1_site_name
	cs2.site_name AS choice_2_site_name
	cs3.site_name AS choice_3_site_name
	cs4.site_name AS choice_4_site_name
	cs5.site_name AS choice_5_site_name
	FROM users u
	JOIN
	user_type ut ON u.user_type_id = ut.user_type_id
	LEFT JOIN
	student_choices sc ON sc.user_id = u.user_id
	LEFT JOIN
	clinical_sites cs1 ON cs1.clinical_sites_id = sc.choice_1
	LEFT JOIN
	clinical_sites cs2 ON cs2.clinical_sites_id = sc.choice_2
	LEFT JOIN
	clinical_sites cs3 ON cs3.clinical_sites_id = sc.choice_3
	LEFT JOIN
	clinical_sites cs4 ON cs4.clinical_sites_id = sc.choice_4
	LEFT JOIN
	clinical_sites cs5 ON cs5.clinical_sites_id = sc.choice_5
	WHERE u.MRAD_id = :MRADid;
	`;

	let params = {
		MRADid: postData.MRADid,
	};

	try {
		const results = await database.query(getStudentChoicesSQL, params);

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
