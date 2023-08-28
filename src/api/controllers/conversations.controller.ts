import {Request, Response} from 'express';
import ConversationModel from '../models/conversation.model';
import BaseController from './base.controller';
import NotificationsModel from '../models/notifications.model';


export default class ConversationsController extends BaseController {
    private _conversationModel = ConversationModel.getInstance().getModel();
    private _notificationsModel = NotificationsModel.getInstance().getModel();

    constructor() {
        super(ConversationModel.getInstance().getModel());
    }

    public async createConversation(req: Request, res: Response) {
        try {
            const foundConversation = await this._conversationModel.findOne({members: req.body.members});
            console.log("foundConversation: ", foundConversation);
            if (!foundConversation) {
                req.body.hidden = false;
                const newModel = new this._conversationModel(req.body);
                const savedConversation = await newModel.save();
                return res.status(200).send(savedConversation);
            } else {
                // @ts-ignore
                await this._conversationModel.findByIdAndUpdate(foundConversation._id, {hidden: false}, {upsert: true});
                return res.status(200).send(foundConversation);
            }

        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    }

    public async hideConversation(req: Request, res: Response) {
        try {
            const id = req.params.id
            // @ts-ignore
            const updated = await this._conversationModel.findByIdAndUpdate(id, {hidden: true}, {upsert: true});
            return res.status(200).send(updated);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    }

    public async changeSeenStatus(req: Request, res: Response) {
        try {
            const conv = await this._conversationModel.findById(req.body.conversationId);
            console.log('conv: ', conv);
            if (conv) {
                // @ts-ignore
                const index = await conv.hasMessages.findIndex((o: { user: any; }) => o.user.toString() === res.locals.user.id.toString());
                // @ts-ignore
                if (!conv.hasMessages[index].seen) {
                    // @ts-ignore
                    conv.hasMessages[index].seen = true;
                    // @ts-ignore
                    const hasMessages = conv.hasMessages;
                    const updatedConv = await this._conversationModel.findByIdAndUpdate(req.body.conversationId, {hasMessages: hasMessages});
                    // @ts-ignore
                    const hasMessages = conv.hasMessages;
                    await this._conversationModel.findByIdAndUpdate(req.body.conversationId, {hasMessages: hasMessages});
                    // const notification = await this._notificationsModel.findOne({user: res.locals.user.id});
                    // await this._notificationsModel.findOneAndUpdate({user: res.locals.user.id}, {
                    //     user: res.locals.user.id,
                    //     @ts-ignore
                        // conversations: notification.conversations ? notification.conversations - 1 : 0
                    // }, {upsert: true});
                    return res.status(200).send(updatedConv);
                } else {
                    return res.status(200).send({message: 'Conversation Seen True'});
                }
            } else {
                return res.status(200).send({message: 'Conversation Not Found'});
            }
        } catch (error) {
            return res.status(500).send(error);
        }
    }


    public async deleteConversation(req: Request, res: Response) {
        super.delete(req, res);
    }

    public async getConversationByUserId(req: Request, res: Response) {
        const userId = res.locals.user.id;
        try {
            const conversation = await this._conversationModel.find({
                members: {$in: [userId]},
                hidden: false
            }).populate('members', 'firstName lastName profileImageUrl');
            return res.status(200).send(conversation);
        } catch (error) {
            console.log(error)
            return res.status(500).send(error);
        }
    }
}
