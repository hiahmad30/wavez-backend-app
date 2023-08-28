// const {BlobServiceClient} = require('@azure/storage-blob');
import {v4 as uuidv4} from 'uuid';
import multer from 'multer';
import {MASNameResolver, MASObjectResolver, MetadataObj, MulterAzureStorage} from 'multer-azure-blob-storage';
import {NextFunction, query, Request, Response} from "express";
import {BlobServiceClient} from '@azure/storage-blob';

export default class UploadController {

    private static _AZURE_STORAGE_CONNECTION_STRING: string;
    private static _AZURE_STORAGE_BASE_URL: string;
    private static _AZURE_STORAGE_ACCOUNT: string;
    private static _AZURE_STORAGE_ACCESS_KEY: string;

    constructor() {
        if (!process.env.AZURE_STORAGE_CONNECTION_STRING) throw "Error: AZURE_STORAGE_CONNECTION_STRING not set";
        UploadController._AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
        if (!process.env.AZURE_STORAGE_BASE_URL) throw "Error: AZURE_STORAGE_BASE_URL not set";
        UploadController._AZURE_STORAGE_BASE_URL = process.env.AZURE_STORAGE_BASE_URL;
        if (!process.env.AZURE_STORAGE_ACCOUNT) throw "Error: AZURE_STORAGE_ACCOUNT not set";
        UploadController._AZURE_STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT;
        if (!process.env.AZURE_STORAGE_ACCESS_KEY) throw "Error: AZURE_STORAGE_ACCESS_KEY not set";
        UploadController._AZURE_STORAGE_ACCESS_KEY = process.env.AZURE_STORAGE_ACCESS_KEY;
    }

