import {Request, Response} from 'express';
import BaseController from "./base.controller";
import LiveNavigationDataModel from "../models/liveNavigationData.model";

export default class LiveNavigationController extends BaseController {
    private _liveNavigationDataModel = LiveNavigationDataModel.getInstance().getModel();

    constructor() {
        super(LiveNavigationDataModel.getInstance().getModel());
    }

    public async getNavigationDataByTripId(req: Request, res: Response) {
        const tripId = req.params.tripId;
        if (tripId) {
            try {
                const navigationData = await this._liveNavigationDataModel.find({tripId: tripId.toString()});
                return res.status(200).send(navigationData);
            } catch (err) {
                return res.status(500).send({ success: false, message: `There was an error adding the reports ${err}`});
            }
        } else {
            return res.status(400).send({success: false, message: "Trip Id not provided."});
        }
    }
    
    public async calculatingSpeedByLocation(req: Request, res: Response) {
        const {longitude, latitude} = req.body;
        const tripId = req.params.tripId;
        const resetCalculation = req.params.resetCalculation;
        if (longitude && latitude && typeof longitude === 'number' && typeof latitude === 'number' && res.locals.user.id && tripId) {
            try {
                const payload = {
                    tripId: tripId,
                    location: {
                        type: 'Point',
                        coordinates: [Number(longitude), Number(latitude)]
                    }
                }
                const previousLocation = await this._liveNavigationDataModel.findOne({tripId: tripId});

                if (previousLocation && !resetCalculation) {
                    // @ts-ignore
                    const previousLongitude = previousLocation?.location?.coordinates[0];
                    // @ts-ignore
                    const previousLatitude = previousLocation?.location?.coordinates[1];

                    console.log(previousLongitude, previousLatitude);
                    let distance = 0;
                    let speed = 0;
                    if (previousLatitude && previousLongitude) {
                        distance = this.calculateDistanceBetweenTwoPoints(previousLatitude, previousLongitude, Number(latitude), Number(longitude));

                        // calculate the speed in knots from kmph and distance
                        speed = (distance / (5/3600)) / 1.852;
                    }

                    await this._liveNavigationDataModel.findOneAndUpdate({tripId: tripId}, {location: payload.location});
                    return res.status(200).send({
                        distance: distance,
                        speed: speed
                    });
                } else {
                    await this._liveNavigationDataModel.findOneAndUpdate({tripId: tripId}, payload, {upsert: true});
                    return res.status(200).send({
                        speed: 0,
                        distance: 0,
                        currentLatitude: latitude,
                        currenLongitude: longitude
                    });
                }
            } catch (err) {
                return res.status(500).send({ success: false, message: `There was an error adding the reports ${err}`});
            }
        } else {
            return res.status(400).send({success: false, message: "Invalid Longitude , Latitude and/or description Provided."});
        }
    }

    /**
     * Get Distance between two lat/lng points using the Haversine function
     * @param {number} lat1 - The latitude of the first point
     * @param {number} lon1 - The longitude of the first point
     * @param {number} lat2 - The latitude of the second point
     * @param {number} lon2 - The latitude of the second point
     * @return {number} distance between the both points in Kilometers
     * */
    public calculateDistanceBetweenTwoPoints(lat1: number, lon1: number, lat2: number, lon2: number)
    {
        let R = 6372.8; // Earth Radius in Kilometers

        let dLat = this.Deg2Rad(lat2-lat1);
        let dLon = this.Deg2Rad(lon2-lon1);
        let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.Deg2Rad(lat1)) * Math.cos(this.Deg2Rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        // Return Distance in Kilometers
        return R * c;
    }

    /**
     * Convert Degrees to Radians
     * @param {number} deg - number in degrees
     * @return {number} - number converted to radian
     * */
    public Deg2Rad(deg: number) {
        return deg * Math.PI / 180;
    }
}
