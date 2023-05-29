import e from "express";
import Address from "../../../@shared/domain/value-object/address.value-object";
import Invoice from "../../domain/invoice.entity";
import FindInvoiceUseCase from "./find-invoice.usecase";
import Product from "../../domain/product.entity";

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

describe("Test FindInvoiceUseCase", () => {
    it("should find an invoice", async () => {
        const MockRepository = () => {
            return {
                add: jest.fn(),
                find: jest.fn().mockReturnValue(invoice),
            };
        };
        const findInvoiceRepository = MockRepository();
        const usecase = new FindInvoiceUseCase(findInvoiceRepository);
        
        const invoiceFound = await usecase.execute({id : invoice.id.id});

        expect(invoiceFound).toBeDefined();
        expect(invoice.id.id).toBe((invoiceFound).id);
        expect(invoice.total()).toBe(invoiceFound.total);
        expect(invoice.createdAt).toBe(invoiceFound.createdAt);
    });

    it("should raise an error when invoice not found", async () => {
        const MockRepository = () => {
            return {
                add: jest.fn(),
                find: jest.fn().mockReturnValue(null),
            };
        };
        const findInvoiceRepository = MockRepository();
        const usecase = new FindInvoiceUseCase(findInvoiceRepository);
        
        expect(async () => {
            await usecase.execute({id : "unexistant"});
        }).rejects.toThrow("Invoice with id unexistant not found.");
    });
});