import AbstractRoute from './abstractRoute.route';
import MessagesController from '../controllers/messages.controller';
import UploadController from '../controllers/upload.controller';

export default class MessagesRoute extends AbstractRoute {
    private _messagesController = new MessagesController();
    private _uploadController = new UploadController();
    constructor() {
        super();
        //Post Message
        this.getRouter().post('/save', this.loginController.verifyToken, this._messagesController.saveMessage.bind(this._messagesController));
        //Post Image Message
        this.getRouter().post('/uploadImage', this.loginController.verifyToken, this._uploadController.uploadMessageImage.bind(this._uploadController));
        //Get Message By Conversation Id
        this.getRouter().get('/:conversationId', this.loginController.verifyToken, this._messagesController.getMessagesByConversationId.bind(this._messagesController));
    }
}
