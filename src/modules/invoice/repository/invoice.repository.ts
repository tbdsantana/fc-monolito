import Address from "../../@shared/domain/value-object/address.value-object";
import Id from "../../@shared/domain/value-object/id.value-object";
import Invoice from "../domain/invoice.entity";
import Product from "../domain/product.entity";
import InvoiceGateway from "../gateway/invoice.geteway";
import InvoiceProductModel from "./invoice-product.model";
import InvoiceModel from "./invoice.model";

export default class InvoiceRepository implements InvoiceGateway {
    async add(entity: Invoice): Promise<void> {
        try {
            await InvoiceModel.create({
                id: entity.id.id,
                name: entity.name,
                number: entity.address.number,
                street: entity.address.street,
                complement: entity.address.complement,
                city: entity.address.city,
                state: entity.address.state,
                zipCode: entity.address.zipCode,
                document: entity.document,
                items: entity.items.map((item) => ({
                    id: new Id().id,
                    name: item.name,
                    unitPrice: item.price,
                    invoiceId: entity.id.id,
                    productId: item.id.id,
                })),
                total: entity.total(),
                createdAt: entity.createdAt,
            },
                {
                    include: [{ model: InvoiceProductModel }],
                });
        } catch (error) {
            console.error(error);
        }
    }

    async find(id: string): Promise<Invoice> {

        const invoice = await InvoiceModel.findOne({
            where: { id },
            include: ["items"]
        });

        if (!invoice) {
            throw new Error(`Invoice with id ${id} not found.`);
        }

        return new Invoice({
            id: new Id(invoice.id),
            name: invoice.name,
            document: invoice.document,
            address: new Address({
              number: invoice.number,
              complement: invoice.complement,
              street: invoice.street,
              city: invoice.city,
              state: invoice.state,
              zipCode: invoice.zipCode,
            }),
            items: invoice.items.map((item) => (
                new Product({
                    id: new Id(item.productId),
                    name: item.name,
                    price: item.unitPrice,
                })
            )),
            createdAt: invoice.createdAt,
        });
    }
}