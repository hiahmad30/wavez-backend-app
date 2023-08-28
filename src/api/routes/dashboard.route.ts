import UserController from '../controllers/user.controller';
import AbstractRoute from "./abstractRoute.route";
import VesselController from '../controllers/vessel.controller';

export default class dashboardRoute extends AbstractRoute {
    private _userController = new UserController();
    private _vesselController = new VesselController();

    constructor() {
        super();
        // get all users for admin
        this.getRouter().get('/listUsers', this._userController.getAllUsersDashboard.bind(this._userController));

        // get all Vessels for admin
        this.getRouter().get('/listVessels', this._vesselController.getAllVesselsDashboard.bind(this._userController));
    }
}
