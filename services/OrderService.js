class OrderService {
    constructor(db) {
        this.client = db.sequelize;
        this.Order = db.Order;
    }

    async create(UserId, status, orderNumber, membershipId) {
        return this.Order.create({
            UserId: UserId,
            StatusId: status,
            OrderNumber: orderNumber,
            MembershipId: membershipId,
        });
    }

    async getOne(id) {
        return this.Order.findOne({
            where: {
                Id: id,
            },
        }).catch((err) => {
            return err;
        });
    }

    async getOrderNumber(orderNumber) {
        return this.Order.findOne({
            where: {
                OrderNumber: orderNumber,
            },
        }).catch((err) => {
            return err;
        });
    }

    async getAll(userId) {
        return this.Order.findAll({
            where: {
                UserId: userId,
            },
        }).catch((err) => {
            return err;
        });
    }

    async getAllOrders() {
        return this.Order.findAll({
            where: {},
        }).catch((err) => {
            return err;
        });
    }

    async update(id, StatusId) {
        return this.Order.update(
            {
                StatusId: StatusId,
            },
            { where: { Id: id } }
        );
    }
}

module.exports = OrderService;
