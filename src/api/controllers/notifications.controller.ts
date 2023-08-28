import {Request, Response} from 'express';
import ConversationModel from '../models/conversation.model';
import BaseController from './base.controller';
import NotificationsModel from '../models/notifications.model';
import axios from 'axios';
import UserModel from '../models/user.model';


export default class NotificationsController extends BaseController {
    private _notificationsModel = NotificationsModel.getInstance().getModel();
    private _userModel = UserModel.getInstance().getModel();

    constructor() {
        super(ConversationModel.getInstance().getModel());
    }

    public async createOrUpdateNotifications(req: Request, res: Response) {
        const userId = req.params.userId ? req.params.userId : res.locals.user.id;
        console.log('userId: ', userId);
        try {
            const updatedOrSaved = await this._notificationsModel.findOneAndUpdate({user: userId}, req.body, {upsert: true});
            return res.status(200).send(updatedOrSaved);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    }

    public async findByUserIdNotifications(req: Request, res: Response) {
        const userId = req.params.userId;
        try {
            const foundNotification = await this._notificationsModel.findOne({user: userId ? userId : res.locals.user.id}, req.body, {upsert: true});
            return res.status(200).send(foundNotification);
        } catch (error) {
            return res.status(500).send(error);
        }
    }

    public async sendNotificationToAllUsers(req: Request, res: Response) {
        try {
            const {data} = await axios.post(
                `https://onesignal.com/api/v1/notifications`
                , {
                    included_segments: [
                        "Subscribed Users"
                    ],
                    app_id: process.env.APP_ID,
                    headings: {en: req.body.headings},
                    small_icon: "ic_notification_smallicon",
                    title: {en: req.body.headings},
                    contents: {en: req.body.contents}
                },
                {
                    headers: {
                        authorization: "Basic " + process.env.ONE_SIGNAL_KEY
                    }
                });
            return res.status(200).send(data);
        } catch (e) {
            return res.status(500).send(e);
        }
    }

    public async sendNotificationToCallUser(req: Request, res: Response) {
        try {
            const receiver = await this._userModel.findById(req.body.receiverId);
            const sender = await this._userModel.findById(res.locals.user.id);
            let {data} = await axios.post(
                `https://onesignal.com/api/v1/notifications`
                , {
                    // @ts-ignore
                    include_player_ids: receiver.playerIds,
                    app_id: process.env.APP_ID,
                    headings: {en: req.body.headings},
                    title: {en: req.body.headings},
                    contents: {en: req.body.contents},
                    buttons: req.body.additionalDataOne.buttons,
                    priority: 7,
                    small_icon: "ic_notification_smallicon",
                    ios_sound: req.body.additionalDataOne.iosSound,
                    android_sound: req.body.additionalDataOne.androidSound,
                    huawei_sound: req.body.additionalDataOne.androidSound,
                    collapse_id: req.body.additionalDataOne.type,
                    data: {
                        sender: {
                            socketId: req.body.socketId,
                            userId: req.body.userId,
                            // @ts-ignore
                            profileImage: sender.profileImageUrl,
                            roomId: req.body.roomId,
                            additionalDataOne: {
                                type: 'calling'
                            },
                            additionalDataTwo: req.body.additionalDataTwo,
                            additionalDataThree: req.body.additionalDataThree,
                            additionalDataFour: req.body.additionalDataFour,
                            additionalDataFive: req.body.additionalDataFive,
                        }
                    }
                },
                {
                    headers: {
                        authorization: "Basic " + process.env.ONE_SIGNAL_KEY
                    }
                });
            
            return res.status(200).send(data);
        } catch (e) {
            console.log(e)
            return res.status(500).send(e);
        }
    }

    public async sendNotificationTwentyFourTripUser(req: Request, res: Response) {
        try {
            let {data} = await axios.post(
                `https://onesignal.com/api/v1/notifications`
                , {
                    include_player_ids: req.body.receiver.playerIds,
                    app_id: process.env.APP_ID,
                    headings: {en: req.body.headings},
                    title: {en: req.body.headings},
                    small_icon: "ic_notification_smallicon",
                    contents: {en: req.body.contents}
                },
                {
                    headers: {
                        authorization: "Basic " + process.env.ONE_SIGNAL_KEY
                    }
                });
            return res.status(200).send(data);
        } catch (e) {
            return res.status(500).send(e);
        }
    }

}
