import { DataTypes } from "sequelize";
import { Model } from "../../model";

export class UserModel extends Model {
    constructor() {
        super(
            'fu',
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                name: {
                    type: DataTypes.STRING
                },
                email: {
                    type: DataTypes.STRING
                },
                password_hash: {
                    type: DataTypes.STRING
                },
                is_delete: {
                    type: DataTypes.NUMBER
                },
                created_at: {
                    type: DataTypes.DATE
                },
                updated_at: {
                    type: DataTypes.DATE
                }
            },
            {
                freezeTableName: true,
                timestamps: false,
                schema: "main",
                tableName: "users"
            }
        )
    }
    
}