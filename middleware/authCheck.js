const db = require('../models');
const jwt = require("jsonwebtoken");
var { failResponse } = require("../middleware/responseHandlers");

const UserService = require("../services/UserService");
const userService = new UserService(db);


function hasToken(req, res, next) {
    let token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        token = req.cookies.jwt;
    }
    if (!token) { return failResponse(res, "You are not logged in. Please login or register to continue.",); }
    
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = { id: decodedToken.id, username: decodedToken.username };
        next();
    } catch (err) {
        return failResponse(res, "Your session has been timed out. Please login again to continue.",);
    }
}

async function isAdmin(req, res, next) {
    const userId = req.user.id;
    const userData = await userService.getOneWithId(userId)

    if (userData.RoleId === 1) {
        next();
    } else {
        failResponse(res, "Admin-only endpoint.",);
    }
}

module.exports = { hasToken, isAdmin };
