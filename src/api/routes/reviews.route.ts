import AbstractRoute from "./abstractRoute.route";
import UploadController from "../controllers/upload.controller";
import ReviewsController from "../controllers/reviews.controller";

export default class ReviewsRoute extends AbstractRoute {
    private _reviewsController = new ReviewsController();
    private _uploadController = new UploadController();

    constructor() {
        super();
        this.getRouter().get('/featuredReviews', this._reviewsController.getFeaturedReviews.bind(this._reviewsController));
        this.getRouter().put('/updateReviewsSequence', this.loginController.verifyAllAdminToken, this._reviewsController.updateReviewSequence.bind(this._reviewsController));
        this.getRouter().get('/vesselReviews/:vesselId', this._reviewsController.getReviewsByVesselId.bind(this._reviewsController));
        this.getRouter().get('/list', this.loginController.verifyAllAdminToken, this._reviewsController.getAllReviews.bind(this._reviewsController));
        this.getRouter().get('/:id', this.loginController.verifyToken, this._reviewsController.getReview.bind(this._reviewsController));
        this.getRouter().post('/:vesselId', this.loginController.verifyToken, this._reviewsController.addReview.bind(this._reviewsController));
        // this.getRouter().put('/:id/:vesselId', this.loginController.verifyToken, this._reviewsController.updateReport.bind(this._reviewsController));
        this.getRouter().delete('/:id', this.loginController.verifyAllAdminToken, this._reviewsController.deleteReview.bind(this._reviewsController));
    }
}
