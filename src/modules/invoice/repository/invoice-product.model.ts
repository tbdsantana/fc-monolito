import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { ProductModel } from "./product.model";
import InvoiceModel from "./invoice.model";

@Table({
    tableName: "invoiceProducts",
    timestamps: false,
})
export default class InvoiceProductModel extends Model {
    @PrimaryKey
    @Column({ allowNull: false })
    id: string;

    @Column({ allowNull: false })
    name: string;

    @Column({ allowNull: false })
    unitPrice: number;

    @ForeignKey(() => ProductModel)
    @Column({ allowNull: false })
    productId: string;

    @BelongsTo(() => ProductModel)
    product: ProductModel;

    @ForeignKey(() => InvoiceModel)
    @Column({ allowNull: false })
    invoiceId: string;

    @BelongsTo(() => InvoiceModel)
    invoice: InvoiceModel;
}