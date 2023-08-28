import AbstractRoute from "./abstractRoute.route";
import ReportsController from "../controllers/reports.controller";
import UploadController from "../controllers/upload.controller";

export default class ReportsRoute extends AbstractRoute {
    private _reportsController = new ReportsController();
    private _uploadController = new UploadController();

    constructor() {
        super();
        this.getRouter().get('/:id?', this.loginController.verifyAllAdminToken, this._reportsController.getReports.bind(this._reportsController));
        this.getRouter().post('/:tripId', this.loginController.verifyToken, this._uploadController.uploadReportImages.bind(this._uploadController), this._reportsController.addReport.bind(this._reportsController));
        this.getRouter().put('/:id', this.loginController.verifyToken, this._reportsController.updateReport.bind(this._reportsController));
        this.getRouter().delete('/:id', this.loginController.verifyToken, this._reportsController.deleteReport.bind(this._reportsController));
    }
}
