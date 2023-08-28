import AbstractRoute from "./abstractRoute.route";
import AdminPanelSettingsController from '../controllers/admin-panel-settings.controller';

export default class AdminPanelSettingsRoute extends AbstractRoute {
    private _adminPanelSettingsController = new AdminPanelSettingsController();

    constructor() {
        super();
        this.getRouter().get('/availability', this._adminPanelSettingsController.getAvailabilities.bind(this._adminPanelSettingsController));
        this.getRouter().get('/availability/:id', this._adminPanelSettingsController.getAvailabilityById.bind(this._adminPanelSettingsController));
        this.getRouter().post('/availability', this._adminPanelSettingsController.addAvailabilities.bind(this._adminPanelSettingsController));
        this.getRouter().put('/availability/:id', this._adminPanelSettingsController.updateAvailabilities.bind(this._adminPanelSettingsController));
        this.getRouter().delete('/availability/:id', this._adminPanelSettingsController.deleteAvailabilityById.bind(this._adminPanelSettingsController));

        this.getRouter().get('/add-listing', this._adminPanelSettingsController.getAddListing.bind(this._adminPanelSettingsController));
        this.getRouter().post('/add-listing', this._adminPanelSettingsController.addAddListing.bind(this._adminPanelSettingsController));
        this.getRouter().put('/add-listing/:id', this._adminPanelSettingsController.updateAddListing.bind(this._adminPanelSettingsController));
    }
}
