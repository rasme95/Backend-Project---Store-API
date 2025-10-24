module.exports = (sequelize, Sequelize) => {
    const Category = sequelize.define(
        'Category',
        {
        Id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
        }
    }, {
        timestamps: true
    });

    Category.associate = function (models) {
        Category.hasMany(models.Product, { foreignKey: { allowNull: false } });
    };

    return Category;
}