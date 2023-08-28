import AbstractRoute from "./abstractRoute.route";
import ReportedPlacesController from "../controllers/reportedPlaces.controller";

export default class TravelDestinationsRoute extends AbstractRoute {
    private _reportsPlaceController = new ReportedPlacesController();

    constructor() {
        super();
        this.getRouter().get('/list', this.loginController.verifyToken, this._reportsPlaceController.getTravelDestinationsWithinProvidedDistance.bind(this._reportsPlaceController));
        this.getRouter().post('/', this.loginController.verifyAllAdminToken, this._reportsPlaceController.addNewTravelDestination.bind(this._reportsPlaceController));
    }
}
