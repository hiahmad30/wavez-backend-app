import UserController from '../controllers/user.controller';
import AbstractRoute from "./abstractRoute.route";
import UploadController from "../controllers/upload.controller";
import EventController from "../controllers/event.controller";
import GooglePlacesController from '../controllers/google-places.controller';
import StripeController from "../controllers/stripe.controller";
import TripController from "../controllers/trip.controller";
export default class UserRoute extends AbstractRoute {
    private _userController = new UserController();
    private _uploadController = new UploadController();
    private _eventController = new EventController();
    private _googlePlacesController = new GooglePlacesController();
    private _stripeController = new StripeController();
    private _tripController = new TripController();

    constructor() {
        super();
        // change user password using a post request
        this.getRouter().post('/forgetPassword', this._userController.forgetPassword.bind(this._userController));
        // sign up a user using a post request
        this.getRouter().post('/signup', this._userController.signUp.bind(this._userController));
        // get the listings by the user
        this.getRouter().get('/getListings',this.loginController.verifyToken, this._userController.getUserListings.bind(this._userController));
        this.getRouter().get('/getListings/guest/:id', this._userController.getUserListingsGuest.bind(this._userController));

        this.getRouter().get('/getUserDetailsWEBRTC',this.loginController.verifyToken, this._userController.getUserDetailsWEBRTC.bind(this._userController));
        this.getRouter().get(
          '/customerId/:id',
          this.loginController.verifyToken,
          this._userController.getCustomerId.bind(this._userController)
        );
        // validates if a token is valid and returns user details
        this.getRouter().get('/getUserDetails',this.loginController.verifyToken, this._userController.getUserDetails.bind(this._userController));

        // updates the public key for the user model
        this.getRouter().put('/updateUserInfo',this.loginController.verifyToken,  this._googlePlacesController.checkLatLngForAddress.bind(this._googlePlacesController), this._userController.updateUserInfo.bind(this._userController));
        this.getRouter().put('/publicKey',this.loginController.verifyToken, this._userController.updateUserPublicKey.bind(this._userController));

        this.getRouter().post('/uploadImage', this.loginController.verifyToken, this._uploadController.uploadSingleUserImage.bind(this._uploadController));
        this.getRouter().put('/uploadImage', this.loginController.verifyToken, this._uploadController.uploadSingleUserImage.bind(this._uploadController));
        this.getRouter().delete('/deleteImage', this.loginController.verifyToken, this._uploadController.deleteUserImageFromBlob.bind(this._uploadController));

        //CRUD PSEUDO ADMIN
        this.getRouter().get('/pseudoAdmin',this.loginController.verifySuperAdminToken, this._userController.getAllPseudoAdmin.bind(this._userController));
        this.getRouter().post('/pseudoAdmin',this.loginController.verifySuperAdminToken, this._userController.createPseudoAdmin.bind(this._userController));
        this.getRouter().put('/pseudoAdmin/:id',this.loginController.verifySuperAdminToken, this._userController.updatePseudoAdmin.bind(this._userController));
        this.getRouter().delete('/pseudoAdmin/:id',this.loginController.verifySuperAdminToken, this._userController.deletePseudoAdmin.bind(this._userController));
        // get all users for admin
        this.getRouter().get('/list',this.loginController.verifyAllAdminToken, this._userController.getAllUsers.bind(this._userController));

        this.getRouter().get('/getAllUsersThatHasDocs',this.loginController.verifyAllAdminToken, this._userController.getAllUsersThatHasDocs.bind(this._userController));
        // send the user email from admin panel
        this.getRouter().post('/sendEmail',this.loginController.verifyAllAdminToken, this._uploadController.uploadAttachments.bind(this._uploadController), this._userController.sendUserEmailFromAdmin.bind(this._userController));
        // search users for admin panel email autocomplete
        this.getRouter().get('/emailSearch',this.loginController.verifyAllAdminToken, this._userController.searchUserEmails.bind(this._userController));
        // create a client secret for user to be used to save payment method
        this.getRouter().get('/createSavePaymentIntent',this.loginController.verifyToken, this._stripeController.createClientSecret.bind(this._stripeController));
        //Add Payment Method
      //    this.getRouter().post(
      //      '/create_payment_method',
      //      this._stripeController.createPaymentMethod.bind(
      //        this._stripeController
      //      )
      //    );
    

      // this.getRouter().post(
      //   '/confirmSetupIntent',
      //   this.loginController.verifyToken,
      //   this._stripeController.ConfirmSetupIntent.bind(this._stripeController)
      // );


        // get saved payment methods for an user
        this.getRouter().get('/savedPaymentMethods',this.loginController.verifyToken, this._stripeController.getSavedPaymentMethods.bind(this._stripeController));
        // delete payment method by Payment method Id
        this.getRouter().delete('/paymentMethod/:paymentMethodId',this.loginController.verifyToken, this._stripeController.deleteSavedPaymentMethod.bind(this._stripeController));
        // add new payout method
        this.getRouter().post('/AddNewPayoutMethod',this.loginController.verifyToken, this._stripeController.createStripeConnectOnBoardingLink.bind(this._stripeController));
        // upload Vessel License
        this.getRouter().post('/uploadVesselLicense',this.loginController.verifyToken, this._uploadController.uploadVesselLicense.bind(this._uploadController), this._userController.saveUploadedVesselLicense.bind(this._userController),
            this._uploadController.deleteLicenseDocuments.bind(this._uploadController));
        // get uploaded Vessel License
        this.getRouter().get('/vesselLicense',this.loginController.verifyToken, this._userController.getUploadedVesselLicense.bind(this._userController));
        // get the users saved payout methods
        this.getRouter().get('/getPayoutMethods',this.loginController.verifyToken, this._stripeController.getUserPayoutMethods.bind(this._stripeController));
        // check if user verified for payout
        this.getRouter().get('/checkPayoutVerificationStatus',this.loginController.verifyToken, this._stripeController.checkPayoutVerificationStatus.bind(this._stripeController));
        // generate stripe dashboard link for user
        this.getRouter().get('/generateStripeDashboardLink',this.loginController.verifyToken, this._stripeController.generateStripeDashboardLink.bind(this._stripeController));
        // change user status (disable/enable)
        this.getRouter().put('/changeUserStatus/:userId',this.loginController.verifyAllAdminToken, this._userController.updateUserStatus.bind(this._userController));
        // update user strikes
        this.getRouter().put('/updateUserStrikes/:userId',this.loginController.verifyAllAdminToken, this._userController.updateUserStrikes.bind(this._userController));
        // update user payment due
        this.getRouter().put('/updateUserPaymentDue/:userId',this.loginController.verifyAllAdminToken, this._userController.updatePaymentDue.bind(this._userController));
        // get user booking history
        this.getRouter().get('/history/:userId', this.loginController.verifyAllAdminToken, this._tripController.getUserTripsHistory.bind(this._tripController));
        // request User Account Deletion By User
        this.getRouter().put('/requestAccountDeletion', this.loginController.verifyToken, this._userController.checkUserTripsStatusForDelete.bind(this._userController), this._userController.requestUserAccountDeletionByUser.bind(this._userController));
        // request User Account Deletion By User
        this.getRouter().put('/requestUserAccountDeletion/:userId', this.loginController.verifyAllAdminToken, this._userController.checkUserTripsStatusForDelete.bind(this._userController), this._userController.requestUserAccountDeletionByAdmin.bind(this._userController));
        // revoke User Account Deletion By User
        this.getRouter().put('/revokeAccountDeletion/:userId', this.loginController.verifyToken, this._userController.revokeUserAccountDeletion.bind(this._userController));
        //check user trip status for deleting
        this.getRouter().get('/checkUserStatusForDeleting/:userId', this.loginController.verifyToken, this._userController.checkUserTripsStatusForDelete.bind(this._userController), this._userController.checkIfUserCanDeleteAccount.bind(this._userController));
        // get user by id for admin
        this.getRouter().get('/:userId',this.loginController.verifyAllAdminToken, this._userController.getUserById.bind(this._userController));
        // delete user by id for admin
        this.getRouter().delete('/:userId',this.loginController.verifyAllAdminToken, this._userController.deleteUserById.bind(this._userController));
    }
}
