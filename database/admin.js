const database = include("database_connection");

async function getStudents(postData) {
	let getStudentsSQL = `
        SELECT MRAD_id, interior_bc, lower_mainland
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
        SELECT MRAD_id, interior_bc, lower_mainland
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
		return results[0];
	} catch (err) {
		console.log("Error trying to find student selection results.");
		console.log(err);
		return false;
	}
}

async function insertSecurityCode(postData) {
	let insertSecurityCodeSQL = `
	INSERT INTO security_code (security_code)
	VALUES (:code);
	`;

	let params = {
		code: postData.code,
	};

	try {
		await database.query(insertSecurityCodeSQL, params);
		console.log(`Successfully inserted code: ${postData.code}`);
	} catch (err) {
		console.log(`Error trying to insert code: ${postData.code}`);
		console.log(err);
	}
}

async function getSecurityCode() {
	let getSecurityCodeSQL = `
	SELECT security_code
	FROM security_code
	ORDER BY security_id DESC
	LIMIT 1;
	`;

	try {
		const results = await database.query(getSecurityCodeSQL);
		console.log("Successfully retrieved the latest security code");
		return results[0];
	} catch (err) {
		console.log("Error trying to retrieve the latest security code");
		console.log(err);
		return false;
	}
}

async function createNewIntake(postData) {
	let newIntake = `
	INSERT INTO intake (start_date, end_date)
	VALUES (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL 2 YEAR);
	`;

	let params = {
		user_id: postData.user_id,
	}

	try {
		await database.query(newIntake);
		await databbase.query(`UPDATE mradselector.users SET intake_number = (SELECT MAX(intake_id) AS intake_max FROM intake) WHERE user_id = :user_id;`, params)
		console.log("New Intake Created");
		return true;
	} catch (err) {
		console.log("Could not create new intake");
		return false;
	}
}

async function getStudentEmails(){
	let getStudentEmailsSQL = `
		SELECT email
		FROM users
		JOIN user_type USING (user_type_id)
        WHERE type = 'student' 
		AND
		intake_number = (SELECT MAX(intake_id) FROM intake);
	`;

	try {
		const results = await database.query(getStudentEmailsSQL);
		console.log("Successfully grabbed all students email");
		console.log(results[0]);
		return results[0];
	} catch(err) {
		console.log("Error grabbing all students emails");
	}
}

async function updateAccomodationInteriorBC(postData) {
	let updateAccomodationInteriorBCSQL = `
		update users
		set interior_bc = :accomodation
        WHERE MRAD_id = :MRADid;
	`;

	let params = {
		MRADid: postData.MRADid,
		accomodation: postData.accInteriorBC
	};

	try {
		const results = await database.query(updateAccomodationInteriorBCSQL, params);

		console.log(
			"Successfully updated accomodation for Interior BC for " + postData.MRADid
		);
		console.log(results[0][0]);
		return results[0][0];
	} catch (err) {
		console.log(
			"Error trying to updated accomodation for Interior BC for " +
				postData.MRADid
		);
		console.log(err);
		return false;
	}
}

async function updateAccomodationLowerMainland(postData) {
	let updateAccomodationLowerMainlandSQL = `
		update users
		set lower_mainland = :accomodation
        WHERE MRAD_id = :MRADid;
	`;

	let params = {
		MRADid: postData.MRADid,
		accomodation: postData.accLowerMainland
	};

	try {
		const results = await database.query(updateAccomodationLowerMainlandSQL, params);

		console.log(
			"Successfully updated accomodation for Lower Mainland for " + postData.MRADid);
		console.log(results[0][0]);
		return results[0][0];
	} catch (err) {
		console.log(
			"Error trying to updated accomodation for Lower Mainland for " + postData.MRADid);
		console.log(err);
		return false;
	}
}

async function getStudentChoices(){
	let getStudentChoicesSQL = `
	SELECT
		sc.*,
		u.MRAD_id,
		u.interior_bc,
		u.lower_mainland,
		u.intake_number
	FROM student_choices sc
	JOIN users u USING (user_id)
	WHERE intake_number = (SELECT MAX(intake_id) FROM intake);
	`

	try {
		const results = await database.query(getStudentChoicesSQL);
		console.log("Successfully retrived student choices for this intake.")
		return results[0]
	} catch (error) {
		console.log("Failed to retrived student choices for this intake.")
		return false
	}
}

async function getLineOptions(){
	let getLineOptionsSQL = `
	SELECT line_option_id,
       one.site_name AS one,
       two.site_name AS two,
       three.site_name AS three,
       intake_number_fk,
       line_options.site_zone
	FROM mradselector.line_options
	JOIN clinical_sites AS one ON (placement_one = one.clinical_sites_id)
	JOIN clinical_sites AS two ON (placement_two = two.clinical_sites_id)
	JOIN clinical_sites AS three ON (placement_three = three.clinical_sites_id)
	WHERE intake_number_fk = (SELECT MAX(intake_id) FROM intake)
	ORDER BY line_option_id ASC;
	`

	try {
		const results = await database.query(getLineOptionsSQL);
		console.log("Successfully retrived line options for this intake.")
		return results[0]
	} catch (error) {
		console.log("Failed to retrived student choices for this intake.")
		return false
	}
}

async function insertFinalAssignments(postData) {
	let insertQuery = "INSERT IGNORE INTO mradselector.final_placement " +
	"(MRAD_id, line_assigned, site_one, site_two, site_three, intake_id, user_id) VALUES ";

	const values = postData.map((data, index) => {
		const escapedOne = data.one.replace(/'/g, "''"); // Escape single quotes
		const escapedTwo = data.two.replace(/'/g, "''");
		const escapedThree = data.three.replace(/'/g, "''");
	  
		return `('${data.MRAD_id}', '${data.line_option_id}', '${escapedOne}', '${escapedTwo}', '${escapedThree}', '${data.intake_number_id}', '${data.user_id}')`;
	});

	insertQuery += values.join(', ');

	try {
		await database.query(insertQuery);
		console.log("Inserted Final Placements");
		return true;
	} catch (err) {
		console.log("Failed to Insert Final Placements");
		console.log(err)
		return false;
	}
}

async function getFinalAssignments(postData) {
	let getFinalPlacementSQL = `
	SELECT final_placement_id, line_assigned, site_one, site_two, site_three
	FROM final_placement
	WHERE MRAD_id = :MRAD_id;`

	let params = {
		MRAD_id: postData.MRAD_id
	};


	try {
		let results = await database.query(getFinalPlacementSQL, params);
		return results[0];
	} catch (error) {
		console.log(error);
		return false;
	}

}

async function updateFinalAssignment(postData){
	let updateFinalPlacementSQL = `
		UPDATE final_placement
		SET line_assigned = :line_assigned, site_one = :site_one, site_two = :site_two, site_three = :site_three
		WHERE final_placement_id = :final_placement_id;
	`;	

	let params = {
		line_assigned: postData.line_assigned,
		site_one: postData.site_one,
		site_two: postData.site_two,
		site_three: postData.site_three,
		final_placement_id: postData.final_placement_id
	}

	try {
		const results = await database.query(updateFinalPlacementSQL, params);
		console.log("Successfully updated final placement");
		console.log(results);
		return true;
	} catch (err) {
		console.log("Error trying to update final placement");
		console.log(err);
		return false;
	}
}

async function resetStudentPassword(postData){
	let resetStudentPasswordSQL = `
		UPDATE users
		SET password = :password
		WHERE MRAD_id = :mrad_id
	`;	

	let params = {
		password: postData.password,
		mrad_id: postData.mrad_id
	}

	try {
		const results = await database.query(resetStudentPasswordSQL, params);
		console.log("Successfully updated final placement");
		console.log(results);
		return true;
	} catch (err) {
		console.log("Error trying to update final placement");
		console.log(err);
		return false;
	}
}

async function deleteStudentAccount(postData) {
	let params = {
		mrad_id: postData.mrad_id,
	};

	try {
	// Start transaction
	await database.query('START TRANSACTION');

	// Delete from final_placement
	await database.query('DELETE FROM final_placement WHERE user_id = (SELECT user_id FROM users WHERE MRAD_id = :mrad_id)', params);

	// Delete from student_choices
	await database.query('DELETE FROM student_choices WHERE user_id = (SELECT user_id FROM users WHERE MRAD_id = :mrad_id)', params);

	// Delete from users using INNER JOIN
	await database.query(`
		DELETE users
		FROM users
		INNER JOIN (
		SELECT user_id
		FROM users
		WHERE MRAD_id = :mrad_id
		) AS subquery ON users.user_id = subquery.user_id
	`, params);

	// Commit transaction
	await database.query('COMMIT');

	console.log('Successfully deleted account');
	return true;
	} catch (error) {
	// Rollback transaction on error
	await database.query('ROLLBACK');
	console.log('Could not delete user');
	console.log(error);
	return false;
	}
}

module.exports = {
	getStudents,
	getOneStudent,
	getSelectionResults,
	insertSecurityCode,
	getSecurityCode,
	createNewIntake,
	getStudentEmails,
	updateAccomodationInteriorBC,
	updateAccomodationLowerMainland,
	getLineOptions,
	getStudentChoices,
	insertFinalAssignments,
	getFinalAssignments,
	updateFinalAssignment,
	resetStudentPassword,
	deleteStudentAccount
};
