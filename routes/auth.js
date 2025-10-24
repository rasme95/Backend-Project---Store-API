var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");
var { successResponse, errorResponse, failResponse } = require("../middleware/responseHandlers");
var crypto = require("crypto");
var db = require("../models");
require("dotenv").config();

var UserService = require("../services/UserService");
var userService = new UserService(db);
var MembershipService = require("../services/MembershipService");
var membershipService = new MembershipService(db);
var RoleService = require("../services/RoleService");
var roleService = new RoleService(db);

// POST-HANDLER FOR REGISTERING A NEW USER
router.post("/register", async (req, res, next) => {
    // #swagger.tags = ['Auth']
    // #swagger.description = "HANDLER FOR CREATING A USER IN DB. This endpoint can be accessed by anyone"
    /* #swagger.parameters['body'] =  {
        "name": "body",
        "in": "body",
            "schema": {
                $ref: "#/definitions/AuthRegister"
            }
            }
      */
    const { userName, userPassword, email, firstName, lastName, address, phone } = req.body;

    console.log(userName, userPassword, email, firstName, lastName, address, phone)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; //AI Helped create for email

    if (!userName) { return failResponse(res, "userName is required."); }
    if (!userPassword) { return failResponse(res, "userPassword is required."); }
    if (!emailRegex.test(email)) { return failResponse(res, "Invalid email format."); } //AI Helped create for email
    if (!firstName) { return failResponse(res, "firstName is required."); }
    if (!lastName) { return failResponse(res, "lastName is required."); }
    if (!address) { return failResponse(res, "address is required."); }
    if (!parseInt(phone)) { return failResponse(res, "phone is required."); }


    const existingEmail = await userService.getByEmail(email);
    if (existingEmail) { return errorResponse(res, "Email already exists.", 500); }

    const existingUsername = await userService.getByUsername(userName);
    if (existingUsername) { return errorResponse(res, "Username already exists.", 500); }

    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(userPassword, salt, 310000, 32, "sha256", async (err, encryptedPassword) => {
        if (err) return errorResponse(res, "Error generating password", 500);
        try {
            const membership = await membershipService.getOne("Bronze");
            const membershipId = membership.dataValues.Id;

            const role = await roleService.getOne("User");
            const roleId = role.dataValues.Id;

            await userService.create(userName, email, firstName, lastName, address, phone, encryptedPassword, salt, membershipId, roleId);
            return successResponse(res, "You created an account.",);
        } catch (err) {
            return errorResponse(res, "Error creating account", 500);
        }
    });
});

// POST-HANDLER FOR LOGGING IN A USER
router.post("/login", async (req, res, next) => {
    // #swagger.tags = ['Auth']
    // #swagger.description = "HANDLER FOR LOGGING INTO TO APPLICATION IN DB, AND SIGN A COOKIE FOR THAT SESSION - 2 HOURS. This endpoint can be accessed by anyone"
    /* #swagger.parameters['body'] =  {
        "name": "body",
        "in": "body",
            "schema": {
                $ref: "#/definitions/AuthLogin"
            }
        }
      */
    const { login, password } = req.body;

    if (!login) { return failResponse(res, "userName is required."); }
    if (!password) { return failResponse(res, "Password is required."); }

    try {
        let data = await userService.getByLogin(login);
        if (!data) {
            return failResponse(res, "User/password does not exist.");
        }

        crypto.pbkdf2( password, data.salt, 310000, 32, "sha256", async function (err, hashedPassword) {
                if (err) return errorResponse(res, "Error! Something went wrong.", 500);

                if (!crypto.timingSafeEqual(data.encryptedPassword, hashedPassword)) {
                    return failResponse(res, "User/password does not exist.");
                }

                let token;
                token = jwt.sign(
                    { id: data.id, userName: data.userName, role: data.RoleId },
                    process.env.TOKEN_SECRET,
                    { expiresIn: "2h" }
                );
                res.cookie("jwt", token, {
                    httpOnly: true,
                    maxAge: 2 * 60 * 60 * 1000,
                });
                await userService.updateLoggedInState(1, data.id);

                return successResponse(res, "You are logged in!", {
                    id: data.id,
                    email: data.email,
                    name: data.userName,
                    BearerToken: token,
                });
            }
        );
    } catch (err) {
        console.error(err);
        return errorResponse(res, "Error! Something went wrong.", 500);
    }
});

// POST-HANDLER FOR LOGGING OUT USER
router.post("/logout", async function (req, res, next) {
    // #swagger.tags = ['Auth']
    // #swagger.description = "HANDLER FOR LOGGING OUT OF APPLICATION IN DB, AND CLEAR COOKIE. This endpoint can be accessed by anyone"

    const token = req.cookies.jwt;
    if (!token) { return res.status(400).send({ msg: "No token provided" }); }

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const id = decoded.id;
        await userService.updateLoggedInState(0, id);

        res.clearCookie("jwt");
        return successResponse(res, "You have been logged out.");
    } catch (error) { 
        return errorResponse(res, "Error creating account", 500);
    }
});


module.exports = router;
