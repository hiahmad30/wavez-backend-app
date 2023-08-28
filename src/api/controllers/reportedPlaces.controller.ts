import {Request, Response} from 'express';
import BaseController from "./base.controller";
import ReportedPlaceModel from "../models/reportedPlace.model";
import TravelDestinationModel from "../models/travelDestination.model";

export default class ReportedPlacesController extends BaseController {
    private _reportedPlaceModel = ReportedPlaceModel.getInstance().getModel();
    private _travelDestinationModel = TravelDestinationModel.getInstance().getModel();

    constructor() {
        super(ReportedPlaceModel.getInstance().getModel());
    }

    public async getReportedPlacesWithinProvidedDistance(req: Request, res: Response) {
        const {longitude, latitude} = req.query;
        if (longitude && latitude && typeof Number(longitude) === 'number' && typeof Number(latitude) === 'number') {
            try {
                const places = await this._reportedPlaceModel.aggregate([
                    {
                        $geoNear: {
                            near: { type: "Point", coordinates: [ Number(longitude) , Number(latitude) ] },
                            distanceField: "calculatedDistance",
                            maxDistance: 50000,
                            spherical: true
                        }
                    }
                ]);
                return res.status(200).send({ success: true, places: places});
            } catch(err) {
                return res.status(500).send({ success: false, message: `There was an error fetching the Report ${err}`});
            }
        } else {
            return res.status(400).send({success: false, message: "Invalid Longitude and/or Latitude Provided."});
        }
    }

    public async addNewPlace(req: Request, res: Response) {
        const {longitude, latitude, title, description} = req.body;
        if (longitude && latitude && typeof longitude === 'number' && typeof latitude === 'number' && description && description !== "" && res.locals.user.id) {
            try {
                let placeObj = {
                    description: description,
                    location: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    addedBy: res.locals.user.id
                };
                title && (placeObj = {...placeObj, ...{title: title}});
                const newPlace = new this._reportedPlaceModel(placeObj);
                const savedPlace = await newPlace.save();
                return res.status(200).send(savedPlace);
            } catch (err) {
                return res.status(500).send({ success: false, message: `There was an error adding the reports ${err}`});
            }
        } else {
            return res.status(400).send({success: false, message: "Invalid Longitude , Latitude and/or description Provided."});
        }
    }

    public async getTravelDestinationsWithinProvidedDistance(req: Request, res: Response) {
        const {longitude, latitude} = req.query;
        if (longitude && latitude && typeof Number(longitude) === 'number' && typeof Number(latitude) === 'number') {
            try {
                const places = await this._travelDestinationModel.aggregate([
                    {
                        $geoNear: {
                            near: { type: "Point", coordinates: [ Number(longitude) , Number(latitude) ] },
                            distanceField: "calculatedDistance",
                            maxDistance: 50000,
                            spherical: true
                        }
                    }
                ]);
                return res.status(200).send({ success: true, travelDestinations: places});
            } catch(err) {
                return res.status(500).send({ success: false, message: `There was an error fetching the Report ${err}`});
            }
        } else {
            return res.status(400).send({success: false, message: "Invalid Longitude and/or Latitude Provided."});
        }
    }

    public async addNewTravelDestination(req: Request, res: Response) {
        const {longitude, latitude, title, description} = req.body;
        if (longitude && latitude && typeof longitude === 'number' && typeof latitude === 'number' && description && description !== "") {
            try {
                let placeObj = {
                    description: description,
                    location: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    }
                };
                title && (placeObj = {...placeObj, ...{title: title}});
                const newPlace = new this._travelDestinationModel(placeObj);
                const savedTravelDestination = await newPlace.save();
                return res.status(200).send(savedTravelDestination);
            } catch (err) {
                return res.status(500).send({ success: false, message: `There was an error adding the reports ${err}`});
            }
        } else {
            return res.status(400).send({success: false, message: "Invalid Longitude , Latitude and/or description Provided."});
        }
    }
}