    resolveBlobName: MASNameResolver = (req: any, file: Express.Multer.File): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            const blobName: string = this.assignBlobName(req, file);
            resolve(blobName);
        });
    };

    resolveOldBlobName: MASNameResolver = (req: any, file: Express.Multer.File): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            const blobName: string = req.vesselImage.imageURL.replace(`${UploadController._AZURE_STORAGE_BASE_URL}images/`, "");
            resolve(blobName);
        });
    };

    resolveConfigurationBlobName: MASNameResolver = (req: any, file: Express.Multer.File): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            const blobName: string = this.assignConfigurationBlobName(req, file);
            resolve(blobName);
        });
    };

    resolveFeaturesBlobName: MASNameResolver = (req: any, file: Express.Multer.File): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            const blobName: string = this.assignFeatureBlobName(req, file);
            resolve(blobName);
        });
    };

    resolveUsersBlobName: MASNameResolver = (req: any, file: Express.Multer.File): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            const blobName: string = this.assignUserBlobName(req, file);
            resolve(blobName);
        });
    };

    resolveMetadata: MASObjectResolver = (req: any, file: Express.Multer.File): Promise<MetadataObj> => {
    return new Promise<MetadataObj>((resolve, reject) => {
        console.log(file);
        const metadata: MetadataObj = this.processMetadata(req, file);
        resolve(metadata);
    });
    };

    resolveConfigurationMetadata: MASObjectResolver = (req: any, file: Express.Multer.File): Promise<MetadataObj> => {
        return new Promise<MetadataObj>((resolve, reject) => {
            console.log(file);
            const metadata: MetadataObj = this.processConfigurationMetadata(req, file);
            resolve(metadata);
        });
    };

    public processConfigurationMetadata(req: any, file: Express.Multer.File): MetadataObj {
        return { contentType: file.mimetype};
    }

    azureImagesStorage: MulterAzureStorage = new MulterAzureStorage({
        connectionString: UploadController._AZURE_STORAGE_CONNECTION_STRING,
        accessKey: UploadController._AZURE_STORAGE_ACCESS_KEY,
        accountName: UploadController._AZURE_STORAGE_ACCOUNT,
        containerName: 'images',
        blobName: this.resolveBlobName,
        metadata: this.resolveMetadata,
        containerAccessLevel: 'blob'
    });

    azureImagesUpdateStorage: MulterAzureStorage = new MulterAzureStorage({
        connectionString: UploadController._AZURE_STORAGE_CONNECTION_STRING,
        accessKey: UploadController._AZURE_STORAGE_ACCESS_KEY,
        accountName: UploadController._AZURE_STORAGE_ACCOUNT,
        containerName: 'images',
        blobName: this.resolveOldBlobName,
        metadata: this.resolveMetadata,
        containerAccessLevel: 'blob'
    });

    azureImagesConfigurationStorage: MulterAzureStorage = new MulterAzureStorage({
        connectionString: UploadController._AZURE_STORAGE_CONNECTION_STRING,
        accessKey: UploadController._AZURE_STORAGE_ACCESS_KEY,
        accountName: UploadController._AZURE_STORAGE_ACCOUNT,
        containerName: 'configuration-files',
        blobName: this.resolveConfigurationBlobName,
        metadata: this.resolveConfigurationMetadata,
        contentSettings: (req: any, file: Express.Multer.File): Promise<MetadataObj> => {
            return new Promise<MetadataObj>((resolve, reject) => {
                const meta: MetadataObj = { contentType: file.mimetype};
                resolve(meta);
            });
        },
        containerAccessLevel: 'blob'
    });

    azureImagesFeaturesStorage: MulterAzureStorage = new MulterAzureStorage({
        connectionString: UploadController._AZURE_STORAGE_CONNECTION_STRING,
        accessKey: UploadController._AZURE_STORAGE_ACCESS_KEY,
        accountName: UploadController._AZURE_STORAGE_ACCOUNT,
        containerName: 'features-icons',
        blobName: this.resolveFeaturesBlobName,
        metadata: this.resolveMetadata,
        containerAccessLevel: 'blob'
    });

    azureImagesUserStorage: MulterAzureStorage = new MulterAzureStorage({
        connectionString: UploadController._AZURE_STORAGE_CONNECTION_STRING,
        accessKey: UploadController._AZURE_STORAGE_ACCESS_KEY,
        accountName: UploadController._AZURE_STORAGE_ACCOUNT,
        containerName: 'users-profile-image',
        blobName: this.resolveUsersBlobName,
        metadata: this.resolveMetadata,
        containerAccessLevel: 'blob'
    });

    public assignBlobName(req: any, file: Express.Multer.File): string {
        // generate a randomized uuid v4
        return `image-vesselType-${req.vesselType}-vesselId-${req.params.vesselId}-${uuidv4()}.jpg`;
    }

    public assignConfigurationBlobName(req: any, file: Express.Multer.File): string {
        // generate a randomized uuid v4
        if (req.body.existingUrl) {
            // getting the existing file name
            return req.body.existingUrl.replace(`${UploadController._AZURE_STORAGE_BASE_URL}configuration-files/`, "");
        } else {
            switch (file.mimetype.split('/')[1]) {
                case 'png': {
                    return `${req.params.key}-${uuidv4()}.png`;
                }
                case 'jpg': {
                    return `${req.params.key}-${uuidv4()}.jpg`;
                }
                case 'jpeg': {
                    return `${req.params.key}-${uuidv4()}.jpeg`;
                }
                default: {
                    return `${req.params.key}-${uuidv4()}.${file.mimetype.split('/')[1]}`;
                }
            }
        }
    }

    public assignFeatureBlobName(req: any, file: Express.Multer.File): string {
        // generate a randomized uuid v4
        if (req.body.existingUrl) {
            // getting the existing file name
            return req.body.existingUrl.replace(`${UploadController._AZURE_STORAGE_BASE_URL}features-icons/`, "");
        } else {
            switch (file.mimetype.split('/')[1]) {
                case 'png': {
                    return `icon-${uuidv4()}.png`;
                }
                case 'jpg': {
                    return `icon-${uuidv4()}.jpg`;
                }
                case 'jpeg': {
                    return `icon-${uuidv4()}.jpeg`;
                }
                default: {
                    return `icon-${uuidv4()}.${file.mimetype.split('/')[1]}`;
                }
            }
        }
    }

    public assignUserBlobName(req: any, file: Express.Multer.File): string {
        // generate a randomized uuid v4
        if (req.body.existingUrl) {
            // getting the existing file name
            return req.body.existingUrl.replace(`${UploadController._AZURE_STORAGE_BASE_URL}users-profile-image/`, "");
        } else {
            switch (file.mimetype.split('/')[1]) {
                case 'png': {
                    return `icon-${uuidv4()}.png`;
                }
                case 'jpg': {
                    return `icon-${uuidv4()}.jpg`;
                }
                case 'jpeg': {
                    return `icon-${uuidv4()}.jpeg`;
                }
                default: {
                    return `icon-${uuidv4()}.${file.mimetype.split('/')[1]}`;
                }
            }
        }
    }

    public processMetadata(req: any, file: Express.Multer.File): MetadataObj {
        return {};
    }

    uploadImage = multer({
        storage: this.azureImagesStorage,
        limits: { fileSize: 10000000 }
    });

    uploadConfigurationImage = multer({
        storage: this.azureImagesConfigurationStorage,
        limits: { fileSize: 25000000 },
        fileFilter: (req, file, cb) => {
            if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "application/pdf") {
                cb(null, true);
            } else {
                cb(null, false);
                return cb(new Error('Only .pdf, .png, .jpg and .jpeg format allowed!'));
            }
            if (!req.body.existingUrl) {
                if (!req.params.key) {
                    cb(null, false);
                    return cb(new Error('Configuration Key required for uploading a new file. (use post api)'));
                }
            }
        }
    });

    uploadFeatureIcon = multer({
        storage: this.azureImagesFeaturesStorage,
        limits: { fileSize: 10000000 },
        fileFilter: (req, file, cb) => {
            if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
                cb(null, true);
            } else {
                cb(null, false);
                return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
            }
        }
    });

    uploadUserImage = multer({
        storage: this.azureImagesUserStorage,
        limits: { fileSize: 10000000 },
        fileFilter: (req, file, cb) => {
            if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
                cb(null, true);
            } else {
                cb(null, false);
                return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
            }
        }
    });

    updatePreviouslyUploadedImage = multer({
        storage: this.azureImagesUpdateStorage,
        limits: { fileSize: 10000000 }
    });

    // for uploading single image
    singleImageUpload = this.uploadImage.single('image');
    // for uploading multiple image
    multipleImageUpload = this.uploadImage.array('images', 10);

    singleConfigurationImageUpload = this.uploadConfigurationImage.single('image');

    singleFeatureIconUpload = this.uploadFeatureIcon.single('image');

    singleUserImageUpload = this.uploadUserImage.single('image');

    // for updating the previously uploaded image
    updatePreviousImage = this.updatePreviouslyUploadedImage.single('image');

    public uploadVesselImage(this: { singleImageUpload: (req: any, res: any, cb: any) => any }, req: any, res: any, next: any) {
        this.singleImageUpload(req, res, function (err: { message: any; }) {
            if (err) {
                return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
            }
            if (!req?.file?.url) {
                return res.status(400).send({ errors: [{ success: false, message: "No file provided to upload." }] });
            }
            next();
        });
    }

    public uploadVesselImages(this: { multipleImageUpload: (req: any, res: any, cb: any) => any }, req: any, res: any, next: any) {
        this.multipleImageUpload(req, res, function (err: { message: any; }) {
            if (err) {
                return res.status(422).send({ errors: [{ title: 'Files Upload Error', detail: err.message }] });
            }
            next();
        });
    }

    public uploadUpdatedImageToBlob(this: { updatePreviousImage: (req: any, res: any, cb: any) => any }, req: any, res: any, next: any) {
        this.updatePreviousImage(req, res, function (err: { message: any; }) {
            if (err) {
                return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
            }
            if (!req?.file?.url) {
                return res.status(400).send({ errors: [{ success: false, message: "No file provided to upload." }] });
            }
            return res.status(200).send({success: true, message: "Image Uploaded", url: req.file.url.split('?se')[0]});
        });
    }

    public uploadSingleConfigurationImage(this: { singleConfigurationImageUpload: (req: any, res: any, cb: any) => any }, req: any, res: any, next: any) {
        this.singleConfigurationImageUpload(req, res, function (err: { message: any; }) {
            if (err) {
                return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
            }
            if (!req?.file?.url) {
                return res.status(400).send({ errors: [{ success: false, message: "No file provided to upload." }] });
            }
            return res.status(200).send({success: true, message: "Image Uploaded", url: req.file.url.split('?se')[0]});
        });
    }

    public uploadSingleFeatureIcon(this: { singleFeatureIconUpload: (req: any, res: any, cb: any) => any }, req: any, res: any, next: any) {
        this.singleFeatureIconUpload(req, res, function (err: { message: any; }) {
            if (err) {
                return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
            }
            if (!req?.file?.url) {
                return res.status(400).send({ errors: [{ success: false, message: "No file provided to upload." }] });
            }
            return res.status(200).send({success: true, message: "Image Uploaded", url: req.file.url.split('?se')[0]});
        });
    }

    public uploadSingleUserImage(this: { singleUserImageUpload: (req: any, res: any, cb: any) => any }, req: any, res: any, next: any) {
        this.singleUserImageUpload(req, res, function (err: { message: any; }) {
            if (err) {
                return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
            }
            if (!req?.file?.url) {
                return res.status(400).send({ errors: [{ success: false, message: "No file provided to upload." }] });
            }
            return res.status(200).send({success: true, message: "Image Uploaded", url: req.file.url.split('?se')[0]});
        });
    }

    public async deleteImageByIdFromBlob(req: Request, res: Response, next: NextFunction):Promise<any> {
        const vesselImage = res.locals.vesselImage;

        if (vesselImage) {
            try {
                const blobServiceClient = await BlobServiceClient.fromConnectionString(UploadController._AZURE_STORAGE_CONNECTION_STRING);
                const containerClient = await blobServiceClient.getContainerClient("images");
                console.log(`${UploadController._AZURE_STORAGE_BASE_URL}images/${vesselImage.imageURL}`);
                const deleteResponse = await containerClient.deleteBlob(vesselImage.imageURL.replace(`${UploadController._AZURE_STORAGE_BASE_URL}images/`, ""));
                next();
            } catch (err) {
                return res.status(500).send({success: false, message: `Error Deleting the Image ${err}`}).end();
            }
        } else {
            return res.status(404).send({success: false, message: "Image not found."}).end();
        }
        return 
    }

    public async deleteConfigurationImageFromBlob(req: Request, res: Response, next: NextFunction) {
        const url: string = req.query.url as string
        if (url) {
            try {
                const blobServiceClient = await BlobServiceClient.fromConnectionString(UploadController._AZURE_STORAGE_CONNECTION_STRING);
                const containerClient = await blobServiceClient.getContainerClient("configuration-files");
                const deleteResponse = await containerClient.deleteBlob(url.replace(`${UploadController._AZURE_STORAGE_BASE_URL}configuration-files/`, ""));
                return res.status(200).send({success: true, message: "Image Deleted"});
            } catch (err) {
                return res.status(500).send({success: false, message: `Error Deleting the Image ${err}`}).end();
            }
        } else {
            return res.status(404).send({success: false, message: "Image not found."}).end();
        }
    }

    public async deleteFeatureIconFromBlob(req: Request, res: Response, next: NextFunction) {
        if (req.query.url) {
            const query = req.query.url as string;
            try {
                const blobServiceClient = await BlobServiceClient.fromConnectionString(UploadController._AZURE_STORAGE_CONNECTION_STRING);
                const containerClient = await blobServiceClient.getContainerClient("features-icons");
                const deleteResponse = await containerClient.deleteBlob(query.replace(`${UploadController._AZURE_STORAGE_BASE_URL}features-icons/`, ""));
                return res.status(200).send({success: true, message: "Image Deleted"});
            } catch (err) {
                return res.status(500).send({success: false, message: `Error Deleting the Image ${err}`}).end();
            }
        } else {
            return res.status(404).send({success: false, message: "Image not found."}).end();
        }
    }

    public async deleteUserImageFromBlob(req: Request, res: Response, next: NextFunction) {
        if (req.query.url) {
            const query = req.query.url as string;
            try {
                const blobServiceClient = await BlobServiceClient.fromConnectionString(UploadController._AZURE_STORAGE_CONNECTION_STRING);
                const containerClient = await blobServiceClient.getContainerClient("users-profile-image");
                const deleteResponse = await containerClient.deleteBlob(query.replace(`${UploadController._AZURE_STORAGE_BASE_URL}users-profile-image/`, ""));
                return res.status(200).send({success: true, message: "Image Deleted"});
            } catch (err) {
                return res.status(500).send({success: false, message: `Error Deleting the Image ${err}`}).end();
            }
        } else {
            return res.status(404).send({success: false, message: "Image not found."}).end();
        }
    }

    resolveBlobNameFiles: MASNameResolver = (req: any, file: Express.Multer.File): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            const blobName: string = this.assignBlobNameFiles(req, file);
            resolve(blobName);
        });
    };

    resolveMetadataFiles: MASObjectResolver = (req: any, file: Express.Multer.File): Promise<MetadataObj> => {
        return new Promise<MetadataObj>((resolve, reject) => {
            console.log(file);
            const metadata: MetadataObj = this.processMetadataFiles(req, file);
            resolve(metadata);
        });
    };

    public assignBlobNameFiles(req: any, file: Express.Multer.File): string {
        // generate a randomized uuid v4
        switch (file.mimetype.split('/')[1]) {
            case 'msword': {
                return `document-${req.body.fileType}-vesselType-${req.vesselType}-vesselId-${req.params.vesselId}-${uuidv4()}.doc`;
            }
            case 'vnd.openxmlformats-officedocument.wordprocessingml.document': {
                return `document-${req.body.fileType}-vesselType-${req.vesselType}-vesselId-${req.params.vesselId}-${uuidv4()}.docx`;
            }
            default: {
                return `document-${req.body.fileType}-vesselType-${req.vesselType}-vesselId-${req.params.vesselId}-${uuidv4()}.${file.mimetype.split('/')[1]}`;
            }
        }
    }

    public processMetadataFiles(req: any, file: Express.Multer.File): MetadataObj {
        return {};
    }

    azureFilesStorage: MulterAzureStorage = new MulterAzureStorage({
        connectionString: UploadController._AZURE_STORAGE_CONNECTION_STRING,
        accessKey: UploadController._AZURE_STORAGE_ACCESS_KEY,
        accountName: UploadController._AZURE_STORAGE_ACCOUNT,
        containerName: 'documents',
        blobName: this.resolveBlobNameFiles,
        metadata: this.resolveMetadataFiles,
        containerAccessLevel: 'blob'
    });

    uploadFile = multer({
        storage: this.azureFilesStorage,
        limits: {fileSize: 10000000}
    });

    // for uploading single image
    singleFileUpload = this.uploadFile.single('file');

    public uploadVesselFile(this: { singleFileUpload: (req: any, res: any, cb: any) => any }, req: any, res: any, next: any) {
        this.singleFileUpload(req, res, function (err: { message: any; }) {
            if (err) {
                return res.status(422).send({errors: [{title: 'File Upload Error', detail: err.message}]});
            }
            next();
        });
    }

    public async deleteFileByIdFromBlob(req: Request, res: Response, next: NextFunction):Promise<any> {
        const vesselDocument = res.locals.vesselDocument;

        if (vesselDocument) {
            try {
                const blobServiceClient = await BlobServiceClient.fromConnectionString(UploadController._AZURE_STORAGE_CONNECTION_STRING);
                const containerClient = await blobServiceClient.getContainerClient("documents");
                console.log(vesselDocument.fileURL.replace(`${UploadController._AZURE_STORAGE_BASE_URL}documents/`, ""));
                const deleteResponse = await containerClient.deleteBlob(vesselDocument.fileURL.replace(`${UploadController._AZURE_STORAGE_BASE_URL}documents/`, ""));
                next();
            } catch (err) {
                return res.status(500).send({success: false, message: `Error Deleting the Document ${err}`}).end();
            }
        } else {
            return res.status(404).send({success: false, message: "Document not found."}).end();
        }
        return null
    }

    attachmentUpload = multer({ storage: multer.memoryStorage(),
        limits: { fileSize: 5242880 }}).array('attachments');

    public uploadAttachments(this: { attachmentUpload: (req: any, res: any, cb: any) => any }, req: any, res: any, next: any) {
        this.attachmentUpload(req, res, function (err: { message: any; }) {
            if (err) {
                return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
            }
            next();
        });
    }

    public assignReportImageBlobName(req: any, file: Express.Multer.File): string {
        // generate a randomized uuid v4
        switch (file.mimetype.split('/')[1]) {
            case 'png': {
                return `reportImage-${uuidv4()}.png`;
            }
            case 'jpg': {
                return `reportImage-${uuidv4()}.jpg`;
            }
            case 'jpeg': {
                return `reportImage-${uuidv4()}.jpeg`;
            }
            default: {
                return `reportImage-${uuidv4()}.${file.mimetype.split('/')[1]}`;
            }
        }
    }

    resolveReportImagesName: MASNameResolver = (req: any, file: Express.Multer.File): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            const blobName: string = this.assignReportImageBlobName(req, file);
            resolve(blobName);
        });
    };

    resolveReportImagesMetadata: MASObjectResolver = (req: any, file: Express.Multer.File): Promise<MetadataObj> => {
        return new Promise<MetadataObj>((resolve, reject) => {
            console.log(file);
            const metadata: MetadataObj = {};
            resolve(metadata);
        });
    };

    azureReportsImagesStorage: MulterAzureStorage = new MulterAzureStorage({
        connectionString: UploadController._AZURE_STORAGE_CONNECTION_STRING,
        accessKey: UploadController._AZURE_STORAGE_ACCESS_KEY,
        accountName: UploadController._AZURE_STORAGE_ACCOUNT,
        containerName: 'reports-images',
        blobName: this.resolveReportImagesName,
        metadata: this.resolveReportImagesMetadata,
        containerAccessLevel: 'blob'
    });

    reportsImagesUpload = multer({
        storage: this.azureReportsImagesStorage,
        limits: { fileSize: 10000000 },
        fileFilter: (req, file, cb) => {
            if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
                cb(null, true);
            } else {
                cb(null, false);
                return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
            }
        }
    });

    multipleReportImageUpload = this.reportsImagesUpload.array('photos', 10);

    public uploadReportImages(this: { multipleReportImageUpload: (req: any, res: any, cb: any) => any }, req: any, res: any, next: any) {
        const tripId = req.params.tripId || null;
        if (tripId) {
            this.multipleReportImageUpload(req, res, function (err: { message: any; }) {
                if (err) {
                    return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
                }
                next();
            });
        } else {
            return res.status(500).send({success: false, message: "trip Id not provided"});
        }
    }

    /***
    * Upload Vessel License Start
    * ***/

    public assignVesselLicenseBlobName(req: any, file: Express.Multer.File): string {
        // generate a randomized uuid v4
        switch (file.mimetype.split('/')[1]) {
            case 'png': {
                return `vesselLicense-${uuidv4()}.png`;
            }
            case 'jpg': {
                return `vesselLicense-${uuidv4()}.jpg`;
            }
            case 'jpeg': {
                return `vesselLicense-${uuidv4()}.jpeg`;
            }
            default: {
                return `vesselLicense-${uuidv4()}.${file.mimetype.split('/')[1]}`;
            }
        }
    }

    resolveVesselLicenseName: MASNameResolver = (req: any, file: Express.Multer.File): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            const blobName: string = this.assignVesselLicenseBlobName(req, file);
            resolve(blobName);
        });
    };

    resolveVesselLicenseMetadata: MASObjectResolver = (req: any, file: Express.Multer.File): Promise<MetadataObj> => {
        return new Promise<MetadataObj>((resolve, reject) => {
            const metadata: MetadataObj = {};
            resolve(metadata);
        });
    };

    azureVesselLicenseStorage: MulterAzureStorage = new MulterAzureStorage({
        connectionString: UploadController._AZURE_STORAGE_CONNECTION_STRING,
        accessKey: UploadController._AZURE_STORAGE_ACCESS_KEY,
        accountName: UploadController._AZURE_STORAGE_ACCOUNT,
        containerName: 'vessel-licenses',
        blobName: this.resolveVesselLicenseName,
        metadata: this.resolveVesselLicenseMetadata,
        containerAccessLevel: 'blob'
    });

    // TODO ensure what types of files are allowed for vessel license upload
    vesselLicenseUpload = multer({
        storage: this.azureVesselLicenseStorage,
        limits: { fileSize: 10000000 }
        // fileFilter: (req, file, cb) => {
        //     if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
        //         cb(null, true);
        //     } else {
        //         cb(null, false);
        //         return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        //     }
        // }
    });

    multipleVesselLicenseUpload = this.vesselLicenseUpload.fields([{name: "licenseFront"}, {name: "licenseBack"}]);

    public uploadVesselLicense(this: { multipleVesselLicenseUpload: (req: any, res: any, cb: any) => any }, req: any, res: any, next: any) {
        this.multipleVesselLicenseUpload(req, res, function (err: { message: any; }) {
            if (err) {
                return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
            }
            next();
        });
    }

    /***
     * Upload Vessel License End
     * ***/

    /***
     * Upload Message Image
     * ***/

    public assignMessageImageBlobName(req: any, file: Express.Multer.File): string {
        // generate a randomized uuid v4
        switch (file.mimetype.split('/')[1]) {
            case 'png': {
                return `messageImage-${uuidv4()}.png`;
            }
            case 'jpg': {
                return `messageImage-${uuidv4()}.jpg`;
            }
            case 'jpeg': {
                return `messageImage-${uuidv4()}.jpeg`;
            }
            default: {
                return `messageImage-${uuidv4()}.${file.mimetype.split('/')[1]}`;
            }
        }
    }

    resolveMessageImageName: MASNameResolver = (req: any, file: Express.Multer.File): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            const blobName: string = this.assignMessageImageBlobName(req, file);
            resolve(blobName);
        });
    };

    resolveMessageImageMetadata: MASObjectResolver = (req: any, file: Express.Multer.File): Promise<MetadataObj> => {
        return new Promise<MetadataObj>((resolve, reject) => {
            const metadata: MetadataObj = {};
            resolve(metadata);
        });
    };

    azureMessageImageStorage: MulterAzureStorage = new MulterAzureStorage({
        connectionString: UploadController._AZURE_STORAGE_CONNECTION_STRING,
        accessKey: UploadController._AZURE_STORAGE_ACCESS_KEY,
        accountName: UploadController._AZURE_STORAGE_ACCOUNT,
        containerName: 'messages-images',
        blobName: this.resolveMessageImageName,
        metadata: this.resolveMessageImageMetadata,
        containerAccessLevel: 'blob'
    });

    // TODO ensure what types of files are allowed for vessel license upload
    messageImageUpload = multer({
        storage: this.azureMessageImageStorage,
        limits: { fileSize: 10000000 }
        // fileFilter: (req, file, cb) => {
        //     if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
        //         cb(null, true);
        //     } else {
        //         cb(null, false);
        //         return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        //     }
        // }
    });

    singleMessageImageUpload = this.messageImageUpload.single("image");

    public uploadMessageImage(this: { singleMessageImageUpload: (req: any, res: any, cb: any) => any }, req: any, res: any, next: any) {
        this.singleMessageImageUpload(req, res, function (err: { message: any; }) {
            if (err) {
                return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
            }
            return res.status(200).send(req.file.url.split('?se')[0]);
        });
    }

    /***
     * Upload Message Image End
     * ***/

    public async deleteLicenseDocuments(req: Request, res: Response, next: NextFunction):Promise<any> {
        const documentsToDelete = res.locals.documentsToDelete;

        if (documentsToDelete && documentsToDelete?.length !== 0) {
            await Promise.all(
                documentsToDelete.map(async (doc: any) => {
                    try {
                        const blobServiceClient = await BlobServiceClient.fromConnectionString(UploadController._AZURE_STORAGE_CONNECTION_STRING);
                        const containerClient = await blobServiceClient.getContainerClient("vessel-licenses");
                        console.log(doc.fileURL.replace(`${UploadController._AZURE_STORAGE_BASE_URL}vessel-licenses/`, ""));
                        const deleteResponse = await containerClient.deleteBlob(doc.fileURL.replace(`${UploadController._AZURE_STORAGE_BASE_URL}vessel-licenses/`, ""));
                    } catch (err) {
                        console.log(err);
                        res.status(500).send({success: false, message: `error deleting licenses from blob${err}`}).end();
                    }
                })
            )
            res.status(200).send({success: true, message: "Documents Saved"}).end();
        } else {
            return res.status(200).send({success:true, message: "Documents Saved"}).end();
        }
        return null
    }
}
