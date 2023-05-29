import InvoiceFacade from "../facade/invoice.facade";
import InvoiceRepository from "../repository/invoice.repository";
import FindInvoiceUseCase from "../usercase/find-invoice/find-invoice.usecase";
import GenerateInvoiceUseCase from "../usercase/generate-invoice/generate-invoice.usecase";

export default class InvoiceFacadeFactory {
    static create() {
      const invoiceRepository = new InvoiceRepository();
      const generateInvoiceUseCase = new GenerateInvoiceUseCase(invoiceRepository);
      const findInvoiceUseCase = new FindInvoiceUseCase(invoiceRepository);
      return new InvoiceFacade({
        generateUseCase: generateInvoiceUseCase,
        findUseCase: findInvoiceUseCase,
      });
    }
  }
  