/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import RentalsModel from '../models/rentals.model';
import {NextFunction, Request, Response} from 'express';
import {Document, Model,  Types} from 'mongoose';
import StaysModel from '../models/stays.model';
import ChartersModel from '../models/charters.model';
import VesselCategoryModel from '../models/vessel-category.model';
import VesselFeatureModel from '../models/vessel-feature.model';
import GooglePlacesController from "./google-places.controller";
import DocumentsModel from '../models/documents.model';
import VesselFuelModel from '../models/vessel-fuel.model';
import VesselModel from "../models/vessel.model";
import UserModel from "../models/user.model";
import TripModel from "../models/trip.model";

import { BlobServiceClient } from '@azure/storage-blob';
import { v1 as uuidv1 } from 'uuid';
// const azure = require('azure');
// const blobService = azure.createBlobService();
export default class VesselController {
  // private static _JWT_SECRET: string;
  // private static _JWT_EXPIRES_IN: string;
  private _rentalsModel = RentalsModel.getInstance().getModel();
  private _staysModel = StaysModel.getInstance().getModel();
  private _chartersModel = ChartersModel.getInstance().getModel();
  private _vesselCategoryModel = VesselCategoryModel.getInstance().getModel();
  private _vesselFeatureModel = VesselFeatureModel.getInstance().getModel();
  private _vesselFuelModel = VesselFuelModel.getInstance().getModel();
  private _documentsModel = DocumentsModel.getInstance().getModel();
  private googlePlacesController = new GooglePlacesController();
  private _userModel = UserModel.getInstance().getModel();
  private _vesselModel = VesselModel.getInstance().getModel();
  private _tripModel = TripModel.getInstance().getModel();

  constructor() {
    // if (!process.env.JWT_SECRET) throw "Error: JWT_SECRET not set";
    // VesselController._JWT_SECRET = process.env.JWT_SECRET;
    // if (!process.env.JWT_EXPIRES_IN) throw "Error: JWT_EXPIRES_IN not set";
    // VesselController._JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
  }

  public async addVesselCategory(req: Request, res: Response): Promise<void> {
    const newModel = new this._vesselCategoryModel(req.body);
    await newModel
      .save()
      .then((model: Document) => {
        return res.status(200).send(model);
      })
      .catch((err: any) => {
        return res.status(500).send(err);
      });
  }

  public async updateVesselCategory(
    req: Request,
    res: Response
  ): Promise<void> {
    const id = req.params.categoryId;
    if (id) {
      try {
        const category = await this._vesselCategoryModel.findById(id);

        if (category) {
          if (req.body.stay) {
            // @ts-ignore
            req.body.stay = category.stay
              ? // @ts-ignore
                { ...category.stay, ...req.body.stay }
              : req.body.stay;
          }
          if (req.body.rental) {
            // @ts-ignore
            req.body.rental = category.rental
              ? // @ts-ignore
                { ...category.rental, ...req.body.rental }
              : req.body.rental;
          }
          if (req.body.charter) {
            // @ts-ignore
            req.body.charter = category.charter
              ? // @ts-ignore
                { ...category.charter, ...req.body.charter }
              : req.body.charter;
          }
          this._vesselCategoryModel
            .findByIdAndUpdate(
              {
                _id: id,
              },
              req.body,
              {
                new: true,
              }
            )
            .then((model) => {
              return res.status(200).send(model);
            })
            .catch((err) => {
              return res.status(500).send(err);
            });
        } else {
          res.status(500).send({
            success: false,
            message: 'Category with provided Id not found',
          });
        }
      } catch (error) {
        res.status(500).send({
          success: false,
          message: `There was an error updating the category ${error}`,
        });
      }
    } else {
      res.status(500).send({ success: false, message: 'Id is required' });
    }
  }

  public async deleteVesselCategory(
    req: Request,
    res: Response
  ): Promise<void> {
    const id = req.params.categoryId;
    if (id) {
      this._vesselCategoryModel
        .findByIdAndUpdate(
          {
            _id: id,
          },
          { status: 'SOFT_DELETE' },
          {
            new: true,
          }
          // @ts-ignore
        )
        .then((model) => {
          return res.status(200).send(model);
        })
        .catch((err) => {
          return res.status(500).send(err);
        });
    } else {
      res.status(500).send({ success: false, message: 'Id is required' });
    }
  }

  public async getVesselCategory(req: Request, res: Response) {
    await this._vesselCategoryModel.find((err: any, model: any) => {
      if (err) return res.status(500).send(err);
      return res.json(model);
    });
  }

  public async addVesselFuel(req: Request, res: Response): Promise<void> {
    const newModel = new this._vesselFuelModel(req.body);
    await newModel
      .save()
      .then((model: Document) => {
        return res.status(200).send(model);
      })
      .catch((err: any) => {
        return res.status(500).send(err);
      });
  }

  public async updateVesselFuel(req: Request, res: Response): Promise<void> {
    const id = req.params.fuelId;
    if (id) {
      this._vesselFuelModel
        .findByIdAndUpdate(
          {
            _id: id,
          },
          req.body,
          {
            new: true,
          }
        )
        .then((model) => {
          return res.status(200).send(model);
        })
        .catch((err: any) => {
          return res.status(500).send(err);
        });
    } else {
      res.status(500).send({ success: false, message: 'Id is required' });
    }
  }

