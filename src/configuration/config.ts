import * as seq from "sequelize";
import {defaults} from "pg";
export class Config {

    private dbName:string = '';
    private dbUserName:string = '';
    private dbUserPass:string = '';

    /**
     * @developer : Prithwiraj Bhadra
     * @date : 26-07-2023
     * @description : Mysql connesction using sequelize
    */
    connectDB(){
        let connectionConfigObj:object = {
            host: process.env.DB_HOST,
            dialect: process.env.DB_DIALECT,
            timezone: process.env.DB_TIMEZONE,
            logging: process.env.NODE_ENV === 'production' ? false : console.log,
            define: { 
                timestamps: false,
                freezeTableName: true
            },
            pool: {
                max: 5, // max 100 connections 
                min: 0,
                idle: 5000
            }
        };

        this.dbName = process.env.DB_NAME as string;
        this.dbUserName = process.env.DB_USERNAME as string;
        this.dbUserPass = process.env.DB_PASS as string;
        let conn = new seq.Sequelize(this.dbName, this.dbUserName, this.dbUserPass, connectionConfigObj);
        // PG unable to make integer value by default, to convert this back into interger by default use PG {defaults}.parseInt8 = true;
        defaults.parseInt8 = true;

        if (process.env.NODE_ENV === 'local') {
            conn.authenticate()
            .then(() => {
                console.info('Connection has been established successfully.');
            })
            .catch(err => {
                console.error('Unable to connect to the database:', err);
            });
        }
        return conn
    }
    /*End*/
}