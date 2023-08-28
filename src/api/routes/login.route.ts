import {Router} from 'express';
import AbstractRoute from './abstractRoute.route';

export default class LoginRoute extends AbstractRoute {

    constructor() {
        super();
        // allows user to sign in
        this.getRouter().post('/signin', this.loginController.createToken.bind(this.loginController));
        // used to set the password for a user
        this.getRouter().post('/setpassword', this.loginController.savePassword.bind(this.loginController));
        // used to validate the token sent in the email for the frontend
        this.getRouter().get('/validatePasswordToken/:token', this.loginController.validateSetPasswordToken.bind(this.loginController));
        // used to login using biometric signatures
        this.getRouter().post('/biometricSignIn', this.loginController.verifyBiometricToken.bind(this.loginController), this.loginController.biometricLogin.bind(this.loginController));
    }
}
