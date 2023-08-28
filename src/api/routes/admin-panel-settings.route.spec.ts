import {Application} from 'express';
import supertest from 'supertest';
import ExpressConfig from "../../config/express.config";
import AdminPanelSettingsRoute from './admin-panel-settings.route';
import mongoose from 'mongoose';

describe('AdminPanelSettingsRoute', function () {
    const expectedResponse = expect.anything();

    let app: Application;
    let request: supertest.SuperTest<supertest.Test>;

    beforeAll(() => {
        const expressConfig = new ExpressConfig();
        app = expressConfig.getApp();
        request = supertest(app);
    });

    it('GET /availability', async () => {

        const response = await request
            .get('/api/admin-panel-settings/availability')
            .expect(200)

        // console.log(response.body);

        expect(response.body).toBeDefined();
        // expect(response.body.length).toBeGreaterThan(0);
    });

    it('GET /add-listing', async () => {

        const response = await request
            .get('/api/admin-panel-settings/add-listing')
            .expect(200)

        // console.log(response.body);

        expect(response.body).toBeDefined();
    });

    afterAll(() => mongoose.disconnect());
});
