const database = include("database_connection");

async function getStudentSelectionC1(postData) {
	let getStudentSelectionC1SQL = `
        select t.choice_1 as line_number, t2.site_name as site_name_one, t3.site_name as site_name_two, t4.site_name as site_name_three
        from student_choices t
        join line_options t1 on t.choice_1 = t1.line_option_id 
        join clinical_sites t2 on t1.placement_one = t2.clinical_sites_id
        join clinical_sites t3 on t1.placement_two = t3.clinical_sites_id
        join clinical_sites t4 on t1.placement_three = t4.clinical_sites_id
        where t.user_id = :user_id
	`;

	let params = {
		user_id: postData.user_id,
	};

	try {
		const results = await database.query(getStudentSelectionC1SQL, params);
		console.log("Successfully retreived student choice 1");
		return results[0];
	} catch (err) {
		console.log("Error trying to retreive student choice 1");
		console.log(err);
		return false;
	}
}

async function getStudentSelectionC2(postData) {
	let getStudentSelectionC2SQL = `
        select t.choice_2 as line_number, t2.site_name as site_name_one, t3.site_name as site_name_two, t4.site_name as site_name_three
        from student_choices t
        join line_options t1 on t.choice_2 = t1.line_option_id 
        join clinical_sites t2 on t1.placement_one = t2.clinical_sites_id
        join clinical_sites t3 on t1.placement_two = t3.clinical_sites_id
        join clinical_sites t4 on t1.placement_three = t4.clinical_sites_id
        where t.user_id = :user_id
	`;

	let params = {
		user_id: postData.user_id,
	};

	try {
		const results = await database.query(getStudentSelectionC2SQL, params);
		console.log("Successfully retreived student choice 2");
		return results[0];
	} catch (err) {
		console.log("Error trying to retreive student choice 2");
		console.log(err);
		return false;
	}
}

async function getStudentSelectionC3(postData) {
	let getStudentSelectionC3SQL = `
        select t.choice_3 as line_number, t2.site_name as site_name_one, t3.site_name as site_name_two, t4.site_name as site_name_three
        from student_choices t
        join line_options t1 on t.choice_3 = t1.line_option_id 
        join clinical_sites t2 on t1.placement_one = t2.clinical_sites_id
        join clinical_sites t3 on t1.placement_two = t3.clinical_sites_id
        join clinical_sites t4 on t1.placement_three = t4.clinical_sites_id
        where t.user_id = :user_id
	`;

	let params = {
		user_id: postData.user_id,
	};

	try {
		const results = await database.query(getStudentSelectionC3SQL, params);
		console.log("Successfully retreived student choice 3");
		return results[0];
	} catch (err) {
		console.log("Error trying to retreive student choice 3");
		console.log(err);
		return false;
	}
}

async function getStudentSelectionC4(postData) {
	let getStudentSelectionC4SQL = `
        select t.choice_4 as line_number, t2.site_name as site_name_one, t3.site_name as site_name_two, t4.site_name as site_name_three
        from student_choices t
        join line_options t1 on t.choice_4 = t1.line_option_id 
        join clinical_sites t2 on t1.placement_one = t2.clinical_sites_id
        join clinical_sites t3 on t1.placement_two = t3.clinical_sites_id
        join clinical_sites t4 on t1.placement_three = t4.clinical_sites_id
        where t.user_id = :user_id
	`;

	let params = {
		user_id: postData.user_id,
	};

	try {
		const results = await database.query(getStudentSelectionC4SQL, params);
		console.log("Successfully retreived student choice 4");
		return results[0];
	} catch (err) {
		console.log("Error trying to retreive student choice 4");
		console.log(err);
		return false;
	}
}

async function getStudentSelectionC5(postData) {
	let getStudentSelectionC5SQL = `
        select t.choice_5 as line_number, t2.site_name as site_name_one, t3.site_name as site_name_two, t4.site_name as site_name_three
        from student_choices t
        join line_options t1 on t.choice_5 = t1.line_option_id 
        join clinical_sites t2 on t1.placement_one = t2.clinical_sites_id
        join clinical_sites t3 on t1.placement_two = t3.clinical_sites_id
        join clinical_sites t4 on t1.placement_three = t4.clinical_sites_id
        where t.user_id = :user_id
	`;

	let params = {
		user_id: postData.user_id,
	};

	try {
		const results = await database.query(getStudentSelectionC5SQL, params);
		console.log("Successfully retreived student choice 5");
		return results[0];
	} catch (err) {
		console.log("Error trying to retreive student choice 5");
		console.log(err);
		return false;
	}
}

module.exports = {
	getStudentSelectionC1,
	getStudentSelectionC2,
	getStudentSelectionC3,
	getStudentSelectionC4,
	getStudentSelectionC5,
};
