import GenerateInvoiceUseCase from "./generate-invoice.usecase";

const MockRepository = () => {
    return {
        add: jest.fn(),
        find: jest.fn(),
    };
};

describe("Generate invoice usecase unit test", () => {
    it("should generate an invoice", async () => {
        const invoiceRepository = MockRepository();
        const usecase = new GenerateInvoiceUseCase(invoiceRepository);

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
                    id: "prod1",
                    name: "Product 1",
                    price: 10
                },
                {
                    id: "prod2",
                    name: "Product 2",
                    price: 20
                }
            ]
        };

        const result = await usecase.execute(input);

        expect(invoiceRepository.add).toHaveBeenCalled();
        expect(result.id).toBeDefined;
        expect(result.name).toBe(input.name);
        expect(result.document).toBe(input.document);
        expect(result.street).toBe(input.street);
        expect(result.number).toBe(input.number);
        expect(result.complement).toBe(input.complement);
        expect(result.city).toBe(input.city);
        expect(result.state).toBe(input.state);
        expect(result.zipCode).toBe(input.zipCode);
        expect(result.items.length).toBe(2);
        expect(result.items[0].id).toBe(input.items[0].id);
        expect(result.items[0].name).toBe(input.items[0].name);
        expect(result.items[0].price).toBe(input.items[0].price);
        expect(result.items[1].id).toBe(input.items[1].id);
        expect(result.items[1].name).toBe(input.items[1].name);
        expect(result.items[1].price).toBe(input.items[1].price);
    });
});
