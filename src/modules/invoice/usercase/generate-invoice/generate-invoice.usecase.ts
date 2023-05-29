import Address from "../../../@shared/domain/value-object/address.value-object";
import Id from "../../../@shared/domain/value-object/id.value-object";
import UseCaseInterface from "../../../@shared/usecase/use-case.interface";
import Invoice from "../../domain/invoice.entity";
import Product from "../../domain/product.entity";
import InvoiceGateway from "../../gateway/invoice.geteway";
import { GenerateInvoiceUseCaseInputDto, GenerateInvoiceUseCaseOutputDto } from "./generate-invoice.usecase.dto";

export default class GenerateInvoiceUseCase implements UseCaseInterface {

    private _invoiceRepository: InvoiceGateway;

    constructor(invoiceRepository: InvoiceGateway) {
        this._invoiceRepository = invoiceRepository;
    }

    async execute(input: GenerateInvoiceUseCaseInputDto): Promise<GenerateInvoiceUseCaseOutputDto> {
        const addressProps = {
            number: input.number,
            street: input.street,
            complement: input.complement,
            city: input.city,
            state: input.state,
            zipCode: input.zipCode
        };
        const invoiceProps = {
            name: input.name,
            document: input.document,
            address: new Address(addressProps),
            items: input.items.map((item) => (
                new Product({
                    id: new Id(item.id),
                    name: item.name,
                    price: item.price,
                })
            )),
        };
        const invoice = new Invoice(invoiceProps);
        await this._invoiceRepository.add(invoice);
    
        return {
            id: invoice.id.id,
            name: invoice.name,
            document: invoice.document,
            number: invoice.address.number,
            street: invoice.address.street,
            complement: invoice.address.complement,
            city: invoice.address.city,
            state: invoice.address.state,
            zipCode: invoice.address.zipCode,
            items: invoice.items.map((item) => ({
                id: item.id.id,
                name: item.name,
                price: item.price
            })),
            total: invoice.total(),
        };
    }

}