import axios from 'axios';
import {NextFunction, Request, Response} from "express";

export default class GooglePlacesController {
  private static _GOOGLE_PLACES_BASE_URL: string;
  private static _GOOGLE_PLACES_API_KEY: string;

  constructor() {
    if (!process.env.GOOGLE_PLACES_BASE_URL)
      throw 'Error: GOOGLE_PLACES_BASE_URL not set';
    GooglePlacesController._GOOGLE_PLACES_BASE_URL =
      process.env.GOOGLE_PLACES_BASE_URL;
    if (!process.env.GOOGLE_PLACES_API_KEY)
      throw 'Error: GOOGLE_PLACES_API_KEY not set';
    GooglePlacesController._GOOGLE_PLACES_API_KEY =
      process.env.GOOGLE_PLACES_API_KEY;
  }

  /**
   * Async function to get the latitude and longitude for the
   * given address string by calling the google places api
   * @param {string} searchQuery - The address string to pass to the google api
   * @return {Object} Data containing the latitude and longitude for the provided address string
   * */
  public async getAddressByCity(searchQuery: string) {
    try {
      const { data } = await axios.get(
        `${process.env.GOOGLE_PLACES_BASE_URL}/findplacefromtext/json?input=${searchQuery}&inputtype=textquery&fields=formatted_address,geometry&key=${process.env.GOOGLE_PLACES_API_KEY}`
      );
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Middleware to populate latitude and longitude of a given vessel from the raw Address
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * @param {NextFunction} next - Express Next function for calling the next middleware
   * */
  public async checkLatLngForAddress(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    if (req.body.rawAddress) {
      try {
        // if the vessel type is charter then check the destination addresses too
        if (req.body.vesselType && req.body.vesselType === 'CHARTER') {
          if (
            req.body.destinationAddress &&
            req.body.destinationAddress.length !== 0
          ) {
            for (let i = 0; i < req.body.destinationAddress.length; i++) {
              if (req.body.destinationAddress[i].rawAddress) {
                const destinationGeoLocation = await this.getAddressByCity(
                  req.body.destinationAddress[i].rawAddress
                );
                if (
                  destinationGeoLocation?.status === 'OK' &&
                  destinationGeoLocation.candidates.length !== 0
                ) {
                  req.body.destinationLocation[i].longitude =
                    destinationGeoLocation.candidates[0].geometry.location.lng;
                  req.body.destinationLocation[i].latitude =
                    destinationGeoLocation.candidates[0].geometry.location.lat;
                } else {
                  return res
                    .status(500)
                    .send({
                      success: false,
                      message: 'Address geometry not found.',
                    })
                    .end();
                }
              } else {
                return res
                  .status(400)
                  .send({
                    success: false,
                    message: 'Raw Address Not provided for some destinations.',
                  })
                  .end();
              }
            }
          }
        }

        const geoLocation = await this.getAddressByCity(req.body.rawAddress);
        if (
          geoLocation?.status === 'OK' &&
          geoLocation.candidates.length !== 0
        ) {
          if (req.body.vesselLocation) {
            req.body.vesselLocation.longitude =
              geoLocation.candidates[0].geometry.location.lng;
            req.body.vesselLocation.latitude =
              geoLocation.candidates[0].geometry.location.lat;
          }
          next();
        } else {
          res
            .status(500)
            .send({ success: false, message: 'Address geometry not found.' });
        }
      } catch (err) {
        res.status(500).send({ success: false, message: err });
      }
    } else {
      next();
    }
    return null
  }

  /**
   * Get Distance between two lat/lng points using the Haversine function
   * @param {number} lat1 - The latitude of the first point
   * @param {number} lon1 - The longitude of the first point
   * @param {number} lat2 - The latitude of the second point
   * @param {number} lon2 - The latitude of the second point
   * @return {number} distance between the both points in Kilometers
   * */
  public calculateDistanceBetweenTwoPoints(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    let R = 6372.8; // Earth Radius in Kilometers

    let dLat = this.Deg2Rad(lat2 - lat1);
    let dLon = this.Deg2Rad(lon2 - lon1);
    let a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.Deg2Rad(lat1)) *
        Math.cos(this.Deg2Rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Return Distance in Kilometers
    return R * c;
  }

  /**
   * Convert Degrees to Radians
   * @param {number} deg - number in degrees
   * @return {number} - number converted to radian
   * */
  public Deg2Rad(deg: number) {
    return (deg * Math.PI) / 180;
  }
}
