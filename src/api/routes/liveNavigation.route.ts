import AbstractRoute from "./abstractRoute.route";
import LiveNavigationController from "../controllers/liveNavigation.controller";

export default class LiveNavigationRoute extends AbstractRoute {
    private _liveNavigationController = new LiveNavigationController();

    constructor() {
        super();
        this.getRouter().post('/:tripId', this.loginController.verifyToken, this._liveNavigationController.calculatingSpeedByLocation.bind(this._liveNavigationController));
        this.getRouter().get('/:tripId', this.loginController.verifyToken, this._liveNavigationController.getNavigationDataByTripId.bind(this._liveNavigationController));
    }
}
