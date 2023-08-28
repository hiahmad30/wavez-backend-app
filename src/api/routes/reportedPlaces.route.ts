import AbstractRoute from "./abstractRoute.route";
import ReportedPlacesController from "../controllers/reportedPlaces.controller";

export default class ReportedPlacesRoute extends AbstractRoute {
    private _reportedPlacesController = new ReportedPlacesController();

    constructor() {
        super();
        this.getRouter().get('/list', this.loginController.verifyToken, this._reportedPlacesController.getReportedPlacesWithinProvidedDistance.bind(this._reportedPlacesController));
        this.getRouter().post('/', this.loginController.verifyToken, this._reportedPlacesController.addNewPlace.bind(this._reportedPlacesController));
    }
}
