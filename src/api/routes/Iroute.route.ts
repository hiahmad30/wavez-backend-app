import { Router } from 'express';

export default interface IRoute {
    getRouter(): Router;
}
