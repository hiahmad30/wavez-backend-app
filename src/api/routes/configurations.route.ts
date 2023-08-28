import AbstractRoute from "./abstractRoute.route";
import ConfigurationsController from "../controllers/configurations.controller";
import UploadController from "../controllers/upload.controller";


export default class ConfigurationsRoute extends AbstractRoute {
    private _configurationController = new ConfigurationsController();
    private _uploadController = new UploadController();

    constructor() {
        super();
        this.getRouter().get('', this._configurationController.getConfiguration.bind(this._configurationController));
        this.getRouter().post('', this.loginController.verifyAllAdminToken, this._configurationController.addConfiguration.bind(this._configurationController));
        this.getRouter().get('/:key', this._configurationController.getConfiguration.bind(this._configurationController));
        this.getRouter().put('/updateImage', this.loginController.verifyAllAdminToken, this._uploadController.uploadSingleConfigurationImage.bind(this._uploadController));
        this.getRouter().put('/:key', this.loginController.verifyAllAdminToken, this._configurationController.updateConfigurationByKey.bind(this._configurationController));
        this.getRouter().delete('/deleteImage', this.loginController.verifyAllAdminToken, this._uploadController.deleteConfigurationImageFromBlob.bind(this._uploadController));
        this.getRouter().delete('/:key', this.loginController.verifyAllAdminToken, this._configurationController.deleteConfigurationByKey.bind(this._configurationController));
        this.getRouter().post('/uploadImage/:key', this.loginController.verifyAllAdminToken, this._uploadController.uploadSingleConfigurationImage.bind(this._uploadController));
        this.getRouter().post('/uploadDocument/:key', this.loginController.verifyAllAdminToken, this._uploadController.uploadSingleConfigurationImage.bind(this._uploadController));
        this.getRouter().post('/sendContactUsEmail', this._configurationController.sendContactUsEmail.bind(this._configurationController));
    }
}
