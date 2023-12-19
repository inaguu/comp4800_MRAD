const database = include('database_connection');


async function insertClinicalSites(postData) {
	let insertClinicalSites = `
		INSERT INTO clinical_sites (site_name, total_spots, is_active, site_zone)
        VALUES (:site_name, :total_spots, 1, :site_zone);
	`;

	let params = {
		site_name: postData.siteName,
        total_spots: postData.totalSpots,
        site_zone: postData.siteZone
	}

	try {
		const results = await database.query(insertClinicalSites, params);
		console.log("Successfully inserted clinical site");
		console.log(results[0]);
		return true;
	} catch (err) {
		console.log("Error trying to add clinical site");
		console.log(err);
		return false;
	}
}

async function updateClinicalSites(postData){
	let updateClinicalSites = `
		UPDATE clinical_sites
		SET site_name = :site_name, total_spots = :total_spots, is_active = :is_active
		WHERE clinical_sites_id = :clinical_id;
	`;

	let params = {
		site_name: postData.siteName,
		total_spots: postData.siteSpots,
		is_active: postData.isActive,
		clinical_id: postData.clinical_id
	}

	try {
		const results = await database.query(updateClinicalSites, params);
		console.log("Successfully updated clinical site");
		console.log(results[0]);
		return true;
	} catch (err) {
		console.log("Error trying to update clinical site");
		console.log(err);
		return false;
	}
}

async function getClinicalSites() {
	let getClinicalSites = `
		SELECT * FROM clinical_sites;
	`;

	try {
		const results = await database.query(getClinicalSites);
		console.log("Successfully retreived clinical site");
		// console.log(results[0]);
		return results;
	} catch (err) {
		console.log("Error trying to retreive clinical site");
		console.log(err);
		return false;
	}
}

async function getActiveClinicalSites() {
	let getClinicalSites = `
		SELECT * FROM clinical_sites WHERE is_active = 1;
	`;

	try {
		const results = await database.query(getClinicalSites);
		console.log("Successfully retreived clinical site");
		return results[0];
	} catch (err) {
		console.log("Error trying to retreive clinical site");
		console.log(err);
		return false;
	}
}

async function getMaxIntake() {
	let getMaxIntake = `
		SELECT Max(intake_id) AS intake_max FROM intake;
	`;

	try {
		const results = await database.query(getMaxIntake);
		console.log("Successfully retreived max intake");
		return results[0][0];
	} catch (err) {
		console.log("Error trying to retreive max intake ");
		console.log(err);
		return false;
	}
}

async function insertOptionRows(rows) {
	let insertClinicalSites = `
		INSERT INTO line_options
		(placement_one, placement_two, placement_three, intake_number_fk, site_zone) 
		VALUES 
		?;
	`;

	try {
		const results = await database.query(insertClinicalSites, [rows]);
		console.log("Successfully inserted option rows");
		console.log(results[0]);
		return true;
	} catch (err) {
		console.log("Error trying to add option rows");
		console.log(err);
		return false;
	}
}

async function getOptionRows(userData) {
	let getClinicalSites = `
		SELECT one.site_name as one, two.site_name as two, three.site_name as three, IF(choiceCounter.Count, choiceCounter.Count, 0) as Count, line_option_id
		FROM mradselector.line_options
		JOIN clinical_sites as one ON (placement_one = one.clinical_sites_id)
		JOIN clinical_sites as two ON (placement_two = two.clinical_sites_id)
		JOIN clinical_sites as three ON (placement_three = three.clinical_sites_id)
		LEFT JOIN (SELECT COUNT(choices.choice) as Count, choices.choice as choice
				FROM
				(SELECT choice_1 AS choice, user_id
				FROM student_choices 
				UNION ALL
				SELECT choice_2, user_id
				FROM student_choices
				UNION ALL
				SELECT choice_3, user_id
				FROM student_choices
				UNION ALL
				SELECT choice_4, user_id
				FROM student_choices
				UNION ALL
				SELECT choice_5, user_id
				FROM student_choices
				) as choices
				JOIN users USING (user_id)
				GROUP BY (choices.choice)
				ORDER BY choice ASC) as choiceCounter ON (choiceCounter.choice = line_option_id)
		WHERE intake_number_fk = (SELECT intake_number FROM users WHERE user_id = :user_id)
		ORDER BY one.site_name ASC;
	`;

	try {
		const results = await database.query(getClinicalSites, {user_id: userData});
		console.log("Successfully retreived option rows");
		return results[0];
	} catch (err) {
		console.log("Error trying to retreive option rows");
		console.log(err);
		return false;
	}
}


async function saveSelection(postData) {
	let saveSelectionSQL = `
		UPDATE student_choices
		SET choice_1 = :selection1, choice_2 = :selection2, choice_3 = :selection3, choice_4 = :selection4, choice_5 = :selection5
		WHERE user_id = :user_id;
	`;

	let params = {

		selection1 : postData.selection1,
		selection2 : postData.selection2,
		selection3 : postData.selection3,
		selection4 : postData.selection4,
		selection5 : postData.selection5,
		user_id : postData.user_id
	}

	try {
		const results = await database.query(saveSelectionSQL, params);
		console.log("Succesfully added selection to user")
		console.log(results[0])
		return true
	} catch (error) {
		console.log("Error adding selection to user")
		console.log(error)
		return false
	}
}

async function setSelectionFirstTime(postData){
	let choiceOnCreation = `
		INSERT INTO student_choices (choice_1, choice_2, choice_3, choice_4, choice_5, user_id)
		VALUES (1, 2, 3, 4, 5, :user_id);
	`;

	let params = {
		user_id : postData.user_id
	}

	try {
		const results = await database.query(choiceOnCreation, params);
		console.log("Successfully added selection choices on acccount creation")
		console.log(results[0])
	} catch(error) {
		console.log("Failed to add selection choices on acccount creation")
		console.log(results[0])
	}
}

async function getStudentChoice(postData) {
	let getStudentChoiceSQL = `
		SELECT * FROM student_choices
		WHERE user_id = :user_id;
	`;

	let params = {
		user_id : postData.user_id
	}

	try {
		const results = await database.query(getStudentChoiceSQL, params);
		console.log("Successfully retreived student choice");
		console.log(results[0]);
		return results;
	} catch (err) {
		console.log("Error trying to retreive student choice");
		console.log(err);
		return false;
	}
}

module.exports = {
	insertClinicalSites,
    getClinicalSites,
	saveSelection,
	getStudentChoice,
	getActiveClinicalSites,
	getMaxIntake,
	insertOptionRows,
	getOptionRows,
	setSelectionFirstTime,
	updateClinicalSites
};