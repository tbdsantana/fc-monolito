import { Sequelize } from "sequelize-typescript";
import { ProductModel } from "./product.model";
import InvoiceProductModel from "./invoice-product.model";
import InvoiceModel from "./invoice.model";
import Invoice from "../domain/invoice.entity";
import Address from "../../@shared/domain/value-object/address.value-object";
import InvoiceRepository from "./invoice.repository";
import { v4 as uuid } from "uuid";
import Product from "../domain/product.entity";
import Id from "../../@shared/domain/value-object/id.value-object";

describe("InvoiceRepository test", () => {
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

  it("should create an invoice", async () => {
    // Create products in the database to be refered by the invoice_product
    const productModel1 = new ProductModel({ id: uuid(), name: "Product 1", price: 15 });
    const productModel2 = new ProductModel({ id: uuid(), name: "Product 2", price: 20 });
    await productModel1.save();
    await productModel2.save();

    // Create an invoice with 2 products
    const invoice = new Invoice({
      name: "invoice 1",
      items: [
        new Product({id: new Id(productModel1.id), name: productModel1.name, price: productModel1.price}), 
        new Product({id: new Id(productModel2.id), name: productModel2.name, price: productModel2.price}),
      ],
      document: "invoice document",
      address: new Address({
        number: "1",
        complement: "complement",
        street: "street",
        city: "city",
        state: "state",
        zipCode: "zipCode",
      }),
    });

    const invoiceRepository = new InvoiceRepository();
    await invoiceRepository.add(invoice);
    
    console.log(await InvoiceModel.findAll({include: ["items"]}));

    const result = await InvoiceModel.findOne({ where: { id: invoice.id.id }, include: ["items"] });
    const resultJson = result.toJSON();

    expect(resultJson.id).toBe(invoice.id.id);
    expect(resultJson.name).toBe(invoice.name);
    expect(resultJson.document).toBe(invoice.document);
    expect(resultJson.street).toBe(invoice.address.street);
    expect(resultJson.total).toBe(invoice.total());
    expect(resultJson.items.length).toBe(2);
    expect(resultJson.items[0].id).toBeDefined();
    expect(resultJson.items[0].name).toBe(productModel1.name);
    expect(resultJson.items[0].unitPrice).toBe(productModel1.price);
    expect(resultJson.items[0].productId).toBe(productModel1.id);
    expect(resultJson.items[0].invoiceId).toBe(invoice.id.id);
    expect(resultJson.items[1].id).toBeDefined();
    expect(resultJson.items[1].name).toBe(productModel2.name);
    expect(resultJson.items[1].unitPrice).toBe(productModel2.price);
    expect(resultJson.items[1].productId).toBe(productModel2.id);
    expect(resultJson.items[1].invoiceId).toBe(invoice.id.id);
  });

  it("should find an invoice", async () => {
    // Create products in the database to be refered by the invoice_product
    const productModel1 = new ProductModel({ id: uuid(), name: "Product 1", price: 15 });
    const productModel2 = new ProductModel({ id: uuid(), name: "Product 2", price: 20 });
    await productModel1.save();
    await productModel2.save();

    await InvoiceModel.create({
      id: "inv1",
      name: "my invoice",
      document: "invoice document",
      number: "1",
      complement: "complement",
      street: "street",
      city: "city",
      state: "state",
      zipCode: "zipCode",
      total: 35,
      items: [
        {
          id: "inv_prod1",
          name: productModel1.name,
          unitPrice: productModel1.price,
          invoiceId: "inv1",
          productId: productModel1.id,
        },
        {
          id: "inv_prod2",
          name: productModel2.name,
          unitPrice: productModel2.price,
          invoiceId: "inv1",
          productId: productModel2.id,
        }
      ],
    },
      {
        include: [{ model: InvoiceProductModel }],
      });

    const invoiceRepository = new InvoiceRepository();
    const invoice = await invoiceRepository.find("inv1");

    expect(invoice.id.id).toBe("inv1");
    expect(invoice.name).toBe("my invoice");
    expect(invoice.document).toBe("invoice document");
    expect(invoice.address.number).toBe("1");
    expect(invoice.address.street).toBe("street");
    expect(invoice.address.complement).toBe("complement");
    expect(invoice.address.city).toBe("city");
    expect(invoice.address.state).toBe("state");
    expect(invoice.address.zipCode).toBe("zipCode");
    expect(invoice.total()).toBe(35);
    expect(invoice.items.length).toBe(2);
    expect(invoice.items[0].id.id).toBe(productModel1.id);
    expect(invoice.items[0].name).toBe(productModel1.name);
    expect(invoice.items[0].price).toBe(productModel1.price);
    expect(invoice.items[1].id.id).toBe(productModel2.id);
    expect(invoice.items[1].name).toBe(productModel2.name);
    expect(invoice.items[1].price).toBe(productModel2.price);
    expect(invoice.createdAt).toBeDefined();
  });

  it("should raise an error when invoice is not found", async () => {

    const invoiceRepository = new InvoiceRepository();
    expect(async () => {
      await invoiceRepository.find("unexistant invoice");
    }).rejects.toThrow("Invoice with id unexistant invoice not found.");
  });
});