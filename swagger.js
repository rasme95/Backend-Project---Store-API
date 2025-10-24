const swaggerAutogen = require("swagger-autogen")();
const doc = {
    swagger: "2.0",
    info: {
        version: "1.0.0",
        title: "Exam",
        description: "API providing an interface for users to signup, login, reading, creating, changing, deleting-operations for an ecommerence-website. API uses JWT authentication.",
    },
    host: "localhost:3000",
    definitions: {
        AuthRegister: {
            $userName:"user1", 
            $userPassword: "password",
            $email: "test@test.com",
            $firstName:"user", 
            $lastName:"one",
            $address:"online",
            $phone: 90906510
        },
        AuthLogin: {
            $login:"Admin", 
            $password: "P@ssword2023",
        },
        CategoryPost: {
            $category: "A new category!",
        },
        CategoryPut: {
            $category: "IPad",
        },
        BrandPost: {
            $brand: "A new brand!",
        },
        BrandPut: {
            $brand: "Google",
        },
        CartPost: {
            $productId: "2",
        },
        OrderPut: {
            $status: "2",
        },
        ProductPost: {
            $id: 15,
            $name: "Samsung",
            $imgurl: "http://www.google.com",
            $description: "One product is created!",
            $price: 300,
            $stock: 10,
            $brand: "MXQ",
            $category: "A brand new phone!"
        },
        ProductPut: {
            $name: "Samsung",
            $imgurl: "http://www.google.com",
            $description: "One product is created!",
            $price: 300,
            $stock: 10,
            $brand: "MXQ",
            $category: "A brand new phone!"
        },
        SearchPost: {
            $productName: "16",
            $categoryName: "",
            $brandName: "1",
        },
        UsersPut: {
            $email: "changed@email.com",
            $firstName: "newName",
            $lastName: "newLastName",
            
            $RoleId: 2,

        }
    },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./app.js"];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => { require("./bin/www"); });