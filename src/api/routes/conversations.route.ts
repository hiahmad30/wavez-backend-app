import AbstractRoute from './abstractRoute.route';
import ConversationsController from '../controllers/conversations.controller';

export default class ConversationsRoute extends AbstractRoute {
    private _conversationsController = new ConversationsController();

    constructor() {
        super();
        //Post Conversation
        this.getRouter().post('/save', this.loginController.verifyToken, this._conversationsController.createConversation.bind(this._conversationsController))
        this.getRouter().put('/hide/:id', this.loginController.verifyToken, this._conversationsController.hideConversation.bind(this._conversationsController))
        //Get Conversation By User Id from Token
        this.getRouter().get('/getConversationByUserId', this.loginController.verifyToken, this._conversationsController.getConversationByUserId.bind(this._conversationsController))
        this.getRouter().put('/seenChange', this.loginController.verifyToken, this._conversationsController.changeSeenStatus.bind(this._conversationsController))
        //Delete Conv By Conversation Id
        this.getRouter().delete('/:id', this.loginController.verifyToken, this._conversationsController.deleteConversation.bind(this._conversationsController))

    }
}
