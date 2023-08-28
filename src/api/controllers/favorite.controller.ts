import BaseController from './base.controller';
import {Request, Response} from 'express';
import FavouriteModel from '../models/favourite.model';
import VesselCategoryModel from '../models/vessel-category.model';
import VesselFeatureModel from '../models/vessel-feature.model';
import UserModel from '../models/user.model';

export default class FavoriteController extends BaseController { 
    private static _JWT_SECRET: string;
    private static _JWT_EXPIRES_IN: string;
    private _favouriteModel = FavouriteModel.getInstance().getModel();
    private _vesselCategoryModel = VesselCategoryModel.getInstance().getModel();
    private _vesselFeatureModel = VesselFeatureModel.getInstance().getModel();
    private _userModel = UserModel.getInstance().getModel();

    constructor() {
        super(FavouriteModel.getInstance().getModel());
        if (!process.env.JWT_SECRET) throw "Error: JWT_SECRET not set";
        FavoriteController._JWT_SECRET = process.env.JWT_SECRET;
        if (!process.env.JWT_EXPIRES_IN) throw "Error: JWT_EXPIRES_IN not set";
        FavoriteController._JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
    }

    public addFavorite(req: Request, res: Response) {
        req.body.userId = res.locals.user.id;
        super.add(req, res);
    }

    public async updateFavorite(req: Request, res: Response) {
        try {
            const id = req.params.id
            if (id) {
                const data = await this._favouriteModel
                    .findByIdAndUpdate({
                            _id: id
                        },
                        req.body, {
                            new: true
                        }).lean().populate('favoriteRentals')
                    .populate('favoriteCharters')
                    .populate('favoriteStays')
                    .populate('shortListRentals')
                    .populate('shortListCharters')
                    .populate('shortListStays').select('-documentsIds')

                await this._vesselCategoryModel.populate(data, {
                    path: 'favoriteRentals.vesselCategory favoriteCharters.vesselCategory favoriteStays.vesselCategory shortListRentals.vesselCategory shortListCharters.vesselCategory shortListStays.vesselCategory',
                    select: 'name isVisible',
                });

                await this._userModel.populate(data, {
                    path: 'favoriteRentals.userId favoriteCharters.userId favoriteStays.userId shortListRentals.userId shortListCharters.userId shortListStays.userId',
                    select: 'firstName lastName',
                });

                await this._vesselFeatureModel.populate(data, {
                    path: 'favoriteRentals.vesselFeatures favoriteCharters.vesselFeatures favoriteStays.vesselFeatures shortListRentals.vesselFeatures shortListCharters.vesselFeatures shortListStays.vesselFeatures'
                });

                res.status(200).send(data)
            } else {
                res.status(500).send({success: false, message: 'Id is required'});
            }
        } catch (error) {
            res.status(500).send(error)
            console.log("Error: " + error);
        }
    }

    public async deleteFavorite(req: Request, res: Response) {
        super.delete(req, res);
    }

    public async getFavoritesByUserId(req: Request, res: Response) {
        try {
            const data = await this._favouriteModel.find({userId: res.locals.user.id})
                .lean().populate('favoriteRentals')
                .populate('favoriteCharters')
                .populate('favoriteStays')
                .populate('shortListRentals')
                .populate('shortListCharters')
                .populate('shortListStays').select('-documentsIds')

            await this._vesselCategoryModel.populate(data, {
                path: 'favoriteRentals.vesselCategory favoriteCharters.vesselCategory favoriteStays.vesselCategory shortListRentals.vesselCategory shortListCharters.vesselCategory shortListStays.vesselCategory',
                select: 'name isVisible',
            });

            await this._userModel.populate(data, {
                path: 'favoriteRentals.userId favoriteCharters.userId favoriteStays.userId shortListRentals.userId shortListCharters.userId shortListStays.userId',
                select: 'firstName lastName',
            });

            await this._vesselFeatureModel.populate(data, {
                path: 'favoriteRentals.vesselFeatures favoriteCharters.vesselFeatures favoriteStays.vesselFeatures shortListRentals.vesselFeatures shortListCharters.vesselFeatures shortListStays.vesselFeatures'
            });

            res.status(200).send(data)
        } catch (error) {
            res.status(500).send(error)
            console.log("Error: " + error);
        }
    }
}
