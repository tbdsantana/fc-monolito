import UseCaseInterface from "../../@shared/usecase/use-case.interface";
import InvoiceFacadeInterface, { FindInvoiceFacadeInputDto, FindInvoiceFacadeOutputDto, GenerateInvoiceFacadeInputDto, GenerateInvoiceFacadeOutputDto } from "./invoice.facade.interface";

export interface InvoiceUseCasesProps {
    generateUseCase: UseCaseInterface;
    findUseCase: UseCaseInterface;
}

export default class InvoiceFacade implements InvoiceFacadeInterface {
    private _generateUseCase: UseCaseInterface;
    private _findUseCase: UseCaseInterface;

    constructor(props: InvoiceUseCasesProps) {
        this._generateUseCase = props.generateUseCase;
        this._findUseCase = props.findUseCase;
    }

    generate(input: GenerateInvoiceFacadeInputDto): Promise<GenerateInvoiceFacadeOutputDto> {
        return this._generateUseCase.execute(input);
    }

    find(input: FindInvoiceFacadeInputDto): Promise<FindInvoiceFacadeOutputDto> {
        return this._findUseCase.execute(input);
    }
}