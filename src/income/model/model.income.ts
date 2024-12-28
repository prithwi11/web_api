import { DataTypes } from "sequelize";
import { Model } from "../../model";

export class IncomeModel extends Model {
    constructor() {
        super(
            'fi',
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                fk_user_id: {
                    type: DataTypes.INTEGER,
                },
                title: {
                    type: DataTypes.STRING
                },
                amount: {
                    type: DataTypes.DECIMAL
                },
                credit_date: {
                    type: DataTypes.DATE
                }
            },
            {
                freezeTableName: true,
                timestamps: false,
                schema: "main",
                tableName: "fin_income",
            }
        )
    }
}