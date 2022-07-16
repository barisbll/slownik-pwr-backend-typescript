"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const developmentURL = `mongodb+srv://${process.env.DEV_MONGODB_USERNAME}:${process.env.DEV_MONGODB_PASSWORD}@slownik-pwr.gqzot.mongodb.net/?retryWrites=true&w=majority`;
const productionURL = `mongodb+srv://${process.env.PROD_MONGODB_USERNAME}:${process.env.PROD_MONGODB_PASSWORD}@slownik-pwr-cluster.dvcq2bd.mongodb.net/${process.env.PROD_MONGODB_DB_NAME}?retryWrites=true&w=majority`;
exports.default = {
    mongodbSecret: productionURL,
};
