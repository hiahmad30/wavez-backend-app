import VesselController from '../controllers/vessel.controller';
import AbstractRoute from './abstractRoute.route';
import UploadController from "../controllers/upload.controller";
import StripeController from "../controllers/stripe.controller";

export default class VesselRoute extends AbstractRoute {
    private _vesselController = new VesselController();
    private _uploadController = new UploadController();
    private _stripeController = new StripeController();

    
    
    constructor() {
        super();
        this.getRouter().post('/category', this.loginController.verifyAllAdminToken, this._vesselController.addVesselCategory.bind(this._vesselController));
        this.getRouter().put('/category/:categoryId', this.loginController.verifyAllAdminToken, this._vesselController.updateVesselCategory.bind(this._vesselController));
        this.getRouter().delete('/category/:categoryId', this.loginController.verifyAllAdminToken, this._vesselController.deleteVesselCategory.bind(this._vesselController));
        this.getRouter().get('/category', this._vesselController.getVesselCategory.bind(this._vesselController));

        this.getRouter().post('/fuel', this.loginController.verifyAllAdminToken, this._vesselController.addVesselFuel.bind(this._vesselController));
        this.getRouter().put('/fuel/:fuelId', this.loginController.verifyAllAdminToken, this._vesselController.updateVesselFuel.bind(this._vesselController));
        this.getRouter().delete('/fuel/:fuelId', this.loginController.verifyAllAdminToken, this._vesselController.deleteVesselFuel.bind(this._vesselController));
        this.getRouter().get('/fuel', this._vesselController.getVesselFuel.bind(this._vesselController));

        this.getRouter().post('/feature/uploadIcon', this.loginController.verifyAllAdminToken, this._uploadController.uploadSingleFeatureIcon.bind(this._uploadController));
        this.getRouter().put('/feature/uploadIcon', this.loginController.verifyAllAdminToken, this._uploadController.uploadSingleFeatureIcon.bind(this._uploadController));
        this.getRouter().post('/feature', this.loginController.verifyAllAdminToken, this._vesselController.addVesselFeature.bind(this._vesselController));
        this.getRouter().get('/feature', this._vesselController.getVesselFeature.bind(this._vesselController));
        this.getRouter().put('/feature/:featureId', this.loginController.verifyAllAdminToken, this._vesselController.updateVesselFeature.bind(this._vesselController));
        this.getRouter().delete('/feature/:featureId', this.loginController.verifyAllAdminToken, this._vesselController.deleteVesselFeature.bind(this._vesselController));
        this.getRouter().delete('/deleteIcon', this.loginController.verifyAllAdminToken, this._uploadController.deleteFeatureIconFromBlob.bind(this._uploadController));

        this.getRouter().put('/image/:vesselId',
            this.loginController.verifyToken,
            this._vesselController.checkUploadParameters.bind(this._vesselController),
            this._uploadController.uploadVesselImage.bind(this._uploadController),
            this._vesselController.updateModelWithVesselImage.bind(this._vesselController));

        this.getRouter().put('/images/:vesselId', this.loginController.verifyToken,
            this._vesselController.checkUploadParameters.bind(this._vesselController),
            this._uploadController.uploadVesselImages.bind(this._uploadController),
            this._vesselController.updateModelWithVesselImages.bind(this._vesselController));

        this.getRouter().delete('/image/:imageId',
            this.loginController.verifyToken,
            this._vesselController.deleteVesselImageById.bind(this._vesselController),
            this._uploadController.deleteImageByIdFromBlob.bind(this._uploadController),
            this._vesselController.deleteImageObject.bind(this._vesselController));

        this.getRouter().put('/updateImageCaptions/:vesselId',
            this.loginController.verifyToken,
            this._vesselController.updateImagesCaptions.bind(this._vesselController));

        this.getRouter().put('/updateImage/:imageId',
            this.loginController.verifyToken,
            this._vesselController.updateImageLinkByImageId.bind(this._vesselController),
            this._uploadController.uploadUpdatedImageToBlob.bind(this._uploadController));

        this.getRouter().post('/search', this._vesselController.searchVessel.bind(this._vesselController));

        this.getRouter().get('/admin/document/boatLicense/:id', this.loginController.verifyAllAdminToken,
            this._vesselController.getBoatLicenseFilesAdmin.bind(this._vesselController));

        this.getRouter().get('/admin/document/:id', this.loginController.verifyAllAdminToken,
            this._vesselController.getVesselFilesAdmin.bind(this._vesselController));

        this.getRouter().put('/admin/document/:id', this.loginController.verifyAllAdminToken,
            this._vesselController.updateVesselFilesAdmin.bind(this._vesselController));

        this.getRouter().put('/document/:vesselId',
            this.loginController.verifyToken,
            this._vesselController.checkUploadParameters.bind(this._vesselController),
            this._uploadController.uploadVesselFile.bind(this._uploadController),
            this._vesselController.updateModelWithDocumentsFile.bind(this._vesselController));

        this.getRouter().delete('/document/:documentId',
            this.loginController.verifyToken,
            this._vesselController.deleteVesselFileById.bind(this._vesselController),
            this._uploadController.deleteFileByIdFromBlob.bind(this._uploadController),
            this._vesselController.deleteFileObject.bind(this._vesselController));

        this.getRouter().get('/document/:vesselId', this.loginController.verifyToken,
            this._vesselController.getVesselFiles.bind(this._vesselController));

        this.getRouter().put('/updateCoverImage', this.loginController.verifyToken,
            this._vesselController.updateCoverImageById.bind(this._vesselController));

        this.getRouter().put('/updateVesselSequence/:vesselType', this.loginController.verifyAllAdminToken,
            this._vesselController.updateVesselSequence.bind(this._vesselController));

        this.getRouter().get('/getFeaturedListings', this._vesselController.getFeaturedVessels.bind(this._vesselController));

        this.getRouter().get('/getAllListings', this.loginController.verifyAllAdminToken,
            this._vesselController.getAllListings.bind(this._vesselController));

        this.getRouter().get('/getAllTaxRates', this.loginController.verifyToken,
            this._stripeController.getAllTaxRates.bind(this._stripeController));
        //
        this.getRouter().get('/guest/:id', this._vesselController.getVesselByIdGuest.bind(this._vesselController));
        this.getRouter().put('/:id', this.loginController.verifyAllAdminToken, this._vesselController.updateVesselByAdmin.bind(this._vesselController));
        this.getRouter().get('/:id', this.loginController.verifyToken, this._vesselController.getVesselById.bind(this._vesselController));
    }
}
