import { Column, DataType, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import InvoiceProductModel from "./invoice-product.model";

@Table({
  tableName: "invoices",
  timestamps: false,
})
export default class InvoiceModel extends Model {
  @PrimaryKey
  @Column({ allowNull: false })
  id: string;

  @Column({ allowNull: false })
  name: string;

  @Column({ allowNull: false })
  document: string;

  @HasMany(() => InvoiceProductModel)
  items: InvoiceProductModel[];

  @Column({ allowNull: false })
  total: number;

  // Address
  @Column({ allowNull: false })
  number: string;

  @Column({ allowNull: false })
  street: string;

  @Column({ allowNull: false })
  complement: string;

  @Column({ allowNull: false })
  city: string;

  @Column({ allowNull: false })
  state: string;

  @Column({ allowNull: false })
  zipCode: string;

  @Column({ type: DataType.DATE, allowNull: true })
  createdAt: Date;
}
