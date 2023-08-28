/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import BaseController from "./base.controller";
import EventModel from "../models/event.model";
import {NextFunction, Request, Response} from "express";
import VesselModel from "../models/vessel.model";
import {Document} from 'mongoose';


export default class EventController extends BaseController {

    private _eventModel = EventModel.getInstance().getModel();
    private _vesselModel = VesselModel.getInstance().getModel();

    constructor() {
        super(EventModel.getInstance().getModel());
    }

    /**
     * Blocks the specified timeslot
     * @param {Request} req - Express request object
     * @param {Request} res - Express Response Object
     * */
    public async searchVesselEvents(req: Request, res: Response) {
        const {start, end, vesselIds} = req.body;

        if (start && end) {
            if (vesselIds && vesselIds.length !== 0) {
                try {
                    const startDate = res.locals.start;
                    const endDate = res.locals.end;
                    const events = await this._eventModel.find({
                        vessel: vesselIds, $or: [
                            {start: {$gte: startDate}, end: {$lte: endDate}},
                            {start: {$lt: endDate}, end: {$gte: endDate}},
                            {end: {$gt: startDate}, start: {$lte: startDate}}]
                    })
                        .populate('userDetails', 'firstName lastName profileImageUrl')
                        .populate('vessel', 'title vesselYear vesselBrand');
                    return res.status(200).send(events);
                } catch (err) {
                    return res.status(500).send({
                        success: false,
                        message: `There was an error while searching the events ${err}`
                    });
                }
            } else {
                return res.status(200).send([]);
            }
        } else {
            return res.status(500).send({success: false, message: `Start and/or end date not provided`});
        }
    }

    /**
     * Blocks the specified timeslot
     * @param {Request} req - Express request object
     * @param {Request} res - Express Response Object
     * */
    public async blockTimeslotForVessel(req: Request, res: Response):Promise<any> {

        try {
            const vesselFound = await this._vesselModel.findById(req.params.vesselId).populate('events');
            if (vesselFound) {
                const startDate = res.locals.start;
                const endDate = res.locals.end;
                // @ts-ignore
                if (vesselFound?.userId && vesselFound?.userId.toString() === res.locals.user.id) {
                    const existingEvents = await this._eventModel.find({
                        vessel: vesselFound._id,
                        $or: [{start: {$gte: startDate}, end: {$lte: endDate}},
                            {start: {$lt: endDate}, end: {$gte: endDate}},
                            {end: {$gt: startDate}, start: {$lte: startDate}}]
                    });
                    console.log(existingEvents);
                    if (existingEvents && existingEvents.length !== 0) {
                        res.status(409).send({
                            success: false,
                            message: `Blocked or Booked Event(s) already exists in the specified timeslot`
                        });
                    } else {
                        req.body.start = res.locals.start;
                        req.body.end = res.locals.end;
                        req.body.vessel = vesselFound._id;
                        req.body.eventType = 'BLOCKED';
                        req.body.modifiedBy = res.locals.user.id;
                        req.body.createdBy = res.locals.user.id;
                        const event = new this._eventModel(req.body);
                        const savedEvent = await event.save();
                        const events = [];
                        // @ts-ignore
                        if (vesselFound.blockedEvents && vesselFound.blockedEvents.length !== 0) {
                            // @ts-ignore
                            events.push(...vesselFound.blockedEvents);
                            events.push(savedEvent._id);
                        } else {
                            events.push(savedEvent._id);
                        }
                        const updatedVessel = await this._vesselModel.findByIdAndUpdate(req.params.vesselId, {blockedEvents: events}, {new: true}).select('title blockedEvents vesselBrand');
                        return res.status(200).send(updatedVessel);
                    }
                } else {
                    return res.status(401).send({
                        success: false,
                        message: "User not authorized to block event for the vessel."
                    }).end();
                }
            } else {
                return res.status(404).send({success: false, message: "Vessel not found."}).end();
            }
        } catch (err) {
            return res.status(500).send({
                success: false,
                message: `There was an error while blocking the timeslot ${err}`
            }).end();
        }
        return null
    }

