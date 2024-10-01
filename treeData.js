const indiaData = {
    "name": "India",
    "children": Array.from({ length: 5 }, (_, stateIndex) => ({
        "name": `State ${stateIndex + 1}`,
        "children": Array.from({ length: 5 }, (_, districtIndex) => ({
            "name": `District ${districtIndex + 1}`,
            "children": Array.from({ length: 5 }, (_, mandalIndex) => ({
                "name": `Mandal ${mandalIndex + 1}`,
                "children": Array.from({ length: 5 }, (_, villageIndex) => ({
                    "name": `Village ${villageIndex + 1}`
                }))
            }))
        }))
    }))
};
