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

async function getSelectionResults(postData) {
	let getSelectionResultsSQL = `
	SELECT name, MRAD_id, '1' as Choice, c1p1.site_name as Site1, c1p2.site_name as Site2, c1p3.site_name as Site3
	FROM student_choices
	join users on users.user_id = student_choices.user_id
	join line_options on student_choices.choice_1 = line_options.line_option_id
	join clinical_sites c1p1 on c1p1.clinical_sites_id = line_options.placement_one
	join clinical_sites c1p2 on c1p2.clinical_sites_id = line_options.placement_two
	join clinical_sites c1p3 on c1p3.clinical_sites_id = line_options.placement_three
	WHERE MRAD_id = :MRADid
	UNION
	SELECT name, MRAD_id, '2' as Choice, c2p1.site_name as Site1, c2p2.site_name as Site2, c2p3.site_name as Site3
	FROM student_choices
	join users on users.user_id = student_choices.user_id
	join line_options on student_choices.choice_2 = line_options.line_option_id
	join clinical_sites c2p1 on c2p1.clinical_sites_id = line_options.placement_one
	join clinical_sites c2p2 on c2p2.clinical_sites_id = line_options.placement_two
	join clinical_sites c2p3 on c2p3.clinical_sites_id = line_options.placement_three
	WHERE MRAD_id = :MRADid
	UNION
	SELECT name, MRAD_id, '3' as Choice, c3p1.site_name as Site1, c3p2.site_name as Site2, c3p3.site_name as Site3
	FROM student_choices
	join users on users.user_id = student_choices.user_id
	join line_options on student_choices.choice_3 = line_options.line_option_id
	join clinical_sites c3p1 on c3p1.clinical_sites_id = line_options.placement_one
	join clinical_sites c3p2 on c3p2.clinical_sites_id = line_options.placement_two
	join clinical_sites c3p3 on c3p3.clinical_sites_id = line_options.placement_three
	WHERE MRAD_id = :MRADid
	UNION
	SELECT name, MRAD_id, '4' as Choice, c4p1.site_name as Site1, c4p2.site_name as Site2, c4p3.site_name as Site3
	FROM student_choices
	join users on users.user_id = student_choices.user_id
	join line_options on student_choices.choice_4 = line_options.line_option_id
	join clinical_sites c4p1 on c4p1.clinical_sites_id = line_options.placement_one
	join clinical_sites c4p2 on c4p2.clinical_sites_id = line_options.placement_two
	join clinical_sites c4p3 on c4p3.clinical_sites_id = line_options.placement_three
	WHERE MRAD_id = :MRADid
	UNION
	SELECT name, MRAD_id, '5' as Choice, c5p1.site_name as Site1, c5p2.site_name as Site2, c5p3.site_name as Site3
	FROM student_choices
	join users on users.user_id = student_choices.user_id
	join line_options on student_choices.choice_5 = line_options.line_option_id
	join clinical_sites c5p1 on c5p1.clinical_sites_id = line_options.placement_one
	join clinical_sites c5p2 on c5p2.clinical_sites_id = line_options.placement_two
	join clinical_sites c5p3 on c5p3.clinical_sites_id = line_options.placement_three
	WHERE MRAD_id = :MRADid;
	`;

	let params = {
		MRADid: postData.MRADid,
	};

	try {
		const results = await database.query(getSelectionResultsSQL, params);
		console.log("Successfully found student selection results.");
		console.log(results);
		return results[0];
	} catch (err) {
		console.log("Error trying to find student selection results.");
		console.log(err);
		return false;
	}
}

module.exports = {
	getStudents,
	getOneStudent,
	getSelectionResults,
};