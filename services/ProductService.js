class ProductService {
    constructor(db) {
        this.client = db.sequelize;
        this.Product = db.Product;
    }

    async create(Name, ImageURL, Description, Price, Quantity, date_added, Brand, Category, BrandId, CategoryId,) {
        return this.Product.create({
            Name: Name,
            ImageURL: ImageURL,
            Description: Description,
            Price: Price,
            Quantity: Quantity,
            createdAt: date_added,
            brand: Brand,
            category: Category,
            BrandId: BrandId,
            CategoryId: CategoryId,
        });
    }

    async update(Id, Name, ImageURL, Description, Price, Quantity, Brand, Category) {
        return this.Product.update(
            {
                Name: Name,
                ImageURL: ImageURL,
                Description: Description,
                Price: Price,
                Quantity: Quantity,
                BrandId: Brand,
                CategoryId: Category,
            },
            { where: { Id: Id } }
        );
    }

    async updateQuantity(Id, Quantity) {
        return this.Product.update(
            { Quantity: Quantity, },
            { where: { Id: Id } }
        );
    }

    async get() {
        const query = `
        SELECT 
        products.Id AS "id",
        products.Name AS "name",
        products.Description AS "description",
        products.Price AS "unitprice",
        productsinorders.Discount AS "discount",
        products.CreatedAt AS "date_added",
        products.ImageURL AS "ImageURL",
        products.Quantity AS "quantity",
        products.isDeleted AS "isdeleted",
        products.CreatedAt AS "createdAt",
        products.BrandID AS "BrandID",
        products.CategoryID AS "CategoryID",
        brands.Name AS "brand",
        categories.Name AS "category"
        FROM products
        LEFT JOIN brands ON products.BrandID = brands.Id
        LEFT JOIN categories ON products.CategoryId = categories.Id
        LEFT JOIN productsinorders ON products.Id = productsinorders.ProductID;
        `;

        const [results] = await this.client.query(query);
        return results;
    }

    async getOne(productId) {
        return this.Product.findOne({
            where: { Id: productId, },
        }).catch((err) => {
            return err;
        });
    }

    async delete(Id) {
        return this.Product.update(
            { isDeleted: 1, },
            { where: { Id: Id } }
        );
    }

    async activate(Id) {
        return this.Product.update(
            { isDeleted: 0, },
            { where: { Id: Id } }
        );
    }

    async searchProduct(query) {
        const [results] = await this.client.query(query);
        if (results.length < 0 ) {
            console.log("No products found matching the query.");
            return [];
        }
        return results;
    }
}

module.exports = ProductService;
