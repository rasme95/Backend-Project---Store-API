var express = require("express");
var router = express.Router();
var db = require("../models");
var { hasToken, isAdmin } = require("../middleware/authCheck");
var { successResponse, errorResponse, failResponse } = require("../middleware/responseHandlers");

var BrandService = require("../services/BrandService");
var brandService = new BrandService(db);

// GET-HANDLER FOR RETURNING LIST OF ALL BRANDS IN DB
router.get("/", async function (req, res, next) {
    // #swagger.tags = ['Brand']
    // #swagger.description = "HANDLER FOR RETURNING LIST OF ALL BRANDS IN DB"

    try {
        const results = await brandService.get();
        if (!results || results.length === 0) {
            return failResponse(res, "No brands found.",);
        }
        return successResponse(res, "A list of all brands in the database:", { brands: results });
    } catch (error) {
        return errorResponse(res, "An error occurred while fetching brands.");
    }
});

// GET-HANDLER FOR RETURNING A SINGLE BRAND BY ID
router.get("/:id", async function (req, res, next) {
    // #swagger.tags = ['Brand']
    // #swagger.description = "HANDLER FOR RETURNING A SINGLE BRAND BY ID"

    const brandId = req.params.id;
    try {
        const results = await brandService.getOneId(brandId);
        if (!results) { return failResponse(res, "No brand associated with provided ID.", 404); }

        return successResponse(res, "Success! Following brand was found:", { brand: results });
    } catch (error) {
        return errorResponse(res, "An error occurred while fetching the brand.");
    }
});

// POST-HANDLER FOR CREATING A NEW BRAND
router.post("/", hasToken, isAdmin, async function (req, res, next) {
    // #swagger.tags = ['Brand']
    // #swagger.description = "HANDLER FOR CREATING A BRAND. Needs to be logged in and be an admin"
    /* #swagger.parameters['body'] =  {
        "name": "body",
        "in": "body",
            "schema": {
                $ref: "#/definitions/BrandPost"
            }
            }
      */

    const { brand } = req.body;
    try {
        const brandExist = await brandService.getOne(brand);
        if (brandExist) { return failResponse(res, "This brand already exists.", 400); }

        const results = await brandService.create(brand);
        return successResponse(res, "Success! Following brand was created:", { brand: results });
        
    } catch (error) {
        return errorResponse(res, "An error occurred while creating the brand.");
    }
});

// PUT-HANDLER FOR UPDATING AN EXISTING BRAND
router.put("/:id", hasToken, isAdmin, async function (req, res, next) {
    // #swagger.tags = ['Brand']
    // #swagger.description = "HANDLER FOR CHANGING A BRANDNAME IN DB. PROVIDE BRAND-ID. Needs to be logged in and be an admin"
    /* #swagger.parameters['body'] =  {
        "name": "body",
        "in": "body",
            "schema": {
                $ref: "#/definitions/BrandPut"
            }
            }
        */

    const brandId = req.params.id;
    const { brand } = req.body;
    if (!brand || brand.length === 0) { return failResponse(res, "Provide a new brand name"); }

    try {
        const result = await brandService.getOneId(brandId);
        if (!result) { return failResponse(res, "No brand with this ID.", 404); }

        await brandService.update(brandId, brand);
        const updatedBrand = await brandService.getOneId(brandId);

        return successResponse(res, "Success! Brand updated:", { brand: updatedBrand });
    } catch (error) {
        return errorResponse(res, "An error occurred while updating the brand.");
    }
});

module.exports = router;
