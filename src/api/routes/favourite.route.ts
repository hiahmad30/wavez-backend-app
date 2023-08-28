import AbstractRoute from './abstractRoute.route';
import VesselController from '../controllers/vessel.controller';
import FavoriteController from '../controllers/favorite.controller';

export default class FavouriteRoute extends AbstractRoute {
    private _favoriteController = new FavoriteController();
    private _vesselController = new VesselController();

    constructor() {
        super();
        this.getRouter().post('', this.loginController.verifyToken, this._favoriteController.addFavorite.bind(this._favoriteController));
        this.getRouter().get('', this.loginController.verifyToken, this._favoriteController.getFavoritesByUserId.bind(this._favoriteController));
        this.getRouter().put('/:id', this.loginController.verifyToken, this._favoriteController.updateFavorite.bind(this._favoriteController));
        this.getRouter().delete('/:id', this.loginController.verifyToken, this._favoriteController.deleteFavorite.bind(this._favoriteController));
    }
}
