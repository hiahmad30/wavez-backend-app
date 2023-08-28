import {Request, Response} from 'express';
import BaseController from "./base.controller";
import ReportModel from "../models/report.model";
import TripModel from "../models/trip.model";

export default class ReportsController extends BaseController {
    private _reportModel = ReportModel.getInstance().getModel();
    private _tripModel = TripModel.getInstance().getModel();

    constructor() {
        super(ReportModel.getInstance().getModel());
    }

    public async getReports(req: Request, res: Response) {
        const id = req.params.id || null;
        if (id) {
            try {
                const faq = await this._reportModel.findById(id).lean().populate({path: 'trip', populate: { path: 'vesselId', select: 'title vesselBrand' }})
                    .populate({path: 'trip',populate: { path: 'vesselOwner', select: 'firstName lastName stripeCustomerId' }})
                    .populate({path: 'trip',populate: { path: 'vessel', select: 'title vesselBrand' }})
                    .populate('reportedBy', 'firstName lastName');
                if (faq) {
                    return res.status(200).send(faq).end();
                } else {
                    return res.status(404).send({ success: false, message: "Report not found." });
                }
            } catch(err) {
                return res.status(500).send({ success: false, message: `There was an error fetching the Report ${err}`});
            }
        } else {
            try {
                const faqs = await this._reportModel.find({}).lean().populate({path: 'trip',populate: { path: 'vessel', select: 'title vesselBrand' }})
                    .populate({path: 'trip',populate: { path: 'vesselOwner', select: 'firstName lastName' }})
                    .populate('reportedBy', 'firstName lastName');
                return res.status(200).send(faqs).end();
            } catch (err) {
                return res.status(500).send({ success: false, message: `There was an error fetching the Reports ${err}`});
            }
        }
    }

    public async addReport(req: Request, res: Response) {
        const tripId = req.params.tripId || null;
        if (tripId) {
            try {
                const trip = await this._tripModel.findById(tripId);
                if (trip) {
                    // generate a randomized 6 - digit transaction id
                    req.body.transactionId = Math.floor(100000 + Math.random() * 900000);
                    req.body.reportedBy = res.locals.user.id;
                    req.body.trip = req.params.tripId;
                    // @ts-ignore
                    const images: any[] = req.files;
                    req.body.photos = images.map(image => image.url.split('?se')[0]);
                    const reportModel = new this._reportModel(req.body);
                    const report = await reportModel.save();
                    return res.status(200).send(report);
                } else {
                    return res.status(404).send({ success: false, message: `Trip Not Found.`});
                }
            } catch (err) {
                return res.status(500).send({ success: false, message: `There was an error adding the reports ${err}`});
            }
        } else {
            return res.status(500).send({success: false, message: "trip Id not provided."})
        }
    }

    public async updateReport(req: Request, res: Response) {
        super.update(req, res);
    }

    public async deleteReport(req: Request, res: Response) {
        super.delete(req, res);
    }
}
