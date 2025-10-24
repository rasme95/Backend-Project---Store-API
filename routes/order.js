var express = require("express");
var router = express.Router();
var db = require("../models");
var { hasToken, isAdmin } = require("../middleware/authCheck");
var { successResponse, errorResponse, failResponse, } = require("../middleware/responseHandlers");

var OrderService = require("../services/OrderService");
var orderService = new OrderService(db);
var StatusService = require("../services/StatusService");
var statusService = new StatusService(db);
var ProductsInOrderService = require("../services/ProductsInOrderService");
var productsInOrderService = new ProductsInOrderService(db);

// GET-HANDLER FOR RETURNING ORDERS FOR CURRENTLY LOGGED IN USER
router.get("/", hasToken, async function (req, res, next) {
  // #swagger.tags = ['Order']
  // #swagger.description = "HANDLER FOR RETURNING ORDERS FOR REQUESTED USER(CURRENT AUTHENTICATED USER BASED ON JWT). Needs to be logged in(user-role or higher)"

  const userId = req.user.id;

  try {
  const results = await orderService.getAll(userId);
  if (!results) {
    return failResponse(res, "No orders found for this user.", 404);
  }

  const orderIds = results.map((order) => order.Id);
  const orderItems = [];

  for (const orderId of orderIds) {
    const item = await productsInOrderService.getOneId(orderId);
    orderItems.push(item);
  }

    return successResponse(res, "Orders found:", { order: results, items: orderItems, });

  } catch (error) {
    return errorResponse(res, "Error fetching orders");
  }
});

// GET-HANDLER FOR RETURNING ALL ORDERS IN DB FOR ADMIN VIEW
router.get("/admin/", hasToken, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Order']
  // #swagger.description = "HANDLER FOR RETURNING ORDERS FOR REQUESTED USER(CURRENTLY LOGGED IN). Needs to be logged in(user-role or higher)"

  try {
    const results = await orderService.getAllOrders();
    if (!results) {
      return failResponse(res, "No orders.", 404);
    }

    return successResponse(res, "Orders found:", { order: results, });

  } catch (error) {
    return errorResponse(res, "Error fetching orders");
  }
});

// GET-HANDLER FOR RETURNING A ORDER BRAND BY ID
router.get("/:id", hasToken, async function (req, res, next) {
  // #swagger.tags = ['Order']
  // #swagger.description = "HANDLER FOR RETURNING AN ORDER BY ID. Needs to be logged in(user-role or higher)"

  const params = req.params;
  const orderId = params.id;

  try {
    const results = await orderService.getOne(orderId);
    if (!results) {
      return failResponse(res, "No order found with this id", 404);
    }

    const orderItems = await productsInOrderService.getOneId(orderId);

    return successResponse(res, "Order found with the id:", { order: results, items: orderItems, });
    
  } catch (error) {
    return errorResponse(res, "Error fetching the order");
  }
});

// PUT-HANDLER FOR CHANGING A STATUS ON ORDER BY ORDER-ID
router.put("/:id/status/", hasToken, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Order']
  // #swagger.description = "HANDLER FOR CHANGING AN ORDERS STATUS(Example: Change from "In progress" to "Completed"). Needs to be logged in(ADMIN-role)"
  /* #swagger.parameters['body'] =  {
        "name": "body",
        "in": "body",
            "schema": {
                $ref: "#/definitions/OrderPut"
            }
            }
        */

  const { status } = req.body;
  const orderId = req.params.id;

  try {
    const order = await orderService.getOne(orderId);

    if (!order) { return failResponse(res, "No order found with this id", 404); }

    const newStatus = await statusService.getOneId(status);
    const statusId = newStatus.dataValues.Id;
    await orderService.update(orderId, statusId);
    
    return successResponse(res, "Order updated!", { currentStatus: newStatus.Name, });

  } catch (error) {
    return errorResponse(res, "Error updating order status");
  }
});



module.exports = router;
