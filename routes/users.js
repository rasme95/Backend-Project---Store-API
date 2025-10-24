var express = require("express");
var router = express.Router();
var db = require("../models");
var { hasToken, isAdmin } = require("../middleware/authCheck");
var { successResponse, errorResponse, failResponse } = require("../middleware/responseHandlers");

var UserService = require("../services/UserService");
var userService = new UserService(db);

// GET-HANDLER FOR RETURNING LIST OF ALL BRANDS IN DB
router.get('/', hasToken, isAdmin, async function (req, res, next) {
    // #swagger.tags = ['Users']
    // #swagger.description = "HANDLER FOR RETURNING ALL USERS IN DB. Needs to be logged in(ADMIN-role)"

    try {
        const results = await userService.get();
        if (!results) { return failResponse(res, "No users found.",); }

        return successResponse(res, "A list of all users in the database:", { users: results });

    } catch (error) {
        return errorResponse(res, "An error occurred while fetching brands.");
    }
});

// GET-HANDLER FOR RETURNING A SINGLE USER BY ID
router.get('/:id', hasToken, isAdmin, async function (req, res, next) {
    // #swagger.tags = ['Users']
    // #swagger.description = "HANDLER FOR RETURNING A SINGLE USER BY ID. Needs to be logged in(ADMIN-role)"

    try {
        const id = req.params.id;
        const results = await userService.getOneWithId(id);
        if (!results) { return failResponse(res, "No users found.",); }

        return successResponse(res, "User found:", { users: results });

    } catch (error) {
        return errorResponse(res, "An error occurred while fetching brands.");
    }
});

// PUT-HANDLER FOR CHANGING A SINGLE USER BY ID
router.put('/:id', hasToken, isAdmin, async function (req, res, next) {
    // #swagger.tags = ['Users']
    // #swagger.description = "HANDLER FOR CHANGING A USER BY ID. Needs to be logged in(ADMIN-role)"
    /* #swagger.parameters['body'] =  {
        "name": "body",
        "in": "body",
            "schema": {
                $ref: "#/definitions/UsersPut"
            }
            }
        */
    
    try {
        const id = req.params.id;
        const { firstName, lastName, address, phone, role } = req.body;
        const existingUser = await userService.getOneWithId(id);

        if (!existingUser) { return res.status(404).json({ message: "No users found." }); }

        await userService.update(id, firstName, lastName, address, phone, role);

        const results = await userService.getOneWithId(id);
        return successResponse(res, "User updated!", { users: results });
        
    } catch (error) {
        return errorResponse(res, "An error occurred while fetching brands.");
    }
});




module.exports = router;
