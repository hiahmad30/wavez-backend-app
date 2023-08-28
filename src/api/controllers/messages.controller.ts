import {Request, Response} from 'express';
import MessageModel from '../models/message.model';
import ConversationModel from '../models/conversation.model';
import NotificationsModel from '../models/notifications.model';
import axios from 'axios';
import UserModel from '../models/user.model';


export default class MessagesController {
    private _messageModel = MessageModel.getInstance().getModel();
    private _conversationModel = ConversationModel.getInstance().getModel();
    private _notificationsModel = NotificationsModel.getInstance().getModel();
    private _userModel = UserModel.getInstance().getModel();

    constructor() {

    }

    public async saveMessage(req: Request, res: Response) {
        const userId = res.locals.user.id;
        const token = process.env.ONE_SIGNAL_KEY;
        try {
            const newModel = new this._messageModel({
                conversationId: req.body.conversationId,
                user: userId,
                text: req.body.text,
                imageUrl: req.body.imageUrl
            });
            const savedMessage = await newModel.save();
            const conv = await this._conversationModel.findById(req.body.conversationId);

            const sender = await this._userModel.findById(userId);
            const receiver = await this._userModel.findById(req.body.receiverId);
            // @ts-ignore
            if (receiver && receiver?.playerIds.length > 0) {
                // @ts-ignore
                console.log(" receiver.playerIds: ", receiver.playerIds)
                await axios.post(
                    `https://onesignal.com/api/v1/notifications`
                    , {
                        // @ts-ignore
                        include_player_ids: receiver.playerIds,
                        app_id: process.env.APP_ID,
                        priority: 9,
                        headings: {en: `${sender?.firstName ? sender?.firstName : ''} ${sender?.lastName ? sender?.lastName : ''}`},
                        contents: {en: req.body.text},
                        small_icon: "ic_notification_smallicon",
                        title:{en: `${sender?.firstName ? sender?.firstName : ''} ${sender?.lastName ? sender?.lastName : ''}`},
                        data: {type: "message"}
                    },
                    {
                        headers: {
                            authorization: "Basic " + token
                        }
                    });
            }

            if (conv) {
                // @ts-ignore
                const index = await conv.hasMessages.findIndex(m => m.user.toString() === req.body.receiverId.toString());
                // @ts-ignore
                if (conv.hasMessages[index].seen) {
                    // @ts-ignore
                    conv.hasMessages[index].seen = false;
                    // @ts-ignore
                    const hasMessages = conv.hasMessages;
                    await this._conversationModel.findByIdAndUpdate(req.body.conversationId, {hasMessages: hasMessages});
                    // const notification = await this._notificationsModel.findOne({user: userId});
                    // // @ts-ignore
                    // await this._notificationsModel.findOneAndUpdate({user: req.body.receiverId}, {
                    //     // @ts-ignore
                    //     user: conv.members.find(m => m.toString() === req.body.receiverId.toString()),
                    //     // @ts-ignore
                    //     conversations: notification.conversations ? notification.conversations + 1 : 1,
                    //     // @ts-ignore
                    //     listings: notification.listings ? notification.listings : 0,
                    //     // @ts-ignore
                    //     trips: notification.trips ? notification.trips : 0,
                    //     // @ts-ignore
                    //     reports: notification.reports ? notification.reports : 0,
                    //     // @ts-ignore
                    //     verificationsVessel: notification.verificationsVessel ? notification.verificationsVessel : 0,
                    //     // @ts-ignore
                    //     verificationsBoat: notification.verificationsBoat ? notification.verificationsBoat : 0,
                    // }, {upsert: true});
                }
            }
            return res.status(200).send(savedMessage);
        } catch (error) {
            console.log('error: ', error)
            return res.status(500).send(error);
        }
    }

    public async getMessagesByConversationId(req: Request, res: Response) {
        try {
            const messages = await this._messageModel.find({conversationId: req.params.conversationId}).populate('user', 'firstName lastName profileImageUrl');
            return res.status(200).send(messages);
        } catch (error) {
            return res.status(500).send(error);
        }
    }
}
