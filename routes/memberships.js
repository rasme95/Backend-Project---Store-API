var { successResponse, errorResponse, } = require("../middleware/responseHandlers");
var express = require("express");
var router = express.Router();
var db = require("../models");
var MembershipService = require("../services/MembershipService");
var membershipService = new MembershipService(db);

// GET-HANDLER FOR RETURNING LIST OF ALL MEMBERSHIPS IN DB
router.get("/", async function (req, res, next) {
  // #swagger.tags = ['Memberships']
  // #swagger.description = "HANDLER FOR RETURNING ALL MEMBERSHIPS IN DB. This endpoint can be accessed by anyone"

  try {
    const results = await membershipService.get();

    return successResponse(res, "Success! Following memberships were found:", { memberships: results, });

  } catch (error) {
    return errorResponse(res, "Error fetching memberships");
  }
});

module.exports = router;
