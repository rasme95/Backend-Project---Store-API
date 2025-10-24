module.exports = (sequelize, Sequelize) => {
    const Brand = sequelize.define(
        "Brand",
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
        },
        {
            timestamps: true,
        }
    );

    Brand.associate = function (models) {
        Brand.hasMany(models.Product, { foreignKey: { allowNull: false } });
    };

    return Brand;
};
