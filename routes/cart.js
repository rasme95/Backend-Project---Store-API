var express = require('express');
var router = express.Router();
var db = require('../models');
var { hasToken, isAdmin } = require('../middleware/authCheck');
var { successResponse, errorResponse, failResponse } = require("../middleware/responseHandlers");

var CartService = require('../services/CartService');
var cartService = new CartService(db);
var ProductsInCartService = require('../services/ProductsInCartService');
var productsInCartService = new ProductsInCartService(db);
var ProductService = require('../services/ProductService');
var productService = new ProductService(db);
var OrderService = require('../services/OrderService');
var orderService = new OrderService(db);
var ProductsInOrderService = require('../services/ProductsInOrderService');
var productsInOrderService = new ProductsInOrderService(db);
var StatusService = require('../services/StatusService');
var statusService = new StatusService(db);
var UserService = require("../services/UserService")
var userService = new UserService(db);
var MembershipService = require('../services/MembershipService');
var membershipService = new MembershipService(db);
var crypto = require('crypto');

// FUNCTION FOR CREATING A RANDOM ORDERNUMBER
async function createOrderNumber() {
    const orderNumber = crypto.randomBytes(4).toString("hex");

    await checkOrderNumber(orderNumber);
    return orderNumber;
}

//FUNCTION FOR CHECKING IF A ORDERNUMBER EXISTS
async function checkOrderNumber(orderNumber) {
    let checkedOrderNumber = await orderService.getOrderNumber(orderNumber);

    if (checkedOrderNumber !== null) {
        await createOrderNumber();
    }
    return orderNumber;
}

// GET-HANDLER FOR CHECKING IF CART EXISTS IN DB
router.get("/", hasToken, async function (req, res, next) {
    // #swagger.tags = ['Cart']
    // #swagger.description = "HANDLER FOR CHECKING IF CART EXSITS IN DB. Needs to be logged in(user-role or higher)"
    
    const userId = req.user.id;
    const cart = await cartService.getOne(userId);
    if (!cart) { return failResponse(res, "No cart active for user"); }

    return successResponse(res, "The following cart for user was found", { cart: cart });
});

// POST-HANDLER FOR ADDING ITEM TO CART
router.post("/", hasToken, async function (req, res, next) {
    // #swagger.tags = ['Cart']
    // #swagger.description = "HANDLER FOR ADDING A SINGLE PRODUCT TO CART. Needs to be logged in(user-role or higher)"
    /* #swagger.parameters['body'] =  {
        "name": "body",
        "in": "body",
            "schema": {
                $ref: "#/definitions/CartPost"
            }
            }
        */
    
    const userId = req.user.id;
    const { productId } = req.body;
    if (!productId || productId.length === 0) { return failResponse(res, "Provide a productId"); }

    const product = await productService.getOne(productId);
    if (!product) { return failResponse(res, 'No products found') }

    try {
        const availableStock = product.dataValues.Quantity;
        const productName = product.dataValues.Name;
        const unitPrice = product.dataValues.Price;

        let cart = await cartService.getOne(userId);
        if (!cart) { cart = await cartService.create(userId); }

        const cartId = cart.dataValues.Id;
        if (availableStock === null || availableStock <= 0) {
            return failResponse(res, "Product not available or out of stock");
        }

        const existingCartItem = await productsInCartService.getOne(cartId, productId);
        if (existingCartItem) {
            const currentCartQuantity = existingCartItem.dataValues.Quantity;
            const newQuantity = currentCartQuantity + 1;
            if (newQuantity > availableStock) {
                return failResponse(res, `You cannot add more of this product to the cart. Only ${availableStock - currentCartQuantity} units available.`, null);
            }

            await productsInCartService.update(existingCartItem.dataValues.Id, newQuantity);
            return successResponse(res, "Product quantity updated successfully.", {cartItems: newQuantity});

        } else {
            const cartItemResult = await productsInCartService.create(1, unitPrice, productName, cartId, productId);

            if (!cartItemResult) { return errorResponse(res, "Failed to add product to cart"); }

            return successResponse(res, "Item added to cart");
        }
    } catch (error) {
        console.error("Error:", error);
        return errorResponse(res, "Error adding the product to cart");
    }
    
});

