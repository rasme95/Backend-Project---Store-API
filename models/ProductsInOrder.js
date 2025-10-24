module.exports = (sequelize, Sequelize) => {
    const ProductsInOrder = sequelize.define(
        "ProductsInOrder",
        {
            Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            ProductName: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            Quantity: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            UnitPrice: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            
            Discount: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            NewPrice: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            timestamps: true,
        }
    );

    return ProductsInOrder;
};