    /**
     * Updates the blocked event by Id
     * @param {Request} req - Express request object
     * @param {Request} res - Express Response Object
     * */
    public async updateBlockedTimeslotById(req: Request, res: Response):Promise<any> {
        const eventId = req.params.eventId;

        try {
            const event = await this._eventModel.findOne({
                _id: eventId,
                eventType: 'BLOCKED'
            }).populate('vessel', 'title userId');
            // @ts-ignore
            const eventVesselId = event?.vessel._id.toString();
            if (event) {
                console.log(event);
                // @ts-ignore
                if (event?.vessel && event?.vessel?.userId && event?.vessel?.userId.toString() === res.locals.user.id) {
                    const startDate = res.locals.start;
                    const endDate = res.locals.end;
                    const existingEvents = await this._eventModel.find({
                        vessel: eventVesselId,
                        $or: [{start: {$gte: startDate}, end: {$lte: endDate}},
                            {start: {$lt: endDate}, end: {$gte: endDate}},
                            {end: {$gt: startDate}, start: {$lte: startDate}}]
                    });
                    // removing the event to be updated from existing events
                    const excludedExistingEvents = existingEvents.filter(ev => ev._id.toString() !== eventId);
                    console.log(excludedExistingEvents);
                    if (excludedExistingEvents && excludedExistingEvents.length !== 0) {
                        res.status(409).send({
                            success: false,
                            message: `Blocked or Booked Event(s) already exists in the specified timeslot`
                        })
                    } else {
                        const updatedEvent = await this._eventModel.findByIdAndUpdate(eventId, {
                            start: startDate,
                            end: endDate
                        }, {new: true});
                        return res.status(200).send(updatedEvent);
                    }
                } else {
                    return res.status(401).send({
                        success: false,
                        message: "User not allowed to modify the vessel."
                    }).end();
                }
            } else {
                return res.status(404).send({success: false, message: "Event not found."}).end();
            }
        } catch (err) {
            return res.status(500).send({
                success: false,
                message: `There was an error while blocking the timeslot ${err}`
            }).end();
        }
        return null
    }

    /**
     * Delete the blocked event by Id
     * @param {Request} req - Express request object
     * @param {Request} res - Express Response Object
     * */
    public async deleteBlockedTimeslotById(req: Request, res: Response) {
        const eventId = req.params.eventId;

        try {
            const event = await this._eventModel.findOne({
                _id: eventId,
                eventType: 'BLOCKED'
            }).populate('vessel', 'title userId blockedEvents');
            // @ts-ignore
            const eventVesselId = event?.vessel._id.toString();
            if (event) {
                // @ts-ignore
                if (event?.vessel && event?.vessel?.userId && event?.vessel?.userId.toString() === res.locals.user.id) {
                    const deletedEvent = await this._eventModel.findByIdAndDelete(eventId);
                    // @ts-ignore
                    if (event?.vessel?.blockedEvents && event?.vessel.blockedEvents.length !== 0) {
                        // @ts-ignore
                        const deletedEvents = event?.vessel?.blockedEvents.filter((vesselEventId: string) => vesselEventId.toString() !== eventId);
                        console.log(deletedEvents);
                        await this._vesselModel.findByIdAndUpdate(eventVesselId, {blockedEvents: deletedEvents});
                    }
                    return res.status(200).send({success: true, message: "Event Deleted"});
                } else {
                    return res.status(401).send({
                        success: false,
                        message: "User not allowed to modify the vessel."
                    }).end();
                }
            } else {
                return res.status(404).send({success: false, message: "Event not found."}).end();
            }
        } catch (err) {
            return res.status(500).send({
                success: false,
                message: `There was an error while blocking the timeslot ${err}`
            }).end();
        }
    }

