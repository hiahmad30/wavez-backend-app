import {Application} from 'express';
import supertest from 'supertest';
import VesselRoute from './vessel.route';
import ExpressConfig from "../../config/express.config";
import mongoose from 'mongoose';


describe('VesselRoute', function () {
    const expectedResponse = expect.anything();

    let app: Application;
    let request: supertest.SuperTest<supertest.Test>;

    beforeAll(() => {
        const expressConfig = new ExpressConfig();
        app = expressConfig.getApp();
        request = supertest(app);
    });

    let signinResponse: any = {};
    it('POST /signin', async () => {
        signinResponse = await request
            .post('/api/signin')
            .send({
                email: "admin@wavez.ca",
                password: "W@v35!2021"
            })

        expect(signinResponse.status).toEqual(200)
    });

    let postCategoryResponse: any = {};
    it('POST /api/vessel/category', async () => {
        postCategoryResponse = await request
            .post('/api/vessel/category')
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})
            .send({
                    name: "Unit Test Category",
                    isRental: true,
                    isCharter: true,
                    isStay: true,
                    isProofOfId: true,
                    isVesselDriversLicense: true,
                    isVesselLicense: true,
                    isVesselSafety: true,
                    isInsurance: true,
                    isVisible: true,
                    isSerialNumber: true
                }
            );

        expect(postCategoryResponse.status).toEqual(200)
    });

    it('GET /category', async () => {
        const response = await request
            .get('/api/vessel/category')
            .expect(200)

        // console.log(response.body);

        expect(response.body).toBeDefined();
        expect(response.body.length).toBeGreaterThan(0);
    });

    let postFeatureResponse: any = {};
    it('POST /api/vessel/feature', async () => {
        postFeatureResponse = await request
            .post('/api/vessel/feature')
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})
            .send({
                feature: "Unit Testing Feature",
                iconURL: "string",
                isVisible: true
            })

        expect(postFeatureResponse.status).toEqual(200)
    });

    it('GET /feature',  async() => {
        const response = await request
            .get('/api/vessel/feature')
            .expect(200)
        // console.log(response.body);

        expect(response.body).toBeDefined();
        expect(response.body.length).toBeGreaterThan(0);
    });
    afterAll(() => mongoose.disconnect());
});
