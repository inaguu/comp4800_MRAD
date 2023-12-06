const minimumInteriorLowerSites = 4;

// Main Function.
function generateOptions(sites) {
    let outputOptions = [];
    
    // Extended All Sites
    let termOne = [];
    let termTwo = [];
    let termThree = [];
    for (let i = 0; i < sites.length; i++) {
        for (let j = 0; j < sites[i].total_spots; j++) {
        
            // For production use, termOne.push(sites[i]); --> Easier for manipulating data later on
            termOne.push(sites[i]);
            termTwo.push(sites[i]);
            termThree.push(sites[i]);
        }

    }
    // Assume their will ALWAYS be a combionation where a combination of term1/2 have a unique partner in term3
    const pairOutput = generatePair(termOne, termTwo);

    // If case of impossible combinations of the first pair, recursive call
    if(!pairOutput.success) {
        outputOptions = generateOptions(sites);
        return outputOptions;
    }
    // return pairOutput.options;

    const finalOutput = addThirdTerm(pairOutput.options, termThree);

    if(!finalOutput.success) {
        outputOptions = generateOptions(sites);
        return outputOptions;
    }

    outputOptions = finalOutput.options;

    return outputOptions;
}

// Helper to generate the first pair of sites.
function generatePair(termOne, termTwo) {
    const output = [];
    let interiorCount = 0;
    let lowerCount = 0;
    while (termOne.length > 0 && termTwo.length > 0) {
        let termOneIndex, termTwoIndex;
        do {
            termOneIndex = Math.floor(Math.random() * termOne.length);
            termTwoIndex = Math.floor(Math.random() * termTwo.length);
            if(!checkAvailable(termOne[termOneIndex], termTwo) || !checkAvailable(termTwo[termTwoIndex], termOne)) return {success: false}

            if (termOne[termOneIndex].site_zone === termTwo[termTwoIndex].site_zone) break;
        } while (interiorCount < minimumInteriorLowerSites || lowerCount < minimumInteriorLowerSites)

        
        if(termOne[termOneIndex].clinical_sites_id != termTwo[termTwoIndex].clinical_sites_id) {
            output.push([termOne[termOneIndex], termTwo[termTwoIndex]])
            if (termOne[termOneIndex].site_zone === termTwo[termTwoIndex].site_zone) {
                if (termOne[termOneIndex].site_zone === "Interior BC") {
                    interiorCount++;
                } else {
                    lowerCount++;
                }
            }
            termOne.splice(termOneIndex, 1);
            termTwo.splice(termTwoIndex, 1);
        }
    }
    return {success: true, options: output};
}

// Helper to add the third site to the pairs.
function addThirdTerm(pairOptions, termThree) {
    let outputList = []
    let seenPairs = new Set();

    let pairOptionsIndex = 0

    let interiorCount = 0;
    let lowerCount = 0;
    while (termThree.length > 0) {
        let termThreeIndex;
        while (true) {
            termThreeIndex = Math.floor(Math.random() * termThree.length);

            if (interiorCount < minimumInteriorLowerSites ) {
                for (let i = 0; i < pairOptions.length; i++) {
                    if(pairOptions[i][0].site_zone === "Interior BC" && pairOptions[i][0].site_zone === pairOptions[i][1].site_zone) {
                        pairOptionsIndex = i;
                        while(termThree[termThreeIndex].site_zone !== "Interior BC") {
                            termThreeIndex = Math.floor(Math.random() * termThree.length);
                        }
                        break;
                    }
                }
            } else if (lowerCount < minimumInteriorLowerSites) {
                for (let i = 0; i < pairOptions.length; i++) {
                    if(pairOptions[i][0].site_zone === "Lower Mainland" && pairOptions[i][0].site_zone === pairOptions[i][1].site_zone) {
                        pairOptionsIndex = i;
                        while(termThree[termThreeIndex].site_zone !== "Lower Mainland") {
                            termThreeIndex = Math.floor(Math.random() * termThree.length);
                        }
                        break;
                    }
                }
            } else {
                pairOptionsIndex = Math.floor(Math.random() * pairOptions.length);
            }

            if (!checkAvailable(termThree[termThreeIndex], pairOptions)) return {success: false};
            break;
        }
        let newPair = [...pairOptions[pairOptionsIndex], termThree[termThreeIndex]]

        if (pairOptions[pairOptionsIndex][0].clinical_sites_id !== termThree[termThreeIndex].clinical_sites_id 
            && pairOptions[pairOptionsIndex][1].clinical_sites_id !== termThree[termThreeIndex].clinical_sites_id 
            && !seenPairs.has(JSON.stringify(newPair))) {
            const zone = checkZones(newPair);
            if (zone === "Lower Mainland") {
                lowerCount++;
            } else if (zone === "Interior BC") {
                interiorCount++;
            }

            outputList.push(newPair);
            seenPairs.add(JSON.stringify(newPair));
            termThree.splice(termThreeIndex, 1);
            pairOptions.splice(pairOptionsIndex, 1);
        }
    }

    return {success: true, options: outputList};
}

// Checks the zones in each site, and assigns types accordingly.
function checkZones(siteLine) {
    let zone;
    if (siteLine[0].site_zone === siteLine[1].site_zone && siteLine[0].site_zone === siteLine[2].site_zone  && siteLine[1].site_zone === siteLine[2].site_zone ) {
        zone = siteLine[0].site_zone
        siteLine.push(zone);
    } else {
        zone = "Mixed";
        siteLine.push(zone);
    }
    return zone;
}

// Helper function to check if there can be a match found inside of the options array.
function checkAvailable(element, options) {
    for (let i = 0; i < options.length; i++) {
        if (Array.isArray(options[i])) {
            if (options[i][0].clinical_sites_id !== element.clinical_sites_id && options[i][1].clinical_sites_id !== element.clinical_sites_id) return true;
        } else {
            if (options[i].clinical_sites_id !== element.clinical_sites_id) return true;
        }
    }

    return false;
 }

module.exports = { generateOptions }
