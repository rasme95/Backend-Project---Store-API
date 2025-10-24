class CategoryService {
    constructor(db) {
        this.client = db.sequelize;
        this.Category = db.Category;
    }

    async create(Name) {
        const existingCategory = await this.getOne(Name);
        if (!existingCategory) {
            return this.Category.create({ Name: Name });
        }
        return existingCategory;
    }

    async getOne(category) {
        return this.Category.findOne({
            where: {
                Name: category,
            },
        }).catch((err) => {
            return err;
        });
    }

    async getOneId(Id) {
        return this.Category.findOne({
            where: {
                Id: Id,
            },
        }).catch((err) => {
            return err;
        });
    }

    async get() {
        return this.Category.findAll({
            where: {},
        }).catch((err) => {
            return err;
        });
    }

    async update(Id, name) {
        return this.Category.update(
            {
                Name: name,
            },
            { where: { Id: Id } }
        );
    }
}

module.exports = CategoryService;
