const request = require("supertest");
const URL = "http://localhost:3000";
require("dotenv").config();

describe("TESTING", () => {
    let token;

    test("PRE-TEST || Populate DB with /init-endpoint BEFORE START", async () => {
        console.log('PRE - TEST USE POST - request to Populate DB with /init-endpoint')
    });
    test("PRE-TEST || Populate DB with /init-endpoint BEFORE START", async () => {
        console.log('PRE - TEST USE POST - request to Populate DB with /init-endpoint')
    });
    test("PRE-TEST || Populate DB with /init-endpoint BEFORE START", async () => {
        console.log('PRE - TEST USE POST - request to Populate DB with /init-endpoint')
    });


    test("Automatically logging in with a valid account. to fetch Bearer Token..", async () => {
        const credentials = { login: "Admin", password: "P@ssword2023" };
        const response = await request(URL)
            .post("/auth/login")
            .send(credentials);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("BearerToken");
        token = response.body.data.BearerToken;
    });


    test("1. Add a category with the name TEST_CATEGORY", async () => {
        const body = { category: "TEST_CATEGORY" };
        const response = await request(URL)
            .post("/category")
            .send(body)
            .set("Authorization", "Bearer " + token);

        expect(response.statusCode).toBe(200);
        expect(response.body.data.result).toBe("Success! The following category was created:");
        expect(response.body.data.category.Name).toBe("TEST_CATEGORY");
    });
    

    test("2. Add a brand with the name TEST_BRAND", async () => {
        const body = { brand: "TEST_BRAND" };
        const response = await request(URL)
            .post("/brand")
            .send(body)
            .set("Authorization", "Bearer " + token);

        expect(response.statusCode).toBe(200);
        expect(response.body.data.result).toBe("Success! Following brand was created:");
        expect(response.body.data.brand.Name).toBe("TEST_BRAND");
    });


    test("3. Add a product with the name TEST_PRODUCT, brand must be TEST_BRAND, and category must be TEST_CATEGORY, quantity 10, price 99.99", async () => {
        const productBody = {
            name: "TEST_PRODUCT",
            imgurl: "http://www.test.com",
            description: "We're testing the code!",
            price: 99.99,
            stock: 10,
            brand: "TEST_BRAND",
            category: "TEST_CATEGORY",
        };

        const response = await request(URL)
            .post("/product/")
            .send(productBody)
            .set("Authorization", "Bearer " + token);

        expect(response.body.status).toBe("success");
        expect(response.body.statuscode).toBe(200);
        expect(response.body.data.newProduct.name).toBe("TEST_PRODUCT");
        expect(response.body.data.newProduct.brand).toBe("TEST_BRAND");
        expect(response.body.data.newProduct.category).toBe('TEST_CATEGORY');
    });


    test("4. Get the newly created TEST_PRODUCT with all the information, including category and brand name.", async () => {
        const response = await request(URL)
            .get("/product/15");
        
        expect(response.statusCode).toBe(200);
        expect(response.body.data.products.Id).toBe(15);
        expect(response.body.data.products.Name).toBe("TEST_PRODUCT");
        expect(response.body.data.products.ImageURL).toBe("http://www.test.com");
        expect(response.body.data.products.Description).toBe("We're testing the code!");
        expect(response.body.data.products.Price).toBe(99.99);
        expect(response.body.data.products.Quantity).toBe(10);
        expect(response.body.data.products.brand).toBe("TEST_BRAND");
        expect(response.body.data.products.category).toBe("TEST_CATEGORY");
    });


    test("5. Change the category name TEST_CATEGORY to TEST_CATEGORY2", async () => {
        const body = { category: "TEST_CATEGORY2" };
        const response = await request(URL)
            .put("/category/7")
            .send(body)
            .set("Authorization", "Bearer " + token);

        expect(response.body.statuscode).toBe(200);
        expect(response.body.data.result).toBe("Success! Category updated:");
        expect(response.body.data.category.Name).toBe("TEST_CATEGORY2");
    });


    test("6. Change the brand name TEST_BRAND to TEST_BRAND2", async () => {
        const body = { brand: "TEST_BRAND2" };
        const response = await request(URL)
            .put("/brand/5")
            .send(body)
            .set("Authorization", "Bearer " + token);

        expect(response.body.statuscode).toBe(200);
        expect(response.body.data.result).toBe("Success! Brand updated:");
        expect(response.body.data.brand.Name).toBe("TEST_BRAND2");
    });

    test("7. Get the product TEST_PRODUCT with all the information, including the category and brand name.", async () => {
        const response = await request(URL)
            .get("/product/")
            .set("Authorization", "Bearer " + token);
    
        const productData = response.body.data.products;
        const products = productData.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            unitprice: product.unitprice,
            discount: product.discount,
            date_added: product.date_added,
            imageURL: product.ImageURL,
            quantity: product.quantity,
            isdeleted: product.isdeleted,
            createdAt: product.createdAt,
            brandID: product.BrandID,
            categoryID: product.CategoryID,
            brand: product.brand,
            category: product.category,
        }));
        const productFound = products.find((product) => product.name === "TEST_PRODUCT");
        const brand = productFound.brand;
        const category = productFound.category;

        expect(response.body.statuscode).toBe(200);
        expect(response.body.data.result).toBe("A list of all products in the database:");
        expect(brand).toBe("TEST_BRAND2");
        expect(category).toBe("TEST_CATEGORY2");
    });

    
    test("8. Delete the TEST_PRODUCT", async () => {
        const response = await request(URL)
            .delete("/product/15")
            .set("Authorization", "Bearer " + token);

        expect(response.body.statuscode).toBe(200);
        expect(response.body.data.result).toBe("The product has been soft-deleted.");
        expect(response.body.data.deletedProduct).toBe("15");
    });
});
