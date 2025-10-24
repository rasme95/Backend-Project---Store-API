const bodyParser = require("body-parser");
var createError = require("http-errors");
var express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var passport = require("passport");
var cors = require("cors");
require("dotenv").config();

var searchRouter = require("./routes/search");
var usersRouter = require("./routes/users");
var authRouter = require("./routes/auth");
var cartRouter = require("./routes/cart");
var categoryRouter = require("./routes/category");
var brandRouter = require("./routes/brand");
var membershipRouter = require("./routes/memberships");
var orderRouter = require("./routes/order");
var productRouter = require("./routes/products");
var initRouter = require("./routes/init");
var statusRouter = require("./routes/status");
var rolesRouter = require("./routes/roles");

var app = express();

app.use( cors({ origin: "http://localhost:5000", credentials: true, }) ); // Author: ChatGPT by OpenAi.com
app.options('*', cors({ origin: 'http://localhost:5000', credentials: true, })); // Author: ChatGPT by OpenAi.com

app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize());
app.use(bodyParser.json());

app.use("/search", searchRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/cart", cartRouter);
app.use("/category", categoryRouter);
app.use("/brand", brandRouter);
app.use("/membership", membershipRouter);
app.use("/order", orderRouter);
app.use("/product", productRouter);
app.use("/init", initRouter);
app.use("/status", statusRouter);
app.use("/roles", rolesRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req} on the server!`);
  err.status = 'fail';
  err.statusCode = 404

  next(err)
})

app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';
  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message
  })
});

module.exports = app;
