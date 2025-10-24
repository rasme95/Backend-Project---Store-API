module.exports = (sequelize, Sequelize) => {
    const Product = sequelize.define(
        "Product",
        {
            Id: {
                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Name: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            ImageURL: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            Description: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            Price: {
                type: Sequelize.DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            Quantity: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            isDeleted: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isIn: {
                        args: [[1, 0]],
                        msg: "Active must be 1 or 0. 1 is active 0 is inactive",
                    },
                },
            },
            brand: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            category: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            timestamps: true,
        }
    );

    Product.associate = function (models) {
        Product.belongsTo(models.Category, { foreignKey: { allowNull: false } });
        Product.belongsTo(models.Brand, { foreignKey: { allowNull: false } });
    };

    return Product;
};