  public async deleteVesselFuel(req: Request, res: Response): Promise<void> {
    const id = req.params.fuelId;
    if (id) {
      this._vesselFuelModel
        .findByIdAndUpdate(
          {
            _id: id,
          },
          { status: 'SOFT_DELETE' },
          {
            new: true,
          }
        )
        .then((model) => {
          return res.status(200).send(model);
        })
        .catch((err) => {
          return res.status(500).send(err);
        });
    } else {
      res.status(500).send({ success: false, message: 'Id is required' });
    }
  }

  public async getVesselFuel(req: Request, res: Response) {
    await this._vesselFuelModel.find((err: any, model: any) => {
      if (err) return res.status(500).send(err);
      return res.json(model);
    });
  }

  public async addVesselFeature(req: Request, res: Response): Promise<void> {
    const newModel = new this._vesselFeatureModel(req.body);
    await newModel.save();
  }

  public async getVesselFeature(_req: Request, res: Response) {
    await this._vesselFeatureModel.find((err: any, model: Document) => {
      if (err) return res.status(500).send(err);
      return res.json(model);
    });
  }

  public async updateVesselFeature(req: Request, res: Response): Promise<void> {
    const id = req.params.featureId;
    if (id) {
      this._vesselFeatureModel
        .findByIdAndUpdate(
          {
            _id: id,
          },
          req.body,
          {
            new: true,
          }
        )
        .then((model) => {
          return res.status(200).send(model);
        })
        .catch((err: any) => {
          return res.status(500).send(TypeError);
        });
    } else {
      res.status(500).send({ success: false, message: 'Id is required' });
    }
  }

  public async deleteVesselFeature(req: Request, res: Response): Promise<void> {
    const id = req.params.featureId;
    if (id) {
      this._vesselFeatureModel.findByIdAndUpdate(
        {
          _id: id,
        },
        { status: 'SOFT_DELETE' },
        {
          new: true,
        },
        // @ts-ignore
        (err, model) => {
          if (err) return res.status(500).send(err);
          return res.json(model);
        }
      );
    } else {
      res.status(500).send({ success: false, message: 'Id is required' });
    }
  }

  public async checkUploadParameters(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const vesselId = req.params.vesselId;

    if (vesselId && vesselId.match(/^[0-9a-fA-F]{24}$/)) {
      const vessel = await this._vesselModel.findById(vesselId);
      if (vessel) {
        console.log(vessel);
        // check if only the vessel's owner (user Id) is uploading the image
        // @ts-ignore
        if (vessel.userId.toString() === res.locals.user.id) {
          // @ts-ignore
          res.locals.vesselImages = this.sortImagesBySequence(vessel.images);
          // @ts-ignore
          res.locals.documentsIds = vessel.documentsIds;
          // @ts-ignore
          req.vesselType = vessel.vesselType;
          next();
        } else {
          return res
            .status(401)
            .send({ success: false, message: 'User does not own the vessel.' })
            .end();
        }
      } else {
        return res
          .status(404)
          .send({
            success: false,
            message: 'Vessel with the provided Id was not found',
          })
          .end();
      }
    } else {
      return res.status(400).send({
        success: false,
        message: 'Vessel Id and/or Vessel Type not provided',
      });
    }
    return null;
  }

  public async updateModelWithVesselImage(
    req: Request,
    res: Response
  ): Promise<any> {
    if (req.file) {
      // getting the image url without the expiry time from multer
      // @ts-ignore
      const imageUrl = req.file.url.split('?se')[0];

      const imagesArray = res.locals.vesselImages;

      imagesArray.push({
        imageURL: imageUrl,
        caption: req.body.caption,
        sequence: imagesArray.length + 1,
      });

      this._vesselModel
        .findByIdAndUpdate(
          req.params.vesselId,
          { images: imagesArray },
          { new: true }
        )
        .then((model) => {
          return res.status(200).send(model);
        })
        .catch((err) => {
          return res.status(500).send(err);
        });
    } else {
      return res.status(500).send(req.file).end();
    }
    return null;
  }

  public async updateModelWithVesselImages(req: Request, res: Response) {
    if (req.files) {
      // getting the image url without the expiry time from multer
      // @ts-ignore
      const images: any[] = req.files;

      const imagesArray = res.locals.vesselImages;
      let captions: string[] = [];

      // making the new captions array by splitting them from commas
      if (req.body.captions) {
        captions = req.body.captions.split(',');
      }

      images.forEach((image, index) => {
        imagesArray.push({
          imageURL: image.url.split('?se')[0],
          caption: captions[index] ? captions[index] : '',
          sequence: imagesArray.length + 1,
        });
      });

      try {
        const updatedModel = await this._vesselModel.findByIdAndUpdate(
          req.params.vesselId,
          { images: imagesArray },
          { new: true }
        );

        return res.status(200).send(updatedModel).end();
      } catch (err) {
        return res.status(500).send({ success: false, message: err }).end();
      }
    } else {
      return res.status(500).send(req.file).end();
    }
  }

  private getVesselModelByType(vesselType: string) {
    switch (vesselType) {
      case 'RENTAL': {
        return this._rentalsModel;
      }
      case 'STAY': {
        return this._staysModel;
      }
      case 'CHARTER': {
        return this._chartersModel;
      }
      default: {
        return null;
      }
    }
  }

