import AbstractRoute from "./abstractRoute.route";
import FaqController from "../controllers/faq.controller";

export default class FaqRoute extends AbstractRoute {
    private _faqController = new FaqController();

    constructor() {
        super();
        this.getRouter().get('/:id?', this._faqController.getFaqs.bind(this._faqController));
        this.getRouter().post('', this.loginController.verifyAllAdminToken, this._faqController.addFaq.bind(this._faqController));
        this.getRouter().put('/:id', this.loginController.verifyAllAdminToken, this._faqController.updateFaq.bind(this._faqController));
        this.getRouter().delete('/:id', this.loginController.verifyAllAdminToken, this._faqController.deleteFaq.bind(this._faqController));
    }
}
