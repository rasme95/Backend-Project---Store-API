var express = require("express");
var router = express.Router();
var db = require("../models");
var { hasToken, isAdmin } = require("../middleware/authCheck");
var { successResponse, errorResponse, failResponse, } = require("../middleware/responseHandlers");

var ProductService = require("../services/ProductService");
var productService = new ProductService(db);
var BrandService = require("../services/BrandService");
var brandService = new BrandService(db);
var CategoryService = require("../services/CategoryService");
var categoryService = new CategoryService(db);

// GET-HANDLER FOR RETURNING ALL PRODUCTS IN DB
router.get("/", async function (req, res, next) {
  // #swagger.tags = ['Product']
  // #swagger.description = "HANDLER FOR RETURNING LIST OF ALL PRODUCTS IN DB. This endpoint can be accessed by anyone."

  try {
    const results = await productService.get();
    if (!results) { return failResponse(res, "No products found.", 404); }

    return res.status(200).json({
      status: "success",
      statuscode: 200,
      data: {
        result: "A list of all products in the database:",
        products: results,
      },
    });

  } catch (error) {
    return errorResponse(res, "Error retrieving products");
  }
});

// GET-HANDLER FOR RETURNING A SINGLE PRODUCT BY ID
router.get("/:id", async function (req, res, next) {
  // #swagger.tags = ['Product']
  // #swagger.description = "HANDLER FOR RETURNING A PRODUCT BY ID. This endpoint can be accessed by anyone."

  try {
    const productId = req.params.id;
    const results = await productService.getOne(productId);

    if (!results) { return failResponse(res, "No product found with this ID.", 404); }

    results.Price = parseFloat(results.Price);
    
    return successResponse(res, "Product found:", { products: results, });

  } catch (error) {
    return errorResponse(res, "Error retrieving product");
  }
});

// POST-HANDLER FOR CREATING A PRODUCT
router.post("/", hasToken, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Product']
  // #swagger.description = "HANDLER FOR CREATING A PRODUCT IN DB. Needs to be logged in(ADMIN-role)"
  /* #swagger.parameters['body'] =  {
        "name": "body",
        "in": "body",
            "schema": {
                $ref: "#/definitions/ProductPost"
            }
            }
        */

  try {
    const { name, imgurl, description, price, stock, brand, category } = req.body;
    
    if (!name || !imgurl || !description || !price || !stock || !brand || !category) {
      return errorResponse(res, 'Field is missing')
    }

    let brandData;
    let brandName;
    let brandId;
    if (typeof brand === "string") {
      brandData = await brandService.getOne(brand);
    } else if (Number.isInteger(brand)) {
      brandData = await brandService.getOneId(brand);
    }
    if (!brandData) {
      const newBrand = await brandService.create(brand);
      brandName = newBrand.dataValues.Name;
      brandId = newBrand.dataValues.Id;
    } else {
      brandName = brandData.dataValues.Name;
      brandId = brandData.dataValues.Id;
    }
    if (!brandId) {
      const newBrand = await brandService.create(brand);
      brandId = newBrand.dataValues.Id;
    }

    let categoryData;
    let categoryName;
    let categoryId;
    if (typeof category === "string") {
      categoryData = await categoryService.getOne(category);
    } else if (Number.isInteger(category)) {
      categoryData = await categoryService.getOneId(category);
    }
    if (!categoryData) {
      await categoryService.create(category);
      categoryData = await categoryService.getOne(category);

      console.log('TEST', categoryData);
      categoryName = categoryData.dataValues.Name;
      categoryId = categoryData.dataValues.Id;
    } else {
      categoryName = categoryData.dataValues.Name;
      categoryId = categoryData.dataValues.Id;
    }
    if (!categoryId) {
      const categoryData = await categoryService.create(category);
      categoryId = categoryData.dataValues.Id;
    }

    const isActive = 1;
    const roundedPrice = Math.round(price * 100) / 100;
    const newProduct = await productService.create(name, imgurl, description, roundedPrice, stock, isActive, brandName, categoryName, brandId, categoryId);

    const response = {
      id: newProduct.Id,
      name: newProduct.Name,
      imgurl: newProduct.ImageURL,
      description: newProduct.Description,
      roundedPrice: Math.round(newProduct.Price),
      stock: newProduct.Quantity,
      isDeleted: newProduct.isDeleted,
      brand: newProduct.brand,
      category: newProduct.category,
      brandId: newProduct.BrandId,
      categoryId: newProduct.CategoryId,
    };

    return successResponse(res, "A new product has been added to the database!", { newProduct: response });
    
  } catch (error) {
    return errorResponse(res, "Error adding product");
  }
});

// PUT-HANDLER FOR CHANGING A PRODUCT BY ID
router.put("/:id", hasToken, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Product']
  // #swagger.description = "HANDLER FOR CHANGING A PRODUCTS DETAILS IN DB. Needs to be logged in(ADMIN-role)"
  /* #swagger.parameters['body'] =  {
        "name": "body",
        "in": "body",
            "schema": {
                $ref: "#/definitions/ProductPut"
            }
            }
        */

  try {
    const id = req.params.id;
    const { name, imgurl, description, price, stock, brand, category } = req.body;

    const exists = await productService.getOne(id);
    if (!exists) { return failResponse(res, "This product ID doesn't exist!", 400); }

    let brandId;
    let brandName = await brandService.getOne(brand);
  
    if (!brandName) {
      const newBrand = await brandService.create(brand);
      brandId = newBrand.dataValues.Id;
    } else {
      brandId = brandName.dataValues.Id;
    }

    let categoryId;
    let categoryName = await categoryService.getOne(category);

    if (!categoryName) {
      const newCategory = await categoryService.create(category);
      categoryId = newCategory.dataValues.Id;
    } else {
      categoryId = categoryName.dataValues.Id;
    }

    await productService.update(id, name, imgurl, description, price, stock, brandId, categoryId);
    const updatedProduct = await productService.getOne(categoryId)

    return successResponse(res, "A new product has been added to the database!", { newProduct: updatedProduct });

  } catch (error) {
    return errorResponse(res, "Error updating product");
  }
});

// DELETE-HANDLER FOR SOFT-DELETING A PRODUCT BY ID
router.delete("/:id", hasToken, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Product']
  // #swagger.description = "HANDLER FOR SOFT-DELETING A PRODUCT IN DB. Needs to be logged in(ADMIN-role)"

  try {
    const productId = req.params.id;

    const exists = await productService.getOne(productId);
    if (!exists) { return failResponse(res, "This product ID doesn't exist!"); }

    await productService.delete(productId);

    return successResponse(res, "The product has been soft-deleted.", { deletedProduct: productId, });

  } catch (error) {
    return errorResponse(res, "Error deleting product");
  }
});

// PUT-HANDLER FOR ACTIVATING SOFT-DELETED PRODUCT BY ID
router.put("/activate/:id", hasToken, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Product']
  // #swagger.description = "HANDLER FOR ACTIVATING A PRODUCT IN DB. Needs to be logged in(ADMIN-role)"

  try {
    const productId = req.params.id;

    const exists = await productService.getOne(productId);
    if (!exists) { return failResponse(res, "This product ID doesn't exist!"); }

    await productService.activate(productId);

    return successResponse(res, "The product has been reactivated.", { product: productId, });

  } catch (error) {
    return errorResponse(res, "Error activating product");
  }
});

module.exports = router;
