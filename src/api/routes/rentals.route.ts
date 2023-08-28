import RentalsController from '../controllers/rentals.controller';
import AbstractRoute from './abstractRoute.route';
import VesselController from '../controllers/vessel.controller';
import GooglePlacesController from "../controllers/google-places.controller";
import StripeController from "../controllers/stripe.controller";

export default class RentalsRoute extends AbstractRoute {
    private _rentalsController = new RentalsController();
    private _vesselController = new VesselController();
    private _googlePlacesController = new GooglePlacesController();
    private _stripeController = new StripeController();
    constructor() {
        super();
        this.getRouter().get('', this._rentalsController.getRentals.bind(this._rentalsController));
        this.getRouter().post('', this.loginController.verifyToken, this._googlePlacesController.checkLatLngForAddress.bind(this._googlePlacesController),
            this._vesselController.checkVesselOwner.bind(this._vesselController),
            this._rentalsController.addRental.bind(this._rentalsController));
        this.getRouter().put('/:id', this.loginController.verifyToken, this._stripeController.checkVesselOwnerPayoutStatus.bind(this._stripeController), this._googlePlacesController.checkLatLngForAddress.bind(this._googlePlacesController),
            this._vesselController.verifyUser.bind(this._vesselController),
            this._rentalsController.updateRental.bind(this._rentalsController));
        this.getRouter().delete('/:id', this.loginController.verifyToken, this._vesselController.verifyUser.bind(this._vesselController),
            this._vesselController.checkVesselOwner.bind(this._vesselController),
            this._rentalsController.deleteRental.bind(this._rentalsController));
        this.getRouter().get('/guest/:id', this._rentalsController.getRentalByIdGuest.bind(this._rentalsController));
        this.getRouter().get('/:id', this.loginController.verifyToken, this._vesselController.verifyUser.bind(this._vesselController), this._rentalsController.getRentalById.bind(this._rentalsController));
        }
}
