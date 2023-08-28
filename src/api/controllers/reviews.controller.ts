/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Request, Response} from 'express';
import BaseController from "./base.controller";
import ReviewModel from "../models/review.model";
import VesselModel from "../models/vessel.model";
import TripModel from "../models/trip.model";

export default class ReviewsController extends BaseController {
    private _reviewModel = ReviewModel.getInstance().getModel();
    private _vesselModel = VesselModel.getInstance().getModel();
    private _tripModel = TripModel.getInstance().getModel();

    constructor() {
        super(ReviewModel.getInstance().getModel());
    }

    public async getReview(req: Request, res: Response) {
        const id = req.params.id || null;
        if (id) {
            try {
                const review = await this._reviewModel.findById(id).populate('reviewer', 'firstName lastName profileImageUrl');
                if (review) {
                    return res.status(200).send(review).end();
                } else {
                    return res.status(404).send({ success: false, message: "Review not found." });
                }
            } catch(err) {
                return res.status(500).send({ success: false, message: `There was an error fetching the Review ${err}`});
            }
        } else {
            return res.status(400).send({ success: false, message: `Id not provided.`});
        }
    }

    public async getReviewsByVesselId(req: Request, res: Response) {
        const vesselId = req.params.vesselId || null;
        const page: number = parseInt(<string>req.query.p) || 1;
        const size: number = parseInt(<string>req.query.s) || 5;
     const order = req.query.o || {};


        if (vesselId) {
            try {
                const reviewCount = await this._reviewModel.find({ vessel: vesselId }).countDocuments();
                const reviews = await this._reviewModel.find({ vessel: vesselId }).populate({path: 'reviewer', populate: { path: 'userAddress', select: 'country province' },
                    select: "firstName lastName profileImageUrl rawAddress"})
                    .skip(size * (page - 1))
                    .limit(size)
                    .sort(order);
                return res.status(200).send({totalCount: reviewCount, pageNumber: page, pageSize: size, sortOrder: order, reviews: reviews});
            } catch(err) {
                return res.status(500).send({ success: false, message: `There was an error fetching the Reviews ${err}`});
            }
        } else {
            return res.status(400).send({ success: false, message: `Vessel Id not provided.`});
        }
    }

    public async addReview(req: Request, res: Response) {
        const vesselId = req.params.vesselId || null;
        const userId = res.locals.user.id;
        if (vesselId && userId && req.body.rating >= 1 && req.body.rating <= 5) {
            try {
                const vessel = await this._vesselModel.findById(vesselId);
                if (vessel) {
                    const numberOfReviews = await this._reviewModel.find({ vessel: vesselId }).countDocuments();
                    // @ts-ignore
                    const averageRating = vessel?.averageRating;
                    // calculate the average rating and round it to 1 decimal place
                    const newAverageRating = (numberOfReviews === 0) ? req.body.rating : (Math.round((((averageRating * numberOfReviews) + req.body.rating) / (numberOfReviews + 1)) * 10) / 10);
                    req.body.vessel = vesselId;
                    req.body.reviewer = userId;
                    const reviewModel = new this._reviewModel(req.body);
                    const review = await reviewModel.save();
                    const updatedVessel = await this._vesselModel.findByIdAndUpdate(vesselId, { averageRating: newAverageRating });
                    if (req.body.tripId && req.body.tripId !== "") {
                        const updatedTrip = await this._tripModel.findByIdAndUpdate(req.body.tripId, {reviewed: true});
                    }
                    return res.status(200).send({success: true, review: review, message: "review added and vessel average reviews updated"});
                } else {
                    return res.status(404).send({success: false, message: "Vessel not found."})
                }
            } catch (err) {
                return res.status(500).send({ success: false, message: `There was an error adding the Review ${err}`});
            }
        } else {
            return res.status(500).send({success: false, message: "Vessel Id not provided or rating not valid should be between 1 to 5."})
        }
    }

    public async getFeaturedReviews(req: Request, res: Response) {
        try {
            const reviews = await this._reviewModel.find({ sequence: { $exists: true, $ne: -1 } }).populate({path: 'reviewer', populate: { path: 'userAddress', select: 'country province' },
                select: "firstName lastName profileImageUrl rawAddress"}).sort("sequence");
            return res.status(200).send(reviews);
        } catch(err) {
            return res.status(500).send({ success: false, message: `There was an error fetching the Reviews ${err}`});
        }
    }

