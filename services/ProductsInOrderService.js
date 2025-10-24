class ProductsInOrderService {
    constructor(db) {
        this.client = db.sequelize;
        this.ProductsInOrder = db.ProductsInOrder;
    }

    async create(productName, quantity, unitPrice, discount, newPrice, OrderId, productId) {
        return this.ProductsInOrder.create({
            ProductName: productName,
            Quantity: quantity,
            UnitPrice: unitPrice,
            Discount: discount,
            NewPrice: newPrice,
            OrderId: OrderId,
            ProductId: productId,
        });
    }

    async getOneId(OrderId) {
        return this.ProductsInOrder.findOne({
            where: {
                OrderId: OrderId,
            },
        }).catch((err) => {
            return err;
        });
    }

    async getAll(OrderId) {
        return this.ProductsInOrder.findAll({
            where: {
                OrderId: OrderId,
            },
        }).catch((err) => {
            return err;
        });
    }
}

module.exports = ProductsInOrderService;
