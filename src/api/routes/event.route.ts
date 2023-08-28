import AbstractRoute from "./abstractRoute.route";
import EventController from "../controllers/event.controller";
import VesselController from "../controllers/vessel.controller";
import StripeController from "../controllers/stripe.controller";

export default class EventRoute extends AbstractRoute {

    private _eventController = new EventController();
    private _vesselController = new VesselController();
    private _stripeController = new StripeController();

    constructor() {
        super();
        // get events with the provided parameters
        this.getRouter().post("/search", this.loginController.verifyToken, this._eventController.resetSecondsAndMilliseconds.bind(this._eventController),
            this._eventController.searchVesselEvents.bind(this._eventController));
        // blocks the timeslot provided for a specific vessel
        this.getRouter().post("/blockTimeslot/:vesselId", this.loginController.verifyToken, this._eventController.resetSecondsAndMilliseconds.bind(this._eventController),
            this._eventController.blockTimeslotForVessel.bind(this._eventController));
        // updates the blocked timeslot provided for a specific vessel
        this.getRouter().put("/blockTimeslot/:eventId", this.loginController.verifyToken, this._eventController.resetSecondsAndMilliseconds.bind(this._eventController),
            this._eventController.updateBlockedTimeslotById.bind(this._eventController));
        // updates the blocked timeslot provided for a specific vessel
        this.getRouter().delete("/blockTimeslot/:eventId", this.loginController.verifyToken, this._eventController.deleteBlockedTimeslotById.bind(this._eventController));
        // unblocks a blocked timeslot
        this.getRouter().put("/unblockTimeslot/:vesselId", this.loginController.verifyToken, this._eventController.resetSecondsAndMilliseconds.bind(this._eventController),
            this._eventController.unBlockTimeslotsForVessel.bind(this._eventController));

        //Check availability for vessels
        this.getRouter().post("/checkAvailability", this._eventController.resetSecondsAndMilliseconds.bind(this._eventController),
            this._eventController.checkVesselAvailability.bind(this._eventController), this._eventController.getCheckAvailabilityResult.bind(this._eventController));

        this.getRouter().post("/calculateBookingInfo", this._eventController.resetSecondsAndMilliseconds.bind(this._eventController),
            this._eventController.checkVesselAvailability.bind(this._eventController), this._stripeController.calculateBookingTaxRate.bind(this._stripeController));

        //Book a vessel
        this.getRouter().post("/bookVessel", this.loginController.verifyToken, this._eventController.resetSecondsAndMilliseconds.bind(this._eventController),
            this._eventController.bookVessel.bind(this._eventController));
    }

}
