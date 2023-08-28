import AbstractRoute from './abstractRoute.route';
import NotificationsController from '../controllers/notifications.controller';

export default class NotificationsRoute extends AbstractRoute {
    private _notificationsController = new NotificationsController();

    constructor() {
        super();
        //Send Notification To All Users
        this.getRouter().post('/sendNotificationToAllUsers', this.loginController.verifyAllAdminToken, this._notificationsController.sendNotificationToAllUsers.bind(this._notificationsController))
        //Send Notification To call receiver
        this.getRouter().post('/sendNotificationToCallUser', this.loginController.verifyToken, this._notificationsController.sendNotificationToCallUser.bind(this._notificationsController))
        //Send Notification Renter for a twenty four hour notice
        this.getRouter().post('/sendNotificationTwentyFourTripUser', this.loginController.verifyAllAdminToken, this._notificationsController.sendNotificationTwentyFourTripUser.bind(this._notificationsController))
        //Post or Update Notifications
        this.getRouter().post('/:userId', this.loginController.verifyToken, this._notificationsController.createOrUpdateNotifications.bind(this._notificationsController))
        //Get Notifications
        this.getRouter().get('/:userId', this.loginController.verifyToken, this._notificationsController.findByUserIdNotifications.bind(this._notificationsController))
    }
}
