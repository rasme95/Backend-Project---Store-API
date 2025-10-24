module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define(
        "User",
        {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userName: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            email: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            firstName: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            lastName: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            address: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            phone: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            encryptedPassword: {
                type: Sequelize.DataTypes.BLOB,
                allowNull: false,
            },
            salt: {
                type: Sequelize.DataTypes.BLOB,
                allowNull: false,
            },
            purchases: {
                type: Sequelize.DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            loggedIn: {
                type: Sequelize.DataTypes.INTEGER,
                defaultValue: 0,
            },
        },
        {
            timestamps: true,
        }
    );
    User.associate = function (models) {
        User.belongsTo(models.Membership, { foreignKey: { allowNull: false } });
        User.belongsTo(models.Role, { foreignKey: { allowNull: false } });
    };
    return User;
};
