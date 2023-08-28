import AbstractRoute from './abstractRoute.route';
import ChartersController from '../controllers/charters.controller';
import VesselController from '../controllers/vessel.controller';
import GooglePlacesController from "../controllers/google-places.controller";
import StripeController from "../controllers/stripe.controller";

export default class ChartersRoute extends AbstractRoute {
    private _chartersController = new ChartersController();
    private _vesselController = new VesselController();
    private _googlePlacesController = new GooglePlacesController();
    private _stripeController = new StripeController();

    constructor() {
        super();
        this.getRouter().get('', this._chartersController.getCharters.bind(this._chartersController));
        this.getRouter().post('', this.loginController.verifyToken, this._googlePlacesController.checkLatLngForAddress.bind(this._googlePlacesController),
            this._vesselController.checkVesselOwner.bind(this._vesselController),
            this._chartersController.addCharter.bind(this._chartersController));
        this.getRouter().put('/:id', this.loginController.verifyToken, this._stripeController.checkVesselOwnerPayoutStatus.bind(this._stripeController), this._googlePlacesController.checkLatLngForAddress.bind(this._googlePlacesController),
            this._vesselController.verifyUser.bind(this._vesselController),
            this._chartersController.updateCharter.bind(this._chartersController));
        this.getRouter().delete('/:id', this.loginController.verifyToken, this._vesselController.verifyUser.bind(this._vesselController),
            this._vesselController.checkVesselOwner.bind(this._vesselController),
            this._chartersController.deleteCharter.bind(this._chartersController));
        this.getRouter().get('/guest/:id', this._chartersController.getCharterByIdGuest.bind(this._chartersController));
        this.getRouter().get('/:id', this.loginController.verifyToken, this._vesselController.verifyUser.bind(this._vesselController), this._chartersController.getCharterById.bind(this._chartersController));
    }
}
