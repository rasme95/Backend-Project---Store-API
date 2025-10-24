const db = require("../models");
const crypto = require("crypto");

const UserService = require("../services/UserService");
const userService = new UserService(db);
const MembershipService = require("../services/MembershipService");
const membershipService = new MembershipService(db);
const RoleService = require("../services/RoleService");
const roleService = new RoleService(db);
const BrandService = require("../services/BrandService");
const brandService = new BrandService(db);
const CategoryService = require("../services/CategoryService");
const categoryService = new CategoryService(db);
const ProductService = require("../services/ProductService");
const productService = new ProductService(db);
const StatusService = require("../services/StatusService");
const statusService = new StatusService(db);



class PopulationService {
    constructor(db) {
        this.client = db.sequelize;
    }

    async insertAdmin() {
        try {
            const existingAdmin = await userService.getByEmail("admin@noroff.no");
            if (existingAdmin) {
                console.log("Admin already exists!");
                return;
            }

            let membership = await membershipService.getOne("Bronze");
            const membershipId = membership?.dataValues?.Id;

            let role = await roleService.getOne("Admin");
            const roleId = role?.dataValues?.Id;

            const userName = "Admin";
            const email = "admin@noroff.no";
            const firstName = "Admin";
            const lastName = "Support";
            const address = "Online";
            const phone = 911;
            const userPassword = "P@ssword2023";

            const salt = crypto.randomBytes(16);
            crypto.pbkdf2( userPassword, salt, 310000, 32, "sha256", async (err, encryptedPassword) => {
                    if (err) {
                        return console.error("Encryption error:", err);
                    }
                    await userService.create( userName, email, firstName, lastName, address, phone, encryptedPassword, salt, membershipId, roleId );
                    console.log("Admin user created!");
                }
            );
        } catch (error) {
            console.error("Error creating admin user:", error);
        }
    }

    async populateProduct() {
        try {
            const existingProducts = await productService.get();
            if (existingProducts.length > 0) {
                console.log("Products are already populated!");
                return;
            }
            const response = await fetch( "http://backend.restapi.co.za/items/products" );
            const products = await response.json();
            const productData = products.data;

            for (const product of productData) {
                const productBrand = product.brand;
                const productCategory = product.category;

                await brandService.create(productBrand);
                const brandData = await brandService.getOne(productBrand);
                const BrandId = brandData.dataValues.Id;

                await categoryService.create(productCategory);
                const categoryData = await categoryService.getOne(productCategory);
                const CategoryId = categoryData.dataValues.Id;

                await productService.create(
                    product.name,
                    product.imgurl,
                    product.description,
                    product.price,
                    product.quantity,
                    product.date_added,
                    productBrand,
                    productCategory,
                    parseInt(BrandId),
                    parseInt(CategoryId)
                );
            }
            console.log("Products table populated!");
        } catch (error) {
            console.error("Error populating products:", error);
        }
    }

    async populateRoles() {
        try {
            let RolesList = await roleService.getAll();
            if (RolesList.length === 0) {
                await roleService.create("Admin");
                await roleService.create("User");
                console.log("Roles table populated");
            } else {
                console.log("Roles are already populated!");
            }
        } catch (error) {
            console.error("Error populating roles:", error);
        }
    }

    async populateMemberships() {
        try {
            let MembershipList = await membershipService.get();
            if (MembershipList.length === 0) {
                await membershipService.create("Bronze");
                await membershipService.create("Silver");
                await membershipService.create("Gold");
                console.log("Membership table populated!");
            } else {
                console.log("Memberships are already populated!");
            }
        } catch (error) {
            console.error("Error populating memberships:", error);
        }
    }

    async populateStatus() {
        try {
            let statusList = await statusService.get();
            if (statusList.length === 0) {
                await statusService.create("In Progress");
                await statusService.create("Ordered");
                await statusService.create("Completed");
                console.log("Status table populated!");
            } else {
                console.log("Status are already populated!");
            }
        } catch (error) {
            console.error("Error populating status:", error);
        }
    }

    async populateData() {
        try {
            await this.populateProduct();
            await this.populateRoles();
            await this.populateMemberships();
            await this.populateStatus();
            await this.insertAdmin();
        } catch (error) {
            console.error("Error populating data:", error);
        }
    }

    async get() {
        return await productService.get()
    }
}

module.exports = PopulationService;