    /**
     * Blocks the specified timeslot
     * @param {Request} req - Express request object
     * @param {Request} res - Express Response Object
     * */
    public async unBlockTimeslotsForVessel(req: Request, res: Response):Promise<any> {

        try {
            const vesselFound = await this._vesselModel.findById(req.params.vesselId);
            if (vesselFound) {
                const startDate = res.locals.start;
                const endDate = res.locals.end;
                // find all the blocked events for the given timeslot
                const existingEvents = await this._eventModel.find({
                    vessel: vesselFound._id,
                    eventType: 'BLOCKED',
                    $or: [{start: {$gte: startDate}, end: {$lte: endDate}},
                        {start: {$lt: endDate}, end: {$gte: endDate}},
                        {end: {$gt: startDate}, start: {$lte: startDate}}]
                });
                if (existingEvents && existingEvents.length !== 0) {
                    // @ts-ignore
                    if (existingEvents.some(e => e.vesselType === 'BOOKED')) {
                        res.status(409).send({
                            success: false,
                            message: "Cannot modify the timeslot with a Booked Event exists."
                        });
                    } else {
                        const eventsToDelete: any = [];
                        const eventsToAdd: any = [];
                        await Promise.all(existingEvents.map(async (event: any) => {
                            // if the event start and end date are the same as the event then delete the blocked event
                            if (event.start.getTime() >= startDate.getTime() && event.end.getTime() <= endDate.getTime()) {
                                eventsToDelete.push(event._id.toString());
                            } else if (event.start.getTime() < startDate.getTime() && event.end.getTime() > endDate.getTime()) {
                                // handling the case where the available timeslot will be spiting a blocked event
                                // event.start = endDate.toISOString();
                                let newEvent: any = {
                                    start: endDate.toISOString(),
                                    end: event.end.toISOString(),
                                    vessel: vesselFound._id,
                                    eventType: 'BLOCKED',
                                    modifiedBy: res.locals.user.id,
                                    createdBy: res.locals.user.id
                                };
                                const eventToAdd = new this._eventModel(newEvent);
                                const eventAdded = await eventToAdd.save();
                                eventsToAdd.push(eventAdded._id);
                                await this._eventModel.findByIdAndUpdate(event._id, {end: startDate.toISOString()}, {new: true});
                            } else if (event.start.getTime() < endDate.getTime() && event.end.getTime() >= endDate.getTime()) {
                                // event.start = endDate.toISOString();
                                await this._eventModel.findByIdAndUpdate(event._id, {start: endDate.toISOString()}, {new: true});
                            } else if (event.end.getTime() > startDate.getTime() && event.start.getTime() <= startDate.getTime()) {
                                // event.end = startDate.toISOString();
                                await this._eventModel.findByIdAndUpdate(event._id, {end: startDate.toISOString()}, {new: true});
                            }
                        }));
                        if (eventsToDelete && eventsToDelete.length !== 0 || eventsToAdd && eventsToAdd.length !== 0) {
                            let vesselEvents = [];
                            // @ts-ignore
                            if (vesselFound?.blockedEvents && vesselFound.blockedEvents.length !== 0) {
                                // @ts-ignore
                                vesselEvents = vesselFound?.blockedEvents;
                            }
                            if (eventsToDelete && eventsToDelete.length !== 0) {
                                await Promise.all(eventsToDelete.map(async (eventId: any) => {
                                    await this._eventModel.findByIdAndDelete(eventId);
                                }));
                                vesselEvents = vesselEvents.filter((vesselEventId: string) => !eventsToDelete.includes(vesselEventId.toString()));
                            }
                            vesselEvents.push(...eventsToAdd);
                            console.log('events to add', eventsToAdd);
                            // const finalEvents = vesselEvents.filter((vesselEventId: string) => !eventsToDelete.includes(vesselEventId.toString()));
                            // finalEvents.push(...eventsToAdd);
                            await this._vesselModel.findByIdAndUpdate(req.params.vesselId, {blockedEvents: vesselEvents});
                            res.status(200).send({success: true, message: `Events Updated`});
                        } else {
                            res.status(200).send({success: true, message: `Events Updated`});
                        }
                    }
                } else {
                    return res.status(200).send({success: true, message: "Timeslot already Available."});
                }
            } else {
                return res.status(404).send({success: false, message: "Vessel not found."}).end();
            }
        } catch (err) {
            return res.status(500).send({
                success: false,
                message: `There was an error while blocking the timeslot ${err}`
            }).end();
        }
        return null
    }

