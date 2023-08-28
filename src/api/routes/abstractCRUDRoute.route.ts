import { IBaseController } from '../controllers/Ibase.controller';
import AbstractRoute from './abstractRoute.route';

export default abstract class AbstractCRUDRoute extends AbstractRoute {
    protected controller: IBaseController;

    constructor(controller: IBaseController) {
        super();
        this.controller = controller;
        this.router.get('/:id?', this.loginController.verifyToken, controller.list.bind(controller));
        this.router.post('/', this.loginController.verifyToken, controller.add.bind(controller));
        this.router.put('/:id', this.loginController.verifyToken, controller.update.bind(controller));
        this.router.delete('/:id', this.loginController.verifyToken, controller.delete.bind(controller));
    }
}
