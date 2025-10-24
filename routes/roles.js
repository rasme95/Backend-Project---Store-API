var express = require("express");
var router = express.Router();
var db = require("../models");
var { successResponse, errorResponse, failResponse } = require("../middleware/responseHandlers");

var RoleService = require("../services/RoleService");
var roleService = new RoleService(db);

// GET-HANDLER FOR RETURNING LIST OF ALL ROLES IN DB
router.get('/', async function (req, res, next) {
  // #swagger.tags = ['Roles']
  // #swagger.description = "HANDLER FOR RETURNING ROLES IN DB."

    try {
        const results = await roleService.getAll();
        if (!results) { return failResponse(res, "No roles found.",); }

        return successResponse(res, "A list of all users in the database:", { roles: results });
        
    } catch (error) {
        return errorResponse(res, "An error occurred while fetching brands.");
    }
});

module.exports = router;
