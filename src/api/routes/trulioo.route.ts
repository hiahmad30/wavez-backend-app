import AbstractRoute from './abstractRoute.route';
import UploadController from "../controllers/upload.controller";
import TruliooController from '../controllers/trulioo.controller';

export default class TruliooRoute extends AbstractRoute {
    private _truliooController = new TruliooController();

    constructor() {
        super();
        this.getRouter().get('/testauthentication', this.loginController.verifyToken, this._truliooController.checkTruliooAuth.bind(this._truliooController));
        this.getRouter().get('/countrycodes/IdentityVerification', this.loginController.verifyToken, this._truliooController.countryCodes.bind(this._truliooController));
        this.getRouter().get('/documentTypes/:country', this.loginController.verifyToken, this._truliooController.documentsByCountry.bind(this._truliooController));
        this.getRouter().post('/verify', this.loginController.verifyToken, this._truliooController.verify.bind(this._truliooController));
        this.getRouter().get('/transactionrecord/:transactionRecordID', this.loginController.verifyToken, this._truliooController.transactionRecord.bind(this._truliooController));
        this.getRouter().get('/transaction', this.loginController.verifyToken, this._truliooController.transactionStatusRecord.bind(this._truliooController));
        this.getRouter().post('/save', this._truliooController.saveRecord.bind(this._truliooController));
        this.getRouter().get('/getVRecordByUserId', this.loginController.verifyToken, this._truliooController.getRecordByUserId.bind(this._truliooController));
        this.getRouter().get('/getVRecordByUserId/:id', this.loginController.verifyToken, this._truliooController.getRecordByUserIdAdmin.bind(this._truliooController));
        this.getRouter().get('/getVRecords', this.loginController.verifyAllAdminToken, this._truliooController.getAllRecords.bind(this._truliooController));
        this.getRouter().get('/getVRecord/:id', this.loginController.verifyAllAdminToken, this._truliooController.getRecordById.bind(this._truliooController));
    }

}
