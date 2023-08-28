import BaseController from './base.controller';
import {Request, Response} from 'express';
import VesselModel from "../models/vessel.model";
import UserModel from "../models/user.model";

export default class StaysController extends BaseController {
    private static _JWT_SECRET: string;
    private static _JWT_EXPIRES_IN: string;
    private _vesselModel = VesselModel.getInstance().getModel();
    private _userModel = UserModel.getInstance().getModel();

    constructor() {
        super(VesselModel.getInstance().getModel());
        if (!process.env.JWT_SECRET) throw "Error: JWT_SECRET not set";
        StaysController._JWT_SECRET = process.env.JWT_SECRET;
        if (!process.env.JWT_EXPIRES_IN) throw "Error: JWT_EXPIRES_IN not set";
        StaysController._JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
    }

    public getStays(req: Request, res: Response) {
        res.locals.vesselType = 'STAY';
        super.list(req, res);
    }

    public async addStay(req: Request, res: Response) {
        req.body.userId = res.locals.user.id;
        req.body.description = '';
        req.body.vesselType = 'STAY';
        super.add(req, res);
        if (res.locals.listings === 0) {
            try {
                await this._userModel.findByIdAndUpdate(res.locals.user.id, {isVesselOwner: true});
            } catch (err) {
                console.log(err);
            }
        }
    }

    public async updateStay(req: Request, res: Response) {
        req.body.vesselType = 'STAY';
        super.update(req, res);
    }

    public async deleteStay(req: Request, res: Response) {
        super.delete(req, res);
        if (res.locals.listings === 1) {
            try {
                await this._userModel.findByIdAndUpdate(res.locals.user.id, {isVesselOwner: false});
            } catch (err) {
                console.log(err);
            }
        }
    }

    public async getStayById(req: Request, res: Response) {
        try {
            const data = await this._vesselModel.findOne({_id: req.params.id, vesselType: 'STAY'})
                .populate('vesselCategory')

            res.status(200).send(data)
        } catch (error) {
            res.status(500).send(error)
            console.log("Error: " + error);
        }
    }

    public async getStayByIdGuest(req: Request, res: Response) {
        try {
            const data = await this._vesselModel.findOne({_id: req.params.id, vesselType: 'STAY'})
                .lean().populate('vesselCategory', 'name')
                .populate('userId', 'firstName lastName profileImageUrl').select('-documentsIds')
                .populate('vesselFeatures')

            res.status(200).send(data)
        } catch (error) {
            res.status(500).send(error)
            console.log("Error: " + error);
        }
    }
}
