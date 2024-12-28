import * as Sequelize from 'sequelize';

export class Model {
    public Op: typeof Sequelize.Op;
    public Model: any;

    constructor(name: string, schema: {}, options: {}) {
        this.Op = Sequelize.Op;
        this.Model = global.connectionObj.define(name, schema, options);
    }
    /**
     * @developer : Prithwiraj Bhadra
     * @date : 26-07-2023
     * @description : 
    */
    public findByAnyOne(dataobj: object): Promise<object> {
        return this.Model.findOne(dataobj);
    }

    /**
     * @developer : Prithwiraj Bhadra
     * @date : 26-07-2023
     * @description : 
    */
    public countAllByAny(dataobj: object): Promise<number> {
        return this.Model.count(dataobj);
    }

    /**
     * @developer : Prithwiraj Bhadra
     * @date : 26-07-2023
     * @description : 
    */
    public countAllByAnyNot(dataobj: any, field: string, value: string | number): number {
        dataobj[field] = {
            [Sequelize.Op.ne] : value
        };
        return this.Model.count({
            where: dataobj,
        });
    }

    /**
     * @developer : Prithwiraj Bhadra
     * @date : 26-07-2023
     * @description : 
    */
    public updateAnyRecord(dataobj: object, whereobj = {}): Promise<object> {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.Model.update(dataobj, whereobj)
                .then((saveData: []) => {
                    let returnData: [] = saveData;
                    return resolve(returnData);
                })
                .catch((error: any) => {
                    let returnData: object = {
                        status: 0,
                        data: error
                    };
                    return reject(returnData);
                });
        });
    }
    /**
     * @developer : Prithwiraj Bhadra
     * @date : 26-07-2023
     * @description : 
    */
    public addNewRecord(dataobj: object): Promise<object> {
        return this.Model.build(dataobj).save();
    }

    /**
     * @developer : Prithwiraj Bhadra
     * @date : 26-07-2023
     * @description : 
    */
    public deleteByAny(dataobj: object) {
        return this.Model.destroy({
            where: dataobj
        })
    }

    /**
     * @developer : Prithwiraj Bhadra
     * @date : 26-07-2023
     * @description : Inserting bulk data into table
    */
    public bulkInsert(data_arr: {}[]) {
        return this.Model.bulkCreate(data_arr, { returning: true });
    }

    /**
     * @developer : Prithwiraj Bhadra
     * @date : 26-07-2023
     * @description : 
    */
    public findAllByAny(dataobj: object) {
        return this.Model.findAll(dataobj);
    }
}