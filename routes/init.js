var express = require("express");
var router = express.Router();
var db = require("../models");
var PopulationService = require("../services/PopulationService");
var populationService = new PopulationService(db);
var { successResponse, errorResponse, failResponse } = require("../middleware/responseHandlers");
var UserService = require("../services/UserService");
var userService = new UserService(db)

// POST-HANDLER FOR POPULATING THE DATABASE WITH TABLES, ADDING A ADMIN-USER AND PRODUCT-INFORMATION FROM NOROFF-API
router.post("/", async function (req, res, next) {
    // #swagger.tags = ['Init']
    // #swagger.description = "INITIALIZE DATA IN THE DB. REQUIRE A DATABASE CREATED. This endpoint will populate the DB."

    try {
        await db.sequelize.sync();

        const existingUsers = await userService.get();

        if (existingUsers.length > 0) { return errorResponse(res, "Database is already populated."); }

        console.log("No data found, starting population...");
        db.sequelize
            .sync({ force: true })
            .then(async () => {
                console.log("Database synced!");
                await populationService.populateData();
                console.log("Data populated successfully!");
            })
            .catch((err) => { console.error("Error syncing database:", err); });
        
        return successResponse(res, "Data populated successfully!");

    } catch (error) {
        console.error("Error:", error);
        return errorResponse(res, "Error populating the database");
    }
});

module.exports = router;
