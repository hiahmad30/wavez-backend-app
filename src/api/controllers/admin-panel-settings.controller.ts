/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {Request, Response} from 'express';
import {Document} from 'mongoose';
import AvailabilityModel from '../models/availability.model';
import AdminAddListingModel from '../models/admin-add-listing.model';
// const azure = require('azure');
// const blobService = azure.createBlobService();
export default class AdminPanelSettingsController {
  // private static _JWT_SECRET: string;
  // private static _JWT_EXPIRES_IN: string;
  private _availabilityModel = AvailabilityModel.getInstance().getModel();
  private _adminAddListingModel = AdminAddListingModel.getInstance().getModel();

  constructor() {
    // if (!process.env.JWT_SECRET) throw "Error: JWT_SECRET not set";
    // VesselController._JWT_SECRET = process.env.JWT_SECRET;
    // if (!process.env.JWT_EXPIRES_IN) throw "Error: JWT_EXPIRES_IN not set";
    // VesselController._JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
  }

  public async updateAvailabilities(req: Request, res: Response): Promise<any> {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      try {
        const updatedAvailability =
          await this._availabilityModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
          );

        if (!updatedAvailability) {
          return res.status(404).send({
            success: false,
            message: 'Availability not found',
          });
        }

        return res.json(updatedAvailability);
      } catch (err) {
        return res.status(500).send(err);
      }
    } else {
      return res.status(404).send({
        success: false,
        message: 'Invalid Id',
      });
    }
  }

  public async addAvailabilities(req: Request, res: Response): Promise<any> {
    try {
      const newModel = new this._availabilityModel(req.body);
      const savedModel = await newModel.save();

      return res.json(savedModel);
    } catch (err) {
      return res.status(500).send(err);
    }
  }

  public async getAvailabilities(req: Request, res: Response): Promise<any> {
    await this._availabilityModel.find((err: any, model: Document) => {
      if (err) return res.status(500).send(err);
      return res.json(model);
    });
    return null;
  }

  public async getAvailabilityById(req: Request, res: Response): Promise<any> {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      await this._availabilityModel.findById(
        req.params.id,
        (err: any, model: any) => {
          if (err) return res.status(500).send(err);
          return res.send(model);
        }
      );
    } else {
      return res
        .status(404)
        .send({
          success: false,
          message: 'Invalid Id',
        })
        .end();
    }
    return;
  }

  public async deleteAvailabilityById(
    req: Request,
    res: Response
  ): Promise<any> {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      await this._availabilityModel.findByIdAndDelete(
        {
          _id: req.params.id,
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (err, model) => {
          if (err) return res.status(500).send(err);
          return res.json(model);
        }
      );
    } else {
      return res
        .status(404)
        .send({
          success: false,
          message: 'Invalid Id',
        })
        .end();
    }
    return null;
  }

  public async getAddListing(req: Request, res: Response): Promise<any> {
    await this._adminAddListingModel.find((err: any, model: Document) => {
      if (err) return res.status(500).send(err);
      return res.json(model);
    });
    return null;
  }

  public async addAddListing(req: Request, res: Response) {
    
    try {
      const newModel = new this._adminAddListingModel(req.body);
      const savedModel = await newModel.save();

      return res.json(savedModel);
    } catch (err) {
      return res.status(500).send(err);
    }
  }

  public async updateAddListing(req: Request, res: Response) {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      try {
        const updatedModel = await this._adminAddListingModel.findOneAndUpdate(
          { _id: req.params.id },
          req.body,
          { new: true }
        );

        if (!updatedModel) {
          return res.status(404).send({
            success: false,
            message: 'Invalid Id',
          });
        }

        return res.json(updatedModel);
      } catch (err) {
        return res.status(500).send(err);
      }
    } else {
      return res.status(404).send({
        success: false,
        message: 'Invalid Id',
      });
    }
  }
}
