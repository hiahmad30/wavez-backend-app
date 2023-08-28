import express, { Router } from 'express';
import IRoute from './Iroute.route';
import LoginController from '../controllers/login.controller';

export default abstract class AbstractRoute implements IRoute {

    protected router = express.Router();
    protected loginController:LoginController = new LoginController();

    getRouter(): Router {
        return this.router;
    }

}
