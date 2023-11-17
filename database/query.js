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

async function getClinicalSites(postData) {
	let getClinicalSites = `
		SELECT * FROM clinical_sites;
	`;

	let params = {
		
	}

	try {
		const results = await database.query(getClinicalSites);
		console.log("Successfully retreived clinical site");
		console.log(results[0]);
		return results;
	} catch (err) {
		console.log("Error trying to retreive clinical site");
		console.log(err);
		return false;
	}
}

module.exports = {
	insertClinicalSites,
    getClinicalSites
};