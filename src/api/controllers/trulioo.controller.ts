import {Request, Response} from 'express';
import axios from 'axios';
import IdentityVerificationRecordModel from '../models/IdentityVerificationRecord.model';
import IdentityVerificationVerifyRecordModel from '../models/IdentityVerificationVerifyRecord.model';
import {v4 as uuidv4} from 'uuid';
import {BlobServiceClient} from '@azure/storage-blob';


export default class TruliooController {
    private _identityVerificationRecordModel = IdentityVerificationRecordModel.getInstance().getModel();
    private _identityVerificationVerifyRecordModel = IdentityVerificationVerifyRecordModel.getInstance().getModel();
    private static _AZURE_STORAGE_CONNECTION_STRING: string;

    constructor() {
        if (!process.env.AZURE_STORAGE_CONNECTION_STRING) throw "Error: AZURE_STORAGE_CONNECTION_STRING not set";
        TruliooController._AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
        // if (!process.env.JWT_SECRET) throw "Error: JWT_SECRET not set";
        // VesselController._JWT_SECRET = process.env.JWT_SECRET;
        // if (!process.env.JWT_EXPIRES_IN) throw "Error: JWT_EXPIRES_IN not set";
        // VesselController._JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
    }

    public async countryCodes(req: Request, res: Response) {
        const token = Buffer.from(`${process.env.DOCV_API}:${process.env.DOCV_PASSWORD}`, 'utf8').toString('base64');
        try {
            const {data} = await axios.get(
                `${process.env.TRULIOO_BASE_URL}/configuration/v1/countrycodes/Identity Verification`
                ,
                {
                    headers: {
                        authorization: "Basic " + token
                    }
                })
                console.log(data)
            return res.status(200).send(data);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    }

    public async checkTruliooAuth(req: Request, res: Response) {
        const token = Buffer.from(`${process.env.DOCV_API}:${process.env.DOCV_PASSWORD}`, 'utf8').toString('base64');
        console.log(token,"token")
        try {
            const {data} = await axios.get(
                `${process.env.TRULIOO_BASE_URL}/connection/v1/testauthentication`
                ,
                {
                    headers: {
                        authorization: "Basic " + token
                    }
                })
                console.log(data,"data222")
            return res.status(200).send(data);
        } catch (error) {
            console.log(error,"error");
            return res.status(500).send(error);
        }
    }

    public async documentsByCountry(req: Request, res: Response) {
        const token = Buffer.from(`${process.env.DOCV_API}:${process.env.DOCV_PASSWORD}`, 'utf8').toString('base64');
        const country = req.params.country;
        try {
            const {data} = await axios.get(
                `${process.env.TRULIOO_BASE_URL}/configuration/v1/documentTypes/${country}`
                ,
                {
                    headers: {
                        authorization: "Basic " + token
                    }
                })
                console.log(data,"data")
            return res.status(200).send(data);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    }

    public async verify(req: Request, res: Response) {
        const token = Buffer.from(`${process.env.DOCV_API}:${process.env.DOCV_PASSWORD}`, 'utf8').toString('base64');
        console.log(token,"token")
        try {
            let {data} = await axios.post(
                `${process.env.TRULIOO_BASE_URL}/verifications/v1/verify`
                ,
                req.body,
                {
                    headers: {
                        authorization: "Basic " + token
                    }
                });
                console.log(data,"datassss")
            // await this._identityVerificationVerifyRecordModel.deleteMany({CustomerReferenceID: data.CustomerReferenceID.toString()});
            // data = {
            //     ...data,
            //     user: data.CustomerReferenceID,
            //     documentFrontImage: req.body.DataFields.Document.DocumentFrontImage ? await this.uploadToAzure({
            //         imageBase64: req.body.DataFields.Document.DocumentFrontImage ? req.body.DataFields.Document.DocumentFrontImage : null,
            //         user: data.CustomerReferenceID
            //     }) : ''
            //     ,
            //     documentBackImage: req.body.DataFields.Document.DocumentBackImage ? await this.uploadToAzure({
            //         imageBase64: req.body.DataFields.Document.DocumentBackImage ? req.body.DataFields.Document.DocumentBackImage : null,
            //         user: data.CustomerReferenceID
            //     }) : '',
            //     livePhoto: req.body.DataFields.Document.LivePhoto ? await this.uploadToAzure({
            //         imageBase64: req.body.DataFields.Document.LivePhoto ? req.body.DataFields.Document.LivePhoto : null,
            //         user: data.CustomerReferenceID
            //     }) : ''
            // }
            // const verificationRecord = new this._identityVerificationVerifyRecordModel(data);
            // await verificationRecord.save();
            return res.status(200).send({
                // success: true,
                // message: 'Record has been saved',
                // data:data
                data:data
            });
          
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    }

    public async transactionRecord(req: Request, res: Response) {
        const token = Buffer.from(`${process.env.DOCV_API}:${process.env.DOCV_PASSWORD}`, 'utf8').toString('base64');
        const transactionRecordID = req.params.transactionRecordID;
        try {
            const {data} = await axios.get(
                `${process.env.TRULIOO_BASE_URL}/verifications/v1/transactionrecord/${transactionRecordID}`
                ,   
                {
                    headers: {
                        authorization: "Basic " + token
                    }
                })
                console.log(data,"trascationID")
            return res.status(200).send(data);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    }


    public async transactionStatusRecord(req: Request, res: Response) {
        const token = Buffer.from(`${process.env.DOCV_API}:${process.env.DOCV_PASSWORD}`, 'utf8').toString('base64');
        const userId = res.locals.user.id;
        try {
            const transaction = await this._identityVerificationVerifyRecordModel.find({CustomerReferenceID: userId.toString()}).lean();
            if (transaction && transaction.length > 0) {
                const {data} = await axios.get(
                    // @ts-ignore
                    `${process.env.TRULIOO_BASE_URL}/verifications/v1/transaction/${transaction[0].TransactionID}/status`
                    ,
                    {
                        headers: {
                            authorization: "Basic " + token
                        }
                    })
                
                return res.status(200).send(data);
            } else {
                return res.status(200).send({
                    success: false,
                    message: 'Transaction error'
                });
            }

        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    }


    public async saveRecord(req: Request, res: Response) {
        try {
            const token = Buffer.from(`${process.env.DOCV_API}:${process.env.DOCV_PASSWORD}`, 'utf8').toString('base64');

            if (req.body.Status === 'Completed') {
                let {data} = await axios.get(
                    `${process.env.TRULIOO_BASE_URL}/verifications/v1/transactionrecord/${req.body.TransactionRecordId}`
                    ,
                    {
                        headers: {
                            authorization: "Basic " + token
                        }
                    });
                    console.log(data,"transaction")
                if (data) {
                    await this._identityVerificationRecordModel.deleteMany({CustomerReferenceID: data.CustomerReferenceID.toString()});
                    const foundImages = await this._identityVerificationVerifyRecordModel.findOne({CustomerReferenceID: data.CustomerReferenceID.toString()}).lean();
                    console.log('callback data Trulioo foundImages: ', foundImages);
                    data = {
                        ...data,
                        user: data.CustomerReferenceID,
                        // @ts-ignore
                        documentFrontImage: foundImages.documentFrontImage,
                        // @ts-ignore
                        documentBackImage: foundImages.documentBackImage,
                        // @ts-ignore
                        livePhoto: foundImages.livePhoto
                    }
                    console.log('callback data Trulioo data: ', data);
                    const verificationRecord = new this._identityVerificationRecordModel(data);
                    await verificationRecord.save();
                    return res.status(200).send({
                        success: true,
                        message: 'Record has been saved'
                    });
                } else {
                    return res.status(404).send({success: false, message: 'Data was not found'});
                }
            } else {
                return res.status(404).send({success: false, message: 'Status has not been completed yet'});
            }
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    }

    public async uploadToAzure(data: any) {
        try {
            let updatedBase64 = 'data:image/jpeg;base64,' + data.imageBase64;
            const matches = updatedBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            // @ts-ignore
            const buffer = Buffer.from(matches[2], 'base64');
            // Create the BlobServiceClient object which will be used to create a container client
            const blobServiceClient = BlobServiceClient.fromConnectionString(TruliooController._AZURE_STORAGE_CONNECTION_STRING);
            // Get a reference to a container
            const containerClient = blobServiceClient.getContainerClient('trulioo-doc-images');
            // Get a block blob client
            const blockBlobClient = containerClient.getBlockBlobClient(`trulioo-${data.user}-${uuidv4()}.jpeg`);
            await blockBlobClient.upload(buffer, buffer.byteLength);
            return blockBlobClient.url;
        } catch (error) {
            return '';
        }
    }

    public async getRecordByUserId(req: Request, res: Response) {
        const userId = res.locals.user.id;
        try {
            const record = await this._identityVerificationRecordModel.find({CustomerReferenceID: userId.toString()}).lean();
            console.log(record,"record")

            return res.status(200).send(record?.length > 0 ? {verifiedRecord: record} : {
                success: false,
                message: 'No records were found'
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    }

    public async getRecordByUserIdAdmin(req: Request, res: Response) {
        const userId = req.params.id;
        try {
            const record = await this._identityVerificationRecordModel.findOne({CustomerReferenceID: userId.toString()}).lean();

            return res.status(200).send(record ? record : {
                success: false,
                message: 'No records were found'
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    }

    public async getAllRecords(req: Request, res: Response) {
        try {
            const records = await this._identityVerificationRecordModel.find().lean().populate('user');
            
            return res.status(200).send(records?.length > 0 ? {verifiedRecords: records} : {
                success: false,
                message: 'No records were found'
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    }

    public async getRecordById(req: Request, res: Response) {
        const id = req.params.id
        try {
            const record = await this._identityVerificationRecordModel.findById(id).lean().populate('user');

            return res.status(200).send(record ? record : {
                success: false,
                message: 'No record were found'
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    }
}
