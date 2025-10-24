class ProductsInCartService {
    constructor(db) {
        this.client = db.sequelize;
        this.ProductsInCart = db.ProductsInCart;
    }

    async create(quantity, unitPrice, productName, cartId, productId) {
        return this.ProductsInCart.create({
            Quantity: quantity,
            UnitPrice: unitPrice,
            ProductName: productName,
            CartId: cartId,
            ProductId: productId,
        });
    }

    async update(Id, newQuantity) {
        return this.ProductsInCart.update(
            {
                Quantity: newQuantity,
            },
            { where: { Id: Id } }
        );
    }

    async getOne(cartId, productId) {
        return this.ProductsInCart.findOne({
            where: {
                CartId: cartId,
                ProductId: productId,
            },
        }).catch((err) => {
            return err;
        });
    }

    async getAll(cartId) {
        return this.ProductsInCart.findAll({
            where: {
                CartId: cartId,
            },
        }).catch((err) => {
            return err;
        });
    }
}

module.exports = ProductsInCartService;