    /**
     * update the reviews by provided id and sequence
     * @param {Request} req - Express request object
     * @param {Request} res - Express Response Object
     * */
    public async updateReviewSequence(req: Request, res: Response) {
        const {id, sequence} = req.body;

        if (id && sequence && sequence >= -1 && sequence <= 3) {
            try {
                const reviewToUpdate = await this._reviewModel.findById(id);
                if (reviewToUpdate) {
                    // @ts-ignore
                    const existingSequence = reviewToUpdate?.sequence;
                    if (sequence === -1 && existingSequence && existingSequence >= 1 && existingSequence <= 2) {
                        await this._reviewModel.findByIdAndUpdate(id, { sequence: -1 });
                        const foundReviews = await this._reviewModel.find({ sequence: { $exists: true, $ne: -1 }}).sort("sequence");
                        const reviewIdsToUpdate = [];
                        // @ts-ignore
                        reviewIdsToUpdate.push(...foundReviews);
                        await Promise.all(reviewIdsToUpdate.map(async (reviewToUpdate: any, index: number) => {
                            await this._reviewModel.findByIdAndUpdate(reviewToUpdate._id, { sequence: index + 1 });
                        }));
                        return res.status(200).send({success: true, message: "sequence updated"});
                    } else {
                        const foundReviews = await this._reviewModel.find({ sequence: Number(sequence) });
                        if (foundReviews && foundReviews?.length !== 0) {
                            const reviewIdsToUpdate = [];
                            // @ts-ignore
                            reviewIdsToUpdate.push(...foundReviews);
                            await Promise.all(reviewIdsToUpdate.map(async (reviewToUpdate: any) => {
                                await this._reviewModel.findByIdAndUpdate(reviewToUpdate._id, { sequence: -1 });
                            }));
                            const updatedReview = await this._reviewModel.findByIdAndUpdate(id, { sequence: Number(sequence) }, { new: true });
                            return res.status(200).send({ success: true, message: "sequence updated."});
                        } else {
                            const reviewUpdated = await this._reviewModel.findByIdAndUpdate(id, { sequence: Number(sequence) }, { new: true });
                            return res.status(200).send({ success: true, message: "sequence updated."});
                        }
                    }
                } else {
                    return res.status(500).send({ success: false, message: "review with provided Id not found or Invalid sequence provided"})
                }
            } catch (error) {
                return res.status(500).send({ success: false, message: `Error while fetching review. ${error}`});
            }
        } else {
            return res.status(400).send({ success: false, message: 'Id and/or sequence required (Sequence should be in the range: 1-3)'});
        }
    }

    public async updateReview(req: Request, res: Response) {
        super.update(req, res);
    }

    public async deleteReview(req: Request, res: Response) {
        super.delete(req, res);
    }

    public async getAllReviews(req: Request, res: Response) {
        const page: number = parseInt(<string>req.query.p) || 1;
        const size: number = parseInt(<string>req.query.s) || 5;
       const order = req.query.o || {};

        const text = (<string>req.query.f && <string>req.query.f !== '') ? <string>req.query.f : '';
        const query: any[] = [ {"reviewer.firstName": {$regex: `.*${text}.*`, $options: 'i'}}, {"reviewer.lastName": {$regex: `.*${text}.*`, $options: 'i'}},
            {"reviewer.rawAddress": {$regex: `.*${text}.*`, $options: 'i'}}, {rating: {$regex: `.*${text}.*`, $options: 'i'}}];
        console.log('list');
        try {
                const reviewCount = await this._reviewModel.find({}).countDocuments();
                const reviews = await this._reviewModel.find({}).populate({path: 'reviewer', populate: { path: 'userAddress', select: 'country province' },
                    select: "firstName lastName profileImageUrl rawAddress"})
                    .collation({locale: "en" })
                    .skip(size * (page - 1))
                    .limit(size)
                    .sort(order);
                return res.status(200).send({totalCount: reviewCount, pageNumber: page, pageSize: size, sortOrder: order, reviews: reviews});
        } catch(err) {
            return res.status(500).send({ success: false, message: `There was an error fetching the Reviews ${err}`});
        }
    }
}