    /**
     * Check Vessel Availability
     * @param {Request} req - Express request object
     * @param {Request} res - Express Response Object
     * @param {NextFunction} next - Next function to call the next middleware
     * */
    public async checkVesselAvailability(req: Request, res: Response, next: NextFunction):Promise<any> {
        const vesselId = req.body.vesselId;
        const startDate = res.locals.start;
        const endDate = res.locals.end;
        const oneDay = new Date().getTime() + (1 * 24 * 60 * 60 * 1000)
        console.log('oneDay: ', oneDay);
        console.log('new Date().toLocaleDateString(): ', new Date());
        console.log('startDate: ', startDate);
        if (vesselId && startDate && endDate) {
            try {
                if (((endDate.getTime() - startDate.getTime()) / 604800000) <= 3) {
                    if (oneDay < startDate && oneDay < endDate) {
                        if (startDate < endDate) {
                            const vessel = await this._vesselModel.findById(vesselId);
                            res.locals.vessel = vessel;
                            // return res.status(200).send(vessel);

                            const diff = (endDate - startDate) / 3600000;
                            console.log('diff: ', diff)
                            console.log('endDate - startDate: ', endDate - startDate)
                            // @ts-ignore
                            if (diff >= vessel.vesselPricing.minimumHours) {

                                const existingEvents = await this._eventModel.find({
                                    vessel: vesselId,
                                    $or: [{start: {$gte: startDate}, end: {$lte: endDate}},
                                        {start: {$lt: endDate}, end: {$gte: endDate}},
                                        {end: {$gt: startDate}, start: {$lte: startDate}}]
                                });
                                if (existingEvents.length > 0) {
                                    return res.status(200).send({
                                        isBooked: true,
                                        message: 'Vessel is booked already'
                                    });
                                } else {
                                    //Hour day week / service 10% / minimum deposit
                                    let weeksCount = 0;
                                    let daysCount = 0;
                                    let hoursCount = 0;

                                    let hours = diff;

                                    if (hours >= 168) {
                                        weeksCount = Math.floor(hours / 168);
                                        hours -= (weeksCount * 168);
                                    }
                                    if (hours >= 24) {
                                        daysCount = Math.floor(hours / 24);
                                        hours -= (daysCount * 24);
                                    }
                                    if (hours < 24) {
                                        hoursCount = hours;
                                    }
                                    console.log('weeksCount: ', weeksCount);
                                    console.log('daysCount: ', daysCount);
                                    console.log('hoursCount: ', hoursCount);

                                    //Pricing Calc
                                    let totalForWeeks: number;
                                    let totalForDay: number;
                                    let totalForHour: number;
                                    let serviceFees: number;
                                    let totalWithoutServiceFees: number;
                                    let totalWithServiceFees: number;
                                    let tax:number

                                    // @ts-ignore
                                    totalForWeeks = weeksCount * vessel.vesselPricing.perWeek.amount;
                                    // @ts-ignore
                                    totalForDay = daysCount * vessel.vesselPricing.perDay.amount;
                                    // @ts-ignore
                                    totalForHour = hoursCount * vessel.vesselPricing.perHour.amount;
                                    //modify service fee: orignal 0.125 to 0.10
                                    totalWithoutServiceFees = totalForWeeks + totalForDay + totalForHour;
                                    serviceFees = Math.round((totalWithoutServiceFees * 0.10) * 100) / 100;
                                    totalWithServiceFees = totalWithoutServiceFees + serviceFees;
                                    // @ts-ignore
                                    // @ts-ignore
                                    res.locals.pricing = {
                                        isBooked: false,
                                        pricingDetails: {
                                            weeksCount: weeksCount,
                                            // @ts-ignore
                                            perWeekPrice: vessel.vesselPricing.perWeek.amount,
                                            totalForWeeks: totalForWeeks,
                                            daysCount: daysCount,
                                            // @ts-ignore
                                            perDayPrice: vessel.vesselPricing.perDay.amount,
                                            totalForDay: totalForDay,
                                            hoursCount: hoursCount,
                                            // @ts-ignore
                                            perHourPrice: vessel.vesselPricing.perHour.amount,
                                            totalForHour: totalForHour,
                                            // service fees of 12.5%
                                            serviceFees: serviceFees,
                                            // @ts-ignore
                                            minimumDeposit: vessel.vesselPricing.minimumDeposit,
                                            tax:Number(totalWithServiceFees * (13 / 100)),
                                            total:  totalWithServiceFees ,
                                            // total: totalWithServiceFees

                                        }
                                    };
                                    next();
                                }
                                console.log(res.locals.pricing)

                            } else {
                                return res.status(401).send({
                                    success: false,
                                    // @ts-ignore
                                    message: `Minimum Hours to book is ${vessel.vesselPricing.minimumHours}`
                                }).end();
                            }
                        } else {
                            return res.status(401).send({
                                success: false,
                                message: `End date should be greater than a than Start date`
                            }).end();
                        }
                    } else {
                        return res.status(401).send({
                            success: false,
                            message: `Start date and End date should be greater than a 24 hours`
                        }).end();
                    }
                } else {
                    return res.status(500).send({success: false, message: "Cannot book trip for more than 3 weeks."});
                }
            } catch (err) {
                return res.status(500).send({
                    success: false,
                    message: `${err}`
                }).end();
            }
        } else {
            return res.status(400).send({success: false, message: "VesselId, startDate or End Date not provided."}).end();
        }
        return null
    }

