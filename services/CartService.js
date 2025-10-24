class CartService {
    constructor(db) {
        this.client = db.sequelize;
        this.Cart = db.Cart;
    }

    async create(UserId) {
        return this.Cart.create({
            UserId: UserId,
        });
    }

    async getOne(user) {
        return this.Cart.findOne({
            where: {
                
                UserId: user,
            },
        }).catch((err) => {
            return err;
        });
    }

    async getAll() {
        return this.Cart.findAll({
            where: {},
        }).catch((err) => {
            return err;
        });
    }

    async ordered(Id) {
        return this.Cart.destroy({
            where: { Id: Id }
        });
    }

    async delete(Id) {
        return this.Cart.destroy(
            { where: { Id: Id } }
        );
    }
}

module.exports = CartService;
