const express = require('express');
const router = express.Router();
const db = require('../models');
var { successResponse, errorResponse, failResponse, } = require("../middleware/responseHandlers");

const StatusService = require("../services/StatusService");
const statusService = new StatusService(db);

// GET-HANDLER FOR RETURNING LIST OF ALL STATUSES IN DB
router.get('/', async function (req, res, next) {
    // #swagger.tags = ['Order']
    // #swagger.description = "HANDLER FOR RETURNING ALL STATUSES IN DB. This endpoint can be accessed by anyone."

    try {
        let status = await statusService.get();
        if (!status) { return failResponse(res, "No status found.",); }

        return successResponse(res, "Success! Following statuses were found:", { status: status });

    } catch (err) {
        console.error(err);
        return errorResponse(res, "Error getting status");
    }
});

module.exports = router;