    public async getCheckAvailabilityResult(req: Request, res: Response) {
        if (res.locals.pricing) {
            return res.status(200).send(res.locals.pricing)
        } else {
            return res.status(500).send({
                success: false,
                message: `Error checking the vessel availability`
            })
        }
    }

    /**
     *  Book a Vessel
     * @param {Request} req - Express request object
     * @param {Request} res - Express Response Object
     * */
    public async bookVessel(req: Request, res: Response):Promise<any> {
        try {
            const vesselId = req.body.vesselId;
            const startDate = res.locals.start;
            const endDate = res.locals.end;
            const existingEvents = await this._eventModel.find({
                vessel: vesselId,
                $or: [{start: {$gte: startDate}, end: {$lte: endDate}},
                    {start: {$lt: endDate}, end: {$gte: endDate}},
                    {end: {$gt: startDate}, start: {$lte: startDate}}]
            });
            if (existingEvents.length > 0) {
                return res.status(200).send({isBooked: true});
            } else {
                req.body.start = startDate;
                req.body.end = endDate;

                const newModel = await new this._eventModel(req.body);
                newModel.save().then((model)=>{res.status(200).send(model)}).catch((err)=>{
                    res.status(500).send(err)
                })
            }
        } catch (err) {
            return res.status(500).send({success: false, message: `${err}`}).end();
        }
        return null
    }

    /**
     * Middleware to reset the seconds and milliseconds for date to 0
     * @param {Request} req - Express request object
     * @param {Request} res - Express Response Object
     * @param {NextFunction} next - Express next function to call the next method
     * */
    public resetSecondsAndMilliseconds(req: Request, res: Response, next: NextFunction) {
        if (req.body.start && req.body.end) {
            const startDate = new Date(req.body.start);
            const endDate = new Date(req.body.end);
            startDate.setSeconds(0, 0);
            endDate.setSeconds(0, 0);
            res.locals.start = startDate;
            res.locals.end = endDate;
            next();
        } else {
            res.status(400).send({success: false, message: "The start and/or end not provided."});
        }
    }

    /**
     * Get user booking history by user id
     * @param {Request} req - Express request object
     * @param {Request} res - Express Response Object
     * */
    public async getUserBookingHistory(req: Request, res: Response) {
        try {
            const id = req.params.userId;
            if (id) {
                const events = await this._eventModel.find({userDetails: id, eventType: 'BOOKED'})
                    .populate('userDetails', 'firstName lastName')
                    .populate('vessel', 'title vesselBrand vesselAddress vesselType');
                return res.status(200).send(events);
            } else {
                return res.status(500).send({success: false, message: 'User Id not provided.'});
            }
        } catch (error) {
            return res.status(500).send({
                success: false,
                message: `There was an error fetching the user history. ${error}`
            });
        }
    }
}
