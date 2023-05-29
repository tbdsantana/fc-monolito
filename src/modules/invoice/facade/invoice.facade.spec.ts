import { Sequelize } from "sequelize-typescript";
import { ProductModel } from "../repository/product.model";
import InvoiceProductModel from "../repository/invoice-product.model";
import InvoiceModel from "../repository/invoice.model";
import InvoiceFacadeFactory from "../factory/invoice.facade.factory";
import { v4 as uuid } from "uuid";
import Invoice from "../domain/invoice.entity";
import Address from "../../@shared/domain/value-object/address.value-object";
import FindInvoiceUseCase from "../usercase/find-invoice/find-invoice.usecase";
import InvoiceFacade from "./invoice.facade";
import Product from "../domain/product.entity";

const invoice = new Invoice({
    name: "invoice",
    document: "document",
    address: new Address({
        number: "1",
        street: "street",
        complement: "complement",
        city: "city",
        state: "state",
        zipCode: "zipCode",
    }),
    items: [
        new Product({
            name: "Product 1",
            price: 10,
        }),
    ]
});

describe("InvoiceFacade test", () => {
    let sequelize: Sequelize;

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
            sync: { force: true },
        });

        sequelize.addModels([ProductModel, InvoiceProductModel, InvoiceModel]);
        await sequelize.sync();
    });

    afterEach(async () => {
        await sequelize.close();
    });

    it("should generate an invoice using a Facade", async () => {
        // Product #1
        const productModel1 = new ProductModel({ id: uuid(), name: "Product 1", price: 15 });
        await productModel1.save();

        // Product #2
        const productModel2 = new ProductModel({ id: uuid(), name: "Product 2", price: 20 });
        await productModel2.save();

        const invoiceFacade = InvoiceFacadeFactory.create();

        const input = {
            name: "my invoice",
            document: "invoice document",
            street: "street",
            number: "1",
            complement: "complement",
            city: "city",
            state: "state",
            zipCode: "zipCode",
            items: [
                {
                    id: productModel1.id,
                    name: productModel1.name,
                    price: productModel1.price,
                },
                {
                    id: productModel2.id,
                    name: productModel2.name,
                    price: productModel2.price,
                }
            ]
        };

        const output = await invoiceFacade.generate(input);
        const expectedOutput = (await InvoiceModel.findOne({ where: { id: output.id }, include: "items" })).toJSON();

        expect(expectedOutput).toBeDefined();
        expect(expectedOutput.name).toBe(input.name);
        expect(expectedOutput.document).toBe(input.document);
        expect(expectedOutput.number).toBe(input.number);
        expect(expectedOutput.street).toBe(input.street);
        expect(expectedOutput.complement).toBe(input.complement);
        expect(expectedOutput.city).toBe(input.city);
        expect(expectedOutput.state).toBe(input.state);
        expect(expectedOutput.zipCode).toBe(input.zipCode);
        expect(expectedOutput.items.length).toBe(2);
        expect(expectedOutput.items[0].productId).toBe(productModel1.id);
        expect(expectedOutput.items[0].name).toBe(productModel1.name);
        expect(expectedOutput.items[0].invoiceId).toBe(output.id);
        expect(expectedOutput.items[1].productId).toBe(productModel2.id);
        expect(expectedOutput.items[1].name).toBe(productModel2.name);
        expect(expectedOutput.items[1].invoiceId).toBe(output.id);
        expect(expectedOutput.total).toBe(35);
    });

    it("should find an invoice using a facade", async () => {
        const MockRepository = () => {
            return {
                add: jest.fn(),
                find: jest.fn().mockReturnValue(invoice),
            };
        };

        const findUseCase = new FindInvoiceUseCase(MockRepository());
        const facade = new InvoiceFacade({
            generateUseCase: undefined,
            findUseCase: findUseCase,
        });

        const result = await facade.find({ id: invoice.id.id });

        expect(result).toStrictEqual({
            id: result.id,
            name: result.name,
            document: result.document,
            address: {
                street: result.address.street,
                number: result.address.number,
                complement: result.address.complement,
                city: result.address.city,
                state: result.address.state,
                zipCode: result.address.zipCode,
            },
            items: [
                {
                    id: result.items[0].id,
                    name: result.items[0].name,
                    price: result.items[0].price,
                }
            ],
            total: result.total,
            createdAt: result.createdAt,
        });
    });
});