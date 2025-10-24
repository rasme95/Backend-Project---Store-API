const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);

require("dotenv").config();

const connection = {
    database: process.env.DATABASE_NAME,
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
    port: process.env.DB_PORT,
    dialect: process.env.DIALECT,
    dialectmodel: process.env.DIALECTMODEL,
};

const sequelize = new Sequelize(connection);
const db = {};
db.sequelize = sequelize;

fs.readdirSync(__dirname)
  .filter(
    (file) =>
          file.indexOf(".") !== 0 &&
          file !== basename &&
          file.endsWith(".js")
  )
  .forEach((file) => {
    const modelPath = path.join(__dirname, file);
    const model = require(modelPath)(sequelize, Sequelize);
    db[model.name] = model;
  });
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