// POST-HANDLER FOR CHECKING OUT A CART
router.post("/checkout/now", hasToken, async function (req, res, next) {
    // #swagger.tags = ['Cart']
    // #swagger.description = "HANDLER FOR CHECKING OUT THE CART. Needs to be logged in(user-role or higher)"

    let orderNumber = await createOrderNumber();
    let totalPrice = 0;
    let discount = 0;
    try {
        const userId = req.user.id;
        if (userId == null) { errorResponse(res, "Error getting the user ID"); }

        let cart = await cartService.getOne(userId);
        if (!cart) { return failResponse(res, "Cart not found", 404); }
        const cartId = cart.dataValues.Id;

        let PIC = await productsInCartService.getAll(cartId);
        if (!PIC) { return failResponse(res, "Cart does not exist", null); }

        let user = await userService.getOneWithId(userId);
        if (!user) { return failResponse(res, "Error getting the user", 404); }

        const userMemberShipID = user.dataValues.MembershipId;
        let membership = await membershipService.getOneId(userMemberShipID);
        if (!membership) { return failResponse(res, "Error getting the membership", 404); }

        if (membership.Name == "Silver") {
            discount = 0.15;
            console.log("Membership is Silver. Discount is 15%!");

        }
        if (membership.Name == "Gold") {
            discount = 0.3;
            console.log("Membership is Gold. Discount is 30%!");

        }
        if (membership.Name == "Bronze") {
            console.log("Membership is Bronze. No discount!");
        }

        let status = await statusService.getOne("In Progress");
        await orderService.create(userId, status.Id, orderNumber, membership.Id);
        let order = await orderService.getOrderNumber(orderNumber);

        for (const obj of PIC) {
            let Quantity = obj.dataValues.Quantity;
            let Price = obj.dataValues.UnitPrice;
            let ProductName = obj.dataValues.ProductName;
            let OrderId = order.Id;
            let ProductId = obj.dataValues.ProductId;
            let newPrice = Price - (Price * discount);
            discount = discount * 100
            await productsInOrderService.create(ProductName, Quantity, Price, discount, newPrice, OrderId, ProductId);
        }

        const orderId = order.dataValues.Id;
        let PIO = await productsInOrderService.getAll(orderId);

        for (const obj of PIO) {
            let product = await productService.getOne(obj.dataValues.ProductId);
            let productQuantity = product.dataValues.Quantity;

            let newQuantity = productQuantity - obj.dataValues.Quantity;
            if (newQuantity < 0) {
                return failResponse(res, "Not enough product in stock", { Product: product[0].Name });
            }
            await productService.updateQuantity(obj.ProductId, newQuantity);
        }

        let totalQuantity = user.purchases;

        for (const obj of PIO) {
            let Price = obj.NewPrice;
            let Quantity = obj.Quantity;
            totalPrice = totalPrice + Price * Quantity;
            totalQuantity = totalQuantity + Quantity;
        }
        await userService.updatePurchases(userId, totalQuantity)
        user = await userService.getOneWithId(userId);

        const userPurchases = user.dataValues.purchases

        if (userPurchases < 15) {
            let newMembership = await membershipService.getOne("Bronze")
            await userService.updateMembership(userId, newMembership.Id);
        }
        if (userPurchases > 14 && userPurchases < 31) {
            let newMembership = await membershipService.getOne("Silver")
            await userService.updateMembership(userId, newMembership.Id);
        }
        if (userPurchases > 30) {
            let newMembership = await membershipService.getOne("Gold")
            await userService.updateMembership(userId, newMembership.Id);
        }
        
        PIO = await productsInOrderService.getAll(orderId);
        await cartService.ordered(cartId);

        return successResponse(res, "Order created successfully", {
            Order: order,
            ProductsInOrder: PIO,
            TotalPrice: totalPrice,
            OrderNumber: orderNumber,
            MembershipStatus: membership.Name,
        });

    } catch (error) {
        console.error("Error:", error);
        return errorResponse(res, "Error adding the cart to order");
    }
});

// DELETE-HANDLER FOR DELETING A CART
router.delete("/:id", hasToken, isAdmin, async (req, res) => {
    // #swagger.tags = ['Cart']
    // #swagger.description = "HANDLER FOR DELETING THE CART. Needs to be logged in(ADMIN-role)"
    
    const userId = req.user.id;
    const cart = req.params.id;

    const exists = await cartService.getOne(userId);
    if (!exists) { return failResponse(res, "Cart not found"); }

    try {
        await cartService.delete(cart);

        return successResponse(res, "Cart deleted, a new cart can be created.");

    } catch (error) {
        return errorResponse(res, "Error processing checkout");
    }
});


module.exports = router;
