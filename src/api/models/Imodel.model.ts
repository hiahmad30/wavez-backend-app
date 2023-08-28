import { Model, Document } from 'mongoose';

export default interface IModel {
    getModel(): Model<Document>;
}