  public verifyUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const id = req.params.id ? req.params.id : req.params.vesselId;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      try {
        const docs = await this._vesselModel.findById(id);
        if (
          docs &&
          docs.get('userId') &&
          docs.get('userId').toString() === res.locals.user.id
        ) {
          next();
        } else {
          res.status(404).send({
            success: false,
            message: 'Vessel Was Not Found',
          });
        }
      } catch (error) {
        res.status(401).send({
          success: false,
          message:
            'User Does Not Match Either Because The Vessel Does Not Exist Or The Provided Id Is Invalid',
        });
      }
    } else {
      res.status(404).send({
        success: false,
        message: 'Invalid Vessel Id',
      });
    }
    return null;
  };

  public async updateModelWithDocumentsFile(
    req: Request,
    res: Response
  ): Promise<any> {
    if (req.file) {
      // getting the image url without the expiry time from multer
      // @ts-ignore
      const fileUrl = req.file.url.split('?se')[0];

      const documentsArr = res.locals.documentsIds;
      const newModel = new this._documentsModel({
        fileURL: fileUrl,
        fileType: req.body.fileType,
        originalFileName: req.file.originalname,
      });
      // @ts-ignore
      newModel.save((err, mod: Document) => {
        if (err) return res.status(500).send(err);
        // @ts-ignore
        documentsArr.push(mod._doc._id);
        console.log('-> documentsArr', documentsArr);
        this._vesselModel
          .findByIdAndUpdate(
            req.params.vesselId,
            { documentsIds: documentsArr },
            { new: true }
          )
          .then((model) => {
            return res.status(200).send(model);
          })
          .catch((err) => {
            return res.status(500).send(err);
          });
      });
    } else {
      return res.status(500).send(req.file).end();
    }
    return null;
  }

  public async deleteVesselFileById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const documentId = req.params.documentId;

    if (documentId) {
      const vessel = await this._vesselModel.findOne({
        documentsIds: documentId,
      });
      const file = await this._documentsModel.findById(documentId);
      if (vessel) {
        console.log(vessel);
        // check if only the vessel's owner (user Id) is uploading the document
        // @ts-ignore
        if (vessel.userId.toString() === res.locals.user.id) {
          const vesselObj: any = vessel.toObject();
          res.locals.vesselDocument = file;
          res.locals.vesselId = vesselObj._id;
          const index = vesselObj.documentsIds.findIndex(
            (ele: string) => ele.toString() === documentId.toString()
          );
          if (index !== -1) {
            const copiedFilesIdsArray = JSON.parse(
              JSON.stringify(vesselObj.documentsIds)
            );
            copiedFilesIdsArray.splice(index, 1);
            res.locals.vesseldocumentsIds = copiedFilesIdsArray;
          }
          next();
        } else {
          return res
            .status(401)
            .send({ success: false, message: 'User does not own the vessel.' })
            .end();
        }
      } else {
        return res
          .status(404)
          .send({
            success: false,
            message: 'Vessel was not found for the provided File.',
          })
          .end();
      }
    } else {
      return res.status(400).send({
        success: false,
        message: 'Document Id and/or Vessel Type not provided',
      });
    }
    return null;
  }

  public async deleteFileObject(req: Request, res: Response) {
    const vesselId = res.locals.vesselId;
    const vesselDocumentsIds = res.locals.vesseldocumentsIds;
    try {
      await this._documentsModel.findByIdAndDelete({
        _id: req.params.documentId,
      });
      await this._vesselModel.findByIdAndUpdate(
        vesselId,
        { documentsIds: vesselDocumentsIds },
        { new: true }
      );
      return res
        .status(200)
        .send({ success: true, message: 'Document is deleted' });
    } catch (err) {
      return res.status(500).send({ success: false, message: err });
    }
  }

  public async deleteVesselImageById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const imageId = req.params.imageId;

    if (imageId) {
      const vessel = await this._vesselModel.findOne({ 'images._id': imageId });
      if (vessel) {
        console.log(vessel);
        // check if only the vessel's owner (user Id) is uploading the image
        // @ts-ignore
        if (vessel.userId.toString() === res.locals.user.id) {
          const vesselObj: any = vessel.toObject();
          res.locals.vesselId = vesselObj._id;
          const sortedImageArray = this.sortImagesBySequence(vesselObj.images);
          const index = sortedImageArray.findIndex(
            (img: any) => img._id.toString() === imageId
          );
          if (index !== -1) {
            res.locals.vesselImage = vesselObj.images[index];
            const copiedImagesArray = JSON.parse(
              JSON.stringify(vesselObj.images)
            );
            copiedImagesArray.splice(index, 1);
            res.locals.vesselImages = copiedImagesArray;
            next();
          }
        } else {
          return res
            .status(401)
            .send({ success: false, message: 'User does not own the vessel.' })
            .end();
        }
      } else {
        return res
          .status(404)
          .send({
            success: false,
            message: 'Vessel was not found for the provided Image.',
          })
          .end();
      }
    } else {
      return res.status(400).send({
        success: false,
        message: 'Image Id and/or Vessel Type not provided',
      });
    }
    return null;
  }

  public async deleteImageObject(req: Request, res: Response) {
    const vesselId = res.locals.vesselId;
    const imagesArray = res.locals.vesselImages;
    imagesArray.forEach((image: any, index: number) => {
      image.sequence = index + 1;
    });

    try {
      const updatedVessel = await this._vesselModel.findByIdAndUpdate(
        vesselId,
        { images: imagesArray },
        { new: true }
      );
      return res.status(200).send(updatedVessel);
    } catch (err) {
      return res.status(500).send({ success: false, message: err });
    }
  }

  public async searchVessel(req: Request, res: Response) {
    // const vesselType = <string>req.query.vesselType;
    // const searchLocation = <string>req.query.searchLocation;
    // const fromLocation = <string>req.query.from;
    // const toLocation = <string>req.query.to;
    const filter: Filter = req.body;
    let model: Model<any>;
    const minPrice = filter?.minPrice || 0;
    const maxPrice = filter?.maxPrice || 1000;
    const passengers = filter?.passengers || 0;
    const durationType = filter?.durationType || 'CALENDAR';
    const flexibleType = filter?.durationFlexible?.type || 'MONTH';
    const flexibleValue = filter?.durationFlexible?.value || 'JUNE';
    const searchLocation = filter?.searchLocation || 'Cherry Beach';
    const locationTo = filter?.locationTo || 'Cherry Beach';
    const locationFrom = filter?.locationFrom || 'CN Tower';
    const maxRange = 50;
    const vesselFeatures =
      filter?.features && filter?.features?.length !== 0
        ? filter?.features
        : null;
    const vesselCategories =
      filter?.categories && filter?.categories?.length !== 0
        ? filter?.categories
        : null;
    const priceType = filter.priceType
      ? filter.priceType
      : filter.vesselType === 'RENTAL'
      ? 'HOUR'
      : 'DAY';
    console.log('search Location', searchLocation);
    console.log('location to', locationTo);
    console.log('location from', locationFrom);

    if (req?.body?.exploreAll) {
      try {
        const exploreAllVessels = await this._vesselModel
          .find({ vesselType: filter.vesselType, vesselStatus: 'PUBLISHED' })
          .sort('sequence');
        return res.status(200).send(exploreAllVessels);
      } catch (er) {
        return res.status(500).send({
          success: false,
          message: `Error while fetching vessels. ${er}`,
        });
      }
    } else {
      // if (searchParam) {
      //     this._rentalsModel.find({address: {city: { $regex: '.*' + searchParam + '.*' } }}, (err, rentals) => {
      //         if (err) return res.status(500).send(err).end();
      //         return res.status(200).send(rentals);
      //     })
      // } else {
      //     return res.status(400).send({success: false, message: 'Please provide any search query to search'}).end();
      // }

      let resultLatLng: any;
      let destinationLatLng: any;

      if (filter.vesselType) {
        switch (filter.vesselType) {
          case 'RENTAL':
            model = this._rentalsModel;
            resultLatLng = await this.googlePlacesController.getAddressByCity(
              searchLocation
            );
            break;
          case 'STAY':
            model = this._staysModel;
            resultLatLng = await this.googlePlacesController.getAddressByCity(
              searchLocation
            );
            break;
          case 'CHARTER':
            model = this._chartersModel;
            resultLatLng = await this.googlePlacesController.getAddressByCity(
              locationFrom
            );
            destinationLatLng =
              await this.googlePlacesController.getAddressByCity(locationTo);
            break;
          default:
            return res.status(500).send({
              success: false,
              message: 'Invalid Vessel Type Provided',
            });
        }
      } else {
        return res
          .status(500)
          .send({ success: false, message: 'Vessel Type not provided' });
      }

      if (
        resultLatLng?.status === 'OK' &&
        resultLatLng.candidates.length !== 0
      ) {
        const searchLatitude = resultLatLng.candidates[0].geometry.location.lat;
        const searchLongitude =
          resultLatLng.candidates[0].geometry.location.lng;
        let searchDestinationLatitude = 0;
        let searchDestinationLongitude = 0;

        if (filter.vesselType === 'CHARTER') {
          if (
            destinationLatLng?.status === 'OK' &&
            destinationLatLng.candidates.length !== 0
          ) {
            searchDestinationLatitude =
              destinationLatLng.candidates[0].geometry.location.lat;
            searchDestinationLongitude =
              destinationLatLng.candidates[0].geometry.location.lng;
          } else {
            return res.status(500).send({
              success: false,
              message:
                'DestinationAddress Geometry not found (INVALID LOCATION)',
            });
          }
        }

        // TODO Once availability model have been implemented these values should affect find query
        // switch (durationType) {
        //     case 'CALENDAR':
        //         break;
        //     case 'FLEXIBLE':
        //         break;
        //     default:
        //         return res.status(500).send({success: false, message: "Invalid duration type provided"});
        // }

        const resultArray: any[] = [];

        let vesselFilters = {
          vesselType: filter.vesselType,
          numberOfPassengers: { $gte: passengers },
          vesselStatus: 'PUBLISHED',
        };

        if (
          priceType === 'HOUR' ||
          priceType === 'DAY' ||
          priceType === 'WEEK'
        ) {
          switch (priceType) {
            case 'HOUR':
              vesselFilters = {
                ...vesselFilters,
                ...{
                  $or: [
                    {
                      'vesselPricing.perHour.amount': {
                        $gte: minPrice,
                        $lte: maxPrice,
                      },
                    },
                  ],
                },
              };
              break;
            case 'DAY':
              vesselFilters = {
                ...vesselFilters,
                ...{
                  $or: [
                    {
                      'vesselPricing.perDay.amount': {
                        $gte: minPrice,
                        $lte: maxPrice,
                      },
                    },
                  ],
                },
              };
              break;
            case 'WEEK':
              console.log('going into week');
              vesselFilters = {
                ...vesselFilters,
                ...{
                  $or: [
                    {
                      'vesselPricing.perWeek.amount': {
                        $gte: minPrice,
                        $lte: maxPrice,
                      },
                    },
                  ],
                },
              };
              break;
            default:
              break;
          }
        }

        vesselFeatures &&
          (vesselFilters = {
            ...vesselFilters,
            ...{ vesselFeatures: vesselFeatures },
          });
        vesselCategories &&
          (vesselFilters = {
            ...vesselFilters,
            ...{ vesselCategory: vesselCategories },
          });

        console.log(vesselFilters);

        try {
          const vessels: any[] = await this._vesselModel.find(vesselFilters);
          // console.log(vessels);
          if (vessels && vessels.length !== 0) {
            vessels.forEach((vessel) => {
              if (
                vessel?.vesselLocation &&
                vessel?.vesselLocation?.latitude &&
                vessel?.vesselLocation?.longitude
              ) {
                const distance =
                  this.googlePlacesController.calculateDistanceBetweenTwoPoints(
                    searchLatitude,
                    searchLongitude,
                    Number(vessel.vesselLocation.latitude),
                    Number(vessel.vesselLocation.longitude)
                  );
                // console.log(distance);

                // check if the vessel type is charter
                if (
                  filter.vesselType === 'CHARTER' &&
                  vessel?.destinationLocation?.latitude &&
                  vessel?.destinationLocation?.longitude
                ) {
                  const destinationDistance =
                    this.googlePlacesController.calculateDistanceBetweenTwoPoints(
                      Number(searchDestinationLatitude),
                      Number(searchDestinationLongitude),
                      Number(vessel.destinationLocation.latitude),
                      Number(vessel.destinationLocation.longitude)
                    );
                  console.log(destinationDistance);
                  if (distance <= maxRange && destinationDistance <= maxRange) {
                    resultArray.push(vessel);
                  }
                } else {
                  // TODO change the max distance range to be dynamically fetched from configuration model once implemented
                  if (distance <= maxRange) {
                    resultArray.push(vessel);
                  }
                }
              }
            });
            return res.status(200).send(resultArray);
          } else {
            return res.status(200).send([]);
          }
        } catch (err) {
          return res.status(500).send({
            success: false,
            message: `There was an error searching for vessel ${err}`,
          });
        }
      } else {
        return res.status(500).send({
          success: false,
          message: 'Address Geometry not found (INVALID LOCATION)',
        });
      }
    }
  }

  /**
   * Finds the vessel by Id and updates the provided image by their ids with the provided captions
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async updateImagesCaptions(req: Request, res: Response): Promise<any> {
    const captionsArray = req.body;
    const vesselId = req.params.vesselId;

    if (vesselId) {
      try {
        const foundVessel = await this._vesselModel.findById(vesselId);
        if (foundVessel) {
          // @ts-ignore
          if (foundVessel.userId.toString() === res.locals.user.id) {
            // @ts-ignore
            if (foundVessel.images && foundVessel.images.length !== 0) {
              // @ts-ignore
              const imagesArray = foundVessel.images;
              imagesArray.forEach((image: { _id: string; caption: string }) => {
                captionsArray.forEach(
                  (tempCaption: { imageId: string; caption: string }) => {
                    if (image._id.toString() === tempCaption.imageId) {
                      image.caption = tempCaption.caption;
                    }
                  }
                );
              });
              const updatedVessel = await this._vesselModel.findByIdAndUpdate(
                vesselId,
                { images: imagesArray },
                { new: true }
              );
              return res.status(200).send(updatedVessel);
            } else {
              return res
                .status(404)
                .send({ success: false, message: 'No Vessel Images Found.' });
            }
          } else {
            return res.status(401).send({
              success: false,
              message: 'User does not own the vessel.',
            });
          }
        } else {
          return res
            .status(404)
            .send({ success: false, message: 'Vessel Not found.' });
        }
      } catch (error) {
        return res.status(500).send({
          success: false,
          message: 'Error while fetching vessel details.',
        });
      }
    } else {
      return res
        .status(400)
        .send({ success: false, message: 'Vessel Id not provided.' });
    }
    return null;
  }

  /**
   * Finds the vessel by Id and updates the provided image by their ids with the provided captions
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * @param {NextFunction} next - Express Next function to cal the next middleware
   * */
  public async updateImageLinkByImageId(
    req: Request,
    res: Response,
    next: NextFunction
  ):Promise<any> {
    const imageId = req.params.imageId;

    if (imageId) {
      const vessel = await this._vesselModel.findOne({ 'images._id': imageId });
      if (vessel) {
        console.log(vessel);
        // check if only the vessel's owner (user Id) is uploading the image
        // @ts-ignore
        if (vessel.userId.toString() === res.locals.user.id) {
          const vesselObj: any = vessel.toObject();
          res.locals.vesselId = vesselObj._id;
          const index = vesselObj.images.findIndex(
            (img: any) => img._id.toString() === imageId
          );
          if (index !== -1) {
            // @ts-ignore
            req.vesselImage = vesselObj.images[index];
            next();
          } else {
            return res
              .status(404)
              .send({ success: false, message: 'Image not found' });
          }
        } else {
          return res
            .status(401)
            .send({ success: false, message: 'User does not own the vessel.' })
            .end();
        }
      } else {
        return res
          .status(404)
          .send({
            success: false,
            message: 'Vessel was not found for the provided Image.',
          })
          .end();
      }
    } else {
      return res.status(400).send({
        success: false,
        message: 'Image Id and/or Vessel Type not provided',
      });
    }
    throw new Error("Error")
  }

  public async getVesselFiles(req: Request, res: Response) {
    this._vesselModel
      .findById(req.params.vesselId)
      .populate('documentsIds')
      // @ts-ignore
      .exec(function (error: any, documents: { documentsIds: any }) {
        if (error) return res.status(500).send(error);
        return res.status(200).send(documents.documentsIds);
      });
  }

  public async getVesselFilesAdmin(req: Request, res: Response) {
    this._vesselModel
      .findById(req.params.id)
      .populate('documentsIds')
      // @ts-ignore
      .exec(function (error: any, documents: { documentsIds: any }) {
        if (error) return res.status(500).send(error);
        // @ts-ignore
        // if (documents?.userId.toString() === res.locals.user.id) {
        // @ts-ignore
        return res.status(200).send(documents.documentsIds);
        // } else {
        //     return res.status(500).send({success: false, message: "User Mismatch"})
        // }
      });
  }

  public async getBoatLicenseFilesAdmin(req: Request, res: Response) {
    try {
      const user = await this._userModel
        .findById(req.params.id)
        .lean()
        .select('firstName lastName email isVesselOwner updatedAt documents')
        .populate('documents');
      console.log(user);
      return res.status(200).send(user);
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the user. ${error}`,
      });
    }
  }

  public async updateVesselFilesAdmin(req: Request, res: Response) {
    const id = req.params.id;
    console.log(id);
    if (id) {
      this._documentsModel.findByIdAndUpdate(
        {
          _id: id,
        },
        req.body,
        {
          new: true,
        },
        // @ts-ignore
        (err: any, model: any) => {
          if (err) return res.status(500).send(err);
          return res.json(model);
        }
      );
    } else {
      res.status(500).send({ success: false, message: 'Id is required' });
    }
  }

  /**
   * Finds the image By Id and updates its sequence to the first position
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async updateCoverImageById(req: Request, res: Response): Promise<any> {
    const imageId = req.body.imageId;

    if (imageId) {
      const vessel = await this._vesselModel.findOne({ 'images._id': imageId });
      if (vessel) {
        console.log(vessel);
        // check if only the vessel's owner (user Id) is uploading the image
        // @ts-ignore
        if (vessel.userId.toString() === res.locals.user.id) {
          // making the temp array to store new items
          const tempImagesArray = [];
          const vesselObj: any = vessel.toObject();
          // finding the index of the image by id
          const index = vesselObj.images.findIndex(
            (img: any) => img._id.toString() === imageId
          );
          // if index found then push the image as sequence 1 in the temporary array and push the other items after that
          if (index !== -1) {
            vesselObj.images[index].sequence = 1;
            tempImagesArray.push(vesselObj.images[index]);
            // copying the images array without its refrence
            const copiedImagesArray = JSON.parse(
              JSON.stringify(vesselObj.images)
            );
            copiedImagesArray.splice(index, 1);
            copiedImagesArray.forEach((copiedImage: any, index: number) => {
              copiedImage.sequence = index + 2;
              tempImagesArray.push(copiedImage);
            });
            try {
              const updatedVessel = await this._vesselModel.findByIdAndUpdate(
                vesselObj._id,
                { images: tempImagesArray },
                { new: true }
              );
              // @ts-ignore
              res.status(200).send(updatedVessel?.images);
            } catch (err) {
              res.status(500).send({
                success: false,
                message: `There was an error updating the vessel ${err}`,
              });
            }
          } else {
            return res
              .status(404)
              .send({ success: false, message: 'Image not found' });
          }
        } else {
          return res
            .status(401)
            .send({ success: false, message: 'User does not own the vessel.' })
            .end();
        }
      } else {
        return res
          .status(404)
          .send({
            success: false,
            message: 'Vessel was not found for the provided Image.',
          })
          .end();
      }
    } else {
      return res.status(400).send({
        success: false,
        message: 'Image Id and/or Vessel Type not provided',
      });
    }
    return null;
  }

  /**
   * get all the vessels for admin Dashboard
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async getAllVesselsDashboard(req: Request, res: Response) {
    try {
      let i: number;
      // @ts-ignore
      const currYearDayOne = new Date(new Date().getFullYear(), 0, 1);
      const today = new Date();
      let aggregate;
      for (i = 1; i <= 12; i++) {
        aggregate = await this._vesselModel.aggregate([
          {
            $facet: {
              charters: [
                {
                  $match: {
                    createdAt: { $gte: currYearDayOne, $lt: today },
                    vesselType: 'CHARTER',
                  },
                },
                {
                  $group: {
                    _id: {
                      month: { $month: '$createdAt' },
                    },
                    count: { $sum: 1 },
                  },
                },
              ],
              stays: [
                {
                  $match: {
                    createdAt: { $gte: currYearDayOne, $lt: today },
                    vesselType: 'STAY',
                  },
                },
                {
                  $group: {
                    _id: {
                      month: { $month: '$createdAt' },
                    },
                    count: { $sum: 1 },
                  },
                },
              ],
              rentals: [
                {
                  $match: {
                    createdAt: { $gte: currYearDayOne, $lt: today },
                    vesselType: 'RENTAL',
                  },
                },
                {
                  $group: {
                    _id: {
                      month: { $month: '$createdAt' },
                    },
                    count: { $sum: 1 },
                  },
                },
              ],
              chartersSum: [
                {
                  $match: {
                    createdAt: { $lt: today },
                    vesselType: 'CHARTER',
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
              ],
              staysSum: [
                {
                  $match: {
                    createdAt: { $lt: today },
                    vesselType: 'STAY',
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
              ],
              rentalsSum: [
                {
                  $match: {
                    createdAt: { $lt: today },
                    vesselType: 'RENTAL',
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
              ],
            },
          },
        ]);
      }
      return res.status(200).send(aggregate);
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the users. ${error}`,
      });
    }
  }

  /**
   * update the vessels by provided id and sequence
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async updateVesselSequence(req: Request, res: Response) {
    const { id, sequence } = req.body;
    const vesselType = req.params.vesselType;

    if (id && vesselType && sequence && sequence >= -1 && sequence <= 3) {
      try {
        const vesselToUpdate = await this._vesselModel.findById(id);
        if (vesselToUpdate) {
          // @ts-ignore
          const existingSequence = vesselToUpdate?.sequence;
          if (
            sequence === -1 &&
            existingSequence &&
            existingSequence >= 1 &&
            existingSequence <= 2
          ) {
            await this._vesselModel.findByIdAndUpdate(id, { sequence: -1 });
            const foundVessels = await this._vesselModel
              .find({
                vesselType: vesselType,
                sequence: { $exists: true, $ne: -1 },
              })
              .sort('sequence');
            const vesselIdsToUpdate = [];
            // @ts-ignore
            vesselIdsToUpdate.push(...foundVessels);
            await Promise.all(
              vesselIdsToUpdate.map(
                async (vesselToUpdate: any, index: number) => {
                  await this._vesselModel.findByIdAndUpdate(
                    vesselToUpdate._id,
                    { sequence: index + 1 }
                  );
                }
              )
            );
            return res
              .status(200)
              .send({ success: true, message: 'sequence updated' });
          } else {
            const foundVessels = await this._vesselModel.find({
              vesselType: vesselType,
              sequence: Number(sequence),
            });
            if (foundVessels && foundVessels?.length !== 0) {
              const vesselIdsToUpdate = [];
              // @ts-ignore
              vesselIdsToUpdate.push(...foundVessels);
              await Promise.all(
                vesselIdsToUpdate.map(async (vesselToUpdate: any) => {
                  await this._vesselModel.findByIdAndUpdate(
                    vesselToUpdate._id,
                    { sequence: -1 }
                  );
                })
              );
              const updatedVessel = await this._vesselModel.findByIdAndUpdate(
                id,
                { sequence: Number(sequence) },
                { new: true }
              );
              console.log(updatedVessel);
              return res
                .status(200)
                .send({ success: true, message: 'sequence updated.' });
            } else {
              const vesselUpdated = await this._vesselModel.findByIdAndUpdate(
                id,
                { sequence: Number(sequence) },
                { new: true }
              );
              return res
                .status(200)
                .send({ success: true, message: 'sequence updated.' });
            }
          }
        } else {
          return res.status(500).send({
            success: false,
            message:
              'Vessel with provided Id not found or Invalid sequence provided',
          });
        }
      } catch (error) {
        return res.status(500).send({
          success: false,
          message: `Error while fetching vessel details. ${error}`,
        });
      }
    } else {
      return res.status(400).send({
        success: false,
        message:
          'Id, sequence and/or vessel type is required. (Sequence should be in the range: 1-3)',
      });
    }
  }

  /**
   * get all the featured vessels
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async getFeaturedVessels(req: Request, res: Response) {
    // only select the listings that have sequence value and not equal to -1
    try {
      const rentals = await this._vesselModel
        .find({
          vesselType: 'RENTAL',
          sequence: { $exists: true, $ne: -1 },
        })
        .sort('sequence');
      // console.log(rentals,"rentals")
      const stays = await this._vesselModel
        .find({
          vesselType: 'STAY',
          // sequence: { $exists: true, $ne: -1 },
        })
        .sort('sequence');
      const charters = await this._vesselModel
        .find({
          vesselType: 'CHARTER',
          sequence: { $exists: true, $ne: -1 },
        })
        .sort('sequence');
      const featuredListings = {
        rentals: rentals,
        charters: charters,
        stays: stays,
      };
      return res.status(200).send(featuredListings);
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the listings. ${error}`,
      });
    }
  }

  /**
   * get all the listings for admin
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async getAllListings(req: Request, res: Response) {
    try {
      const page: number = parseInt(<string>req.query.p) || 1;
      const size: number = parseInt(<string>req.query.s) || 5;
      const order = req.query.o || {};
      const text =
        <string>req.query.f && <string>req.query.f !== ''
          ? <string>req.query.f
          : '';
      const query = [
        { title: { $regex: `.*${text}.*`, $options: 'i' } },
        {
          vesselType: {
            $regex: `.*${text}.*`,
            $options: 'i',
          },
        },
        {
          'userId.firstName': {
            $regex: `.*${text}.*`,
            $options: 'i',
          },
        },
        { 'userId.lastName': { $regex: `.*${text}.*`, $options: 'i' } },
        { 'userId.email': { $regex: `.*${text}.*`, $options: 'i' } },
        {
          'vesselAddress.city': {
            $regex: `.*${text}.*`,
            $options: 'i',
          },
        },
        { cost: { $regex: `.*${text}.*` } },
      ];
      const vesselCount = await this._vesselModel.countDocuments({
        $or: query,
      });
      const vessels = await this._vesselModel
        .find({ $or: query })
        .collation({ locale: 'en' })
        .populate('userId', 'firstName lastName email')
        .skip(size * (page - 1))
        .limit(size)
        .sort(order);
      return res.status(200).send({
        totalCount: vesselCount,
        pageNumber: page,
        pageSize: size,
        sortOrder: order,
        vesselsList: vessels,
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the listings. ${error}`,
      });
    }
  }

  /**
   * Sort the array by the sequence variable
   * @param {any[]} imagesArray - Array to sort
   * @return {any[]} sorted images array
   * */
  public sortImagesBySequence(
    imagesArray: {
      _id: string;
      imageURL: string;
      caption: string;
      sequence?: string;
    }[]
  ) {
    if (imagesArray && imagesArray.length !== 0) {
      imagesArray.sort((a: any, b: any) => {
        return (
          (a?.sequence ? a.sequence : 'Infinity') -
          (b?.sequence ? b.sequence : 'Infinity')
        );
      });
      return imagesArray;
    }
    return [];
  }

  /**
   * Middleware to populate the vessel model in res.locals by the vessel type
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * @param {NextFunction} next - Express next function to call the next method
   * */
  public populateVesselModelByType(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const vesselType = req.params.vesselType
      ? req.params.vesselType
      : req.body.vesselType;
    console.log(vesselType);
    switch (vesselType) {
      case 'RENTAL': {
        res.locals.model = this._rentalsModel;
        next();
        break;
      }
      case 'STAY': {
        res.locals.model = this._staysModel;
        next();
        break;
      }
      case 'CHARTER': {
        res.locals.model = this._chartersModel;
        next();
        break;
      }
      default: {
        res
          .status(500)
          .send({ success: false, message: 'Invalid Vessel Type Provided.' });
        break;
      }
    }
  }

  /**
   * Middleware to parse the base 64 filter for search query
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * @param {NextFunction} next - Express next function to call the next method
   * */
  public parseBase64Filter(req: Request, res: Response, next: NextFunction) {
    const filterBase64: string = <string>req.query.f;
    let filter = null;
    if (filterBase64) {
      const buffer = Buffer.from(filterBase64, 'base64');
      filter = JSON.parse(buffer.toString('ascii'));
      let check_regex = Object.keys(filter);
      if (check_regex[0] === 'regex') {
        for (const element of filter['regex']) {
          if (element === 'regex') return;
          filter[element] = new RegExp(filter[element], 'i');
        }
        delete filter['regex'];
      }
      check_regex = Object.keys(filter);
      if (check_regex[0] === 'id') {
        for (const element of filter['id']) {
          if (element === 'id') return;
          filter[element] = new Types.ObjectId(filter[element]);
        }
        delete filter['id'];
      }
    }
    res.locals.filter = filter;
    next();
  }

  /**
   * get all the listings for admin
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async getVesselById(req: Request, res: Response) {
    const vesselId = req.params.id;
    try {
      const vessel = await this._vesselModel
        .findById(vesselId)
        .populate('vesselCategory');
      return res.status(200).send(vessel);
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the listings. ${error}`,
      });
    }
  }

  /**
   * Update the listing for admin
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async updateVesselByAdmin(req: Request, res: Response) {
    const vesselId = req.params.id;
    try {
      const vessel = await this._vesselModel.findByIdAndUpdate(
        vesselId,
        req.body,
        {
          new: true,
        }
      );
      return res.status(200).send(vessel);
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error updating the vessel. ${error}`,
      });
    }
  }

  /**
   * get all the listings for admin
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async getVesselByIdGuest(req: Request, res: Response) {
    const vesselId = req.params.id;
    try {
      const vessel = await this._vesselModel
        .findById(vesselId)
        .lean()
        .populate('vesselCategory', 'name')
        .populate('userId', 'firstName lastName profileImageUrl email')
        .select('-documentsIds')
        .populate('vesselFeatures');
      if (vessel) {
        return res.status(200).send(vessel);
      } else {
        return res
          .status(404)
          .send({ success: false, message: 'Vessel Not Found.' });
      }
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the listings. ${error}`,
      });
    }
  }

  /**
   * Middle ware for checking user vessels
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * @param {NextFunction} next - Express Next function to call the next middleware
   * */
  public async checkVesselOwner(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const vesselsLength = await this._vesselModel.countDocuments({
        userId: res.locals.user.id,
      });
      if (vesselsLength && vesselsLength !== 0) {
        res.locals.listings = vesselsLength;
      } else {
        res.locals.listings = 0;
      }
      next();
    } catch (err) {
      res.status(500).send({
        success: false,
        message: `There was an error fetching user listings ${err}`,
      });
    }
  }
}

class Filter {
    vesselType: string;
    searchLocation: string;
    locationFrom: string;
    locationTo: string;
    minPrice: number;
    maxPrice: number;
    passengers: number;
    durationType: string;
    durationFlexible: {
        type: string;
        value: string
    };
    durationFrom: string;
    durationTo: string;
    features: string[];
    categories: string[];
    priceType: PriceTypes;
    exploreAll: boolean;
}

enum PriceTypes {
    HOUR = 'HOUR',
    DAY = 'DAY',
    WEEK = 'WEEK'
}
