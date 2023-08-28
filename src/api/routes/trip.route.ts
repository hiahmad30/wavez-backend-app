import AbstractRoute from './abstractRoute.route';
import TripController from '../controllers/trip.controller';
import EventController from "../controllers/event.controller";
import StripeController from "../controllers/stripe.controller";

export default class TripRoute extends AbstractRoute {
    private _tripController = new TripController();
    private _eventController = new EventController();
    private _stripeController = new StripeController();

    constructor() {
        super();
        //Get Canceled Trips for Admin
        this.getRouter().get('/canceledTripsAdmin', this.loginController.verifyAllAdminToken, this._tripController.getCancelledTripsAdmin.bind(this._tripController));

        //checks if trip can be started by comparing with the server time
        this.getRouter().get('/checkTripStartValidity/:tripId', this._tripController.checkTripStartValidity.bind(this._tripController));

        //Get Trips by status for renter
        this.getRouter().get('/getTripsByStatusRenter/:status', this.loginController.verifyToken, this._tripController.getTripsByStatusRenter.bind(this._tripController));

        //Get Trips by status for Vessel Owner
        this.getRouter().get('/getTripsByStatusOwner/:status', this.loginController.verifyToken, this._tripController.getTripsByStatusVesselOwner.bind(this._tripController));

        // check user's verification status when reserve button pressed
        this.getRouter().get('/checkUserVerificationStatusForReserving/:vesselId',this.loginController.verifyToken, this._tripController.checkUserVerificationStatusForReserving.bind(this._tripController));

        this.getRouter().get('/checkIfVesselHasPendingTrips/:vesselId', this.loginController.verifyToken, this._tripController.checkTripStatusOfVesselUnpublished.bind(this._tripController));

        //Get a trip by Id
        this.getRouter().get('/:id', this.loginController.verifyToken, this._tripController.getTrip.bind(this._tripController));

        this.getRouter().put('/resolveCanceledTripsAdmin/:id', this.loginController.verifyAllAdminToken, this._tripController.resolveTripAdmin.bind(this._tripController));

        //Cancel trip by either vessel owner or renter
        this.getRouter().put('/cancel', this.loginController.verifyToken, this._tripController.cancelTrip.bind(this._tripController),
            this._stripeController.issueRefundOnCancellation.bind(this._stripeController), this._tripController.updateAfterRefund.bind(this._tripController));

        //Accept Offer by vessel owner
        this.getRouter().put('/acceptOffer', this.loginController.verifyToken, this._tripController.acceptOfferTrip.bind(this._tripController),
            this._stripeController.chargeRenterAfterOfferAccepted.bind(this._stripeController),
            this._tripController.updateTripAfterAcceptPayment.bind(this._tripController));

            //Accept Offer by vessel owner
        this.getRouter().put('/rejectOffer', this.loginController.verifyToken, this._tripController.rejectOfferTrip.bind(this._tripController));

        //Start Trip
        this.getRouter().put('/start', this.loginController.verifyToken, this._stripeController.placeStartTripSecurityDepositHoldAndChargeUser.bind(this._stripeController), this._tripController.startTrip.bind(this._tripController));

        //End Trip
        this.getRouter().put('/end', this.loginController.verifyToken,
            // this._stripeController.cancelSecurityDepositHoldOnEndTrip.bind(this._stripeController),
            this._tripController.endTrip.bind(this._tripController));

        //Create Trip
        this.getRouter().post('/book', this.loginController.verifyToken,
            this._eventController.resetSecondsAndMilliseconds.bind(this._eventController),
            this._eventController.checkVesselAvailability.bind(this._eventController),
            this._tripController.checkUserVerificationStatusForBooking.bind(this._tripController),
            this._stripeController.checkPaymentMethodAndOwnerStatusForBooking.bind(this._stripeController),
            this._tripController.createTripOffer.bind(this._tripController));

        //Create Trip
        this.getRouter().post('/tempBooking', this.loginController.verifyToken,
            this._tripController.createTempBooking.bind(this._tripController));

    }
}
