var express = require("express");
var router = express.Router();
var db = require("../models");
var { successResponse, errorResponse, failResponse, } = require("../middleware/responseHandlers");
var { hasToken, isAdmin } = require("../middleware/authCheck");

var CategoryService = require("../services/CategoryService");
var categoryService = new CategoryService(db);

// GET-HANDLER FOR RETURNING LIST OF ALL CATEGORIES IN DB
router.get("/", async function (req, res) {
    // #swagger.tags = ['Category']
    // #swagger.description = "HANDLER FOR RETURNING LIST OF ALL CATEGORIES IN DB. This endpoint can be accessed by anyone"

    try {
        const results = await categoryService.get();
        if (!results || results.length === 0) {
            return failResponse(res, "No category found.", { categories: results });
        }

        return successResponse(res, "A list of all categories in the database:", { categories: results, });

    } catch (error) {
        return errorResponse(res, "Error fetching categories.");
    }
});

// GET-HANDLER FOR RETURNING A SINGLE CATEGORY BY ID
router.get("/:id", async function (req, res) {
    // #swagger.tags = ['Category']
    // #swagger.description = "HANDLER FOR RETURNING A SINGLE CATEGORY BY ID. This endpoint can be accessed by anyone"

    const categoryId = req.params.id;
    try {
        const result = await categoryService.getOneId(categoryId);
        if (!result) { return failResponse(res, "No category associated with the provided ID."); }

        return successResponse(res, "Success! The following category was found:", { category: result, });

    } catch (error) {
        console.error("Database error:", error);
        return errorResponse(res, "Error fetching category.");
    }
});

// POST-HANDLER FOR CREATING A NEW CATEGORY
router.post("/", hasToken, isAdmin, async function (req, res) {
    // #swagger.tags = ['Category']
    // #swagger.description = "HANDLER FOR CREATING A BRAND. Needs to be logged in(ADMIN-role)"
    /* #swagger.parameters['body'] =  {
    "name": "body",
    "in": "body",
        "schema": {
            $ref: "#/definitions/CategoryPost"
        }
        }
    */
    
    const { category } = req.body;
    
    const categoryExist = await categoryService.getOne(category);
    if (categoryExist) { return failResponse(res, "This category already exists."); }

    try {
        const result = await categoryService.create(category);

        return successResponse(res, "Success! The following category was created:", { category: result });

    } catch (error) {
        return errorResponse(res, "Error creating category.");
    }
});

// PUT-HANDLER FOR UPDATING AN EXISTING CATEGORY
router.put("/:id", hasToken, isAdmin, async function (req, res) {
    // #swagger.tags = ['Category']
    // #swagger.description = "HANDLER FOR CHANGING A CATEGORYNAME IN DB. PROVIDE CATEGORY-ID. Needs to be logged in(ADMIN-role)"
    /* #swagger.parameters['body'] =  {
        "name": "body",
        "in": "body",
            "schema": {
                $ref: "#/definitions/CategoryPut"
            }
            }
        */
    
    const categoryId = req.params.id;
    const { category } = req.body;
    if (!category || category.length === 0) { return failResponse(res, "Provide a new category name"); }

    try {
        const result = await categoryService.getOneId(categoryId);
        if (!result) { return failResponse(res, "No category with this ID."); }

        await categoryService.update(categoryId, category);
        const updated = await categoryService.getOneId(categoryId);

        return successResponse(res, "Success! Category updated:", { category: updated });
        
    } catch (error) {
        return errorResponse(res, "Error updating category.");
    }
});

module.exports = router;
