import AbstractRoute from './abstractRoute.route';
import StaysController from '../controllers/stays.controller';
import VesselController from '../controllers/vessel.controller';
import GooglePlacesController from "../controllers/google-places.controller";
import StripeController from "../controllers/stripe.controller";

export default class StaysRoute extends AbstractRoute {
    private _staysController = new StaysController();
    private _vesselController = new VesselController();
    private _googlePlacesController = new GooglePlacesController();
    private _stripeController = new StripeController();

    constructor() {
        super();
        this.getRouter().get('', this._staysController.getStays.bind(this._staysController));
        this.getRouter().post('', this.loginController.verifyToken, this._googlePlacesController.checkLatLngForAddress.bind(this._googlePlacesController),
            this._vesselController.checkVesselOwner.bind(this._vesselController),
            this._staysController.addStay.bind(this._staysController));
        this.getRouter().put('/:id', this.loginController.verifyToken, this._stripeController.checkVesselOwnerPayoutStatus.bind(this._stripeController), this._googlePlacesController.checkLatLngForAddress.bind(this._googlePlacesController),
            this._vesselController.verifyUser.bind(this._vesselController), this._staysController.updateStay.bind(this._staysController));
        this.getRouter().delete('/:id', this.loginController.verifyToken, this._vesselController.verifyUser.bind(this._vesselController),
            this._vesselController.checkVesselOwner.bind(this._vesselController),
            this._staysController.deleteStay.bind(this._staysController));
        this.getRouter().get('/guest/:id', this._staysController.getStayByIdGuest.bind(this._staysController));
        this.getRouter().get('/:id',this.loginController.verifyToken, this._vesselController.verifyUser.bind(this._vesselController), this._staysController.getStayById.bind(this._staysController));
    }
}
