var express = require("express");
var router = express.Router();
var db = require("../models");
var { successResponse, errorResponse, failResponse, } = require("../middleware/responseHandlers");

var ProductService = require("../services/ProductService");
var productService = new ProductService(db);

// POST-HANDLER FOR RETURNING A SPECIFIED RAW SQL-QUERY OF PRODUCT/BRANDS/CATEGORY
router.post("/", async (req, res) => {
    // #swagger.tags = ['Search']
    // #swagger.description = "HANDLER FOR RETURNING SPECIFIC PRODUCTS BASED ON THE SEARCH. THIS ENDPOINT HANDLES SEARCHES BRAND/CATEGORY/PRODUCT. This endpoint can be accessed by anyone."
    /* #swagger.parameters['body'] =  {
        "name": "body",
        "in": "body",
            "schema": {
                $ref: "#/definitions/SearchPost"
            }
            }
        */
    
    const { productName, categoryName, brandName } = req.body;
    let SQLquery;
    
    if (productName == "" && categoryName == "" && brandName == "") {
    } else {
        const search = [];
        if (productName) { search.push(`Name LIKE '%${productName}%'`); }

        if (categoryName) { search.push(`CategoryId = '${categoryName}'`); }

        if (brandName) { search.push(`BrandId = '${brandName}'`); }

        const WHERE = `WHERE ${search.join(" AND ")}`;
        SQLquery = `SELECT * FROM products ${WHERE}`;
    }
    
    try {
        let result = await productService.searchProduct(SQLquery);
        result = result.flat(); //ISSUE WITH DUPLICATE RESULTS - ATTEMPTED TO GOOGLE AND FOUND OTHER SQL COMMAND ASKED CHAT FOR A BETTER WAY TO HANDLE THIS
        result = result.filter( (value, index, self) => index === self.findIndex((t) => t.Id === value.Id) ); // CHATGPT FILTER
        
        if (!result.length) { return failResponse(res, "No products found.", { products: result }); }

        return successResponse(res, "Products found", { products: result });
        
    } catch (error) {
        return errorResponse(res, "Error searching for products");
    }
});

module.exports = router;
