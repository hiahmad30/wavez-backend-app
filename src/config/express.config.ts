import {Application} from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import compress from 'compression';
import cors from 'cors';
import UserRoute from "../api/routes/user.route";
import LoginRoute from '../api/routes/login.route';
import RentalsRoute from '../api/routes/rentals.route';
import StaysRoute from '../api/routes/stays.route';
import ChartersRoute from '../api/routes/charters.route';
import VesselRoute from '../api/routes/vessel.route';
import AdminPanelSettingsRoute from '../api/routes/admin-panel-settings.route';
import ConfigurationsRoute from "../api/routes/configurations.route";
import EventRoute from "../api/routes/event.route";
import FavouriteRoute from '../api/routes/favourite.route';
import DashboardRoute from '../api/routes/dashboard.route';
import {createServer} from "http";
import VesselModel from '../api/models/vessel.model';
import TruliooRoute from '../api/routes/trulioo.route';
import FaqRoute from "../api/routes/faq.route";
import ReportsRoute from "../api/routes/reports.route";
import TripRoute from '../api/routes/trip.route';
import ConversationsRoute from '../api/routes/conversations.route';
import MessagesRoute from '../api/routes/messages.route';
import ReviewsRoute from "../api/routes/reviews.route";
import NotificationsRoute from '../api/routes/notifications.route';
import ReportedPlacesRoute from "../api/routes/reportedPlaces.route";
import LiveNavigationRoute from "../api/routes/liveNavigation.route";
import TravelDestinationsRoute from "../api/routes/travelDestinations.route";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const swaggerUi = require('swagger-ui-express');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const swaggerDocument = require('../../swagger.json');
// const Event = require('../api/models/event.model');


export default class ExpressConfig {
    private app: Application;
    private server: any;
    private _vesselModel = VesselModel.getInstance().getModel();

    constructor() {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const express = require('express');
        // const https = require('https');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const path = require('path');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require('fs');
        this.app = express();
        this.server = createServer(this.app);


        // // @ts-ignore
        // const socket = io(process.env.SOCKET_BACKEND_URL);
        // // @ts-ignore
        // socket.on('connect', () => {
        //     console.log(`Wavez Backend Server Is connected on ${socket.id}`);
        // });
        // emitMessage(socket);
        //
        // function emitMessage(socket: Socket<DefaultEventsMap, DefaultEventsMap>) {
        //     socket.emit('private message', {my: 'data'});
        //     setTimeout(function () {
        //         emitMessage(socket)
        //     }, 1000);
        // }
        //
        // const changeStream = this._vesselModel.watch();
        //
        // changeStream.on('change', (change) => {
        //     console.log(change); // You could parse out the needed info and send only that data.
        //     socket.emit('vessel change', change);
        //     socket.emit('calender-check', process.env.BACKEND_SOCKET_SECRET_KEY);
        // }).on('error', (err: any) => {
        //     console.log('erro in change stream', err);
        // });


        //
        // io.on("connection", (socket: Socket) => {
        //     console.log('connected');
        // });

        if (process.env.NODE_ENV === 'development') {
            this.app.use(morgan('dev'));
        } else if (process.env.NODE_ENV === 'production') {
            this.app.use(compress());
        }

        this.app.use(bodyParser.urlencoded({extended: true}));

        this.app.use(bodyParser.json({limit: '10mb'}));
        this.app.use(cors());

        // serving swagger documents from swagger.json
        this.app.use("/api-docs.json", (req: any, res: { setHeader: (arg0: string, arg1: string) => void; send: (arg0: any) => void; }) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(swaggerDocument);
        });

        // initialize swagger using swagger.json file
        this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

        this.app.get('/', (req: any, res: { send: (arg0: string) => void; }) => {
            res.send('Wavez Backend Server is running...');
        })
        // const sslServer = https.createServer(
        //     {
        //         key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
        //         cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
        //     },
        //     this.app
        // )

        this.app.use('/api/users', new UserRoute().getRouter());

        this.app.use('/api', new LoginRoute().getRouter());
        this.app.use('/api/rentals', new RentalsRoute().getRouter());
        this.app.use('/api/stays', new StaysRoute().getRouter());
        this.app.use('/api/charters', new ChartersRoute().getRouter());
        this.app.use('/api/vessel', new VesselRoute().getRouter());
        this.app.use('/api/favourite', new FavouriteRoute().getRouter());
        this.app.use('/api/admin-panel-settings', new AdminPanelSettingsRoute().getRouter());
        this.app.use('/api/configuration', new ConfigurationsRoute().getRouter());
        this.app.use('/api/event', new EventRoute().getRouter());
        this.app.use('/api/dashboard', new DashboardRoute().getRouter());
        this.app.use('/api/docv', new TruliooRoute().getRouter());
        this.app.use('/api/faq', new FaqRoute().getRouter());
        this.app.use('/api/reports', new ReportsRoute().getRouter());
        this.app.use('/api/trip', new TripRoute().getRouter());
        this.app.use('/api/reviews', new ReviewsRoute().getRouter());
        this.app.use('/api/conversations', new ConversationsRoute().getRouter());
        this.app.use('/api/messages', new MessagesRoute().getRouter());
        this.app.use('/api/notifications', new NotificationsRoute().getRouter());
        this.app.use('/api/reportedPlaces', new ReportedPlacesRoute().getRouter());
        this.app.use('/api/liveNavigation', new LiveNavigationRoute().getRouter());
        this.app.use('/api/travelDestinations', new TravelDestinationsRoute().getRouter());

        // server.listen(5000, () => console.log(`Secure server 🚀🔑 on port ${5000}`));
    }

    public getApp() {
        return this.server;
    }
}
