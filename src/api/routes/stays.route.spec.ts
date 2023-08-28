import {Application} from 'express';
import supertest from 'supertest';
import StaysRoute from './stays.route';
import ExpressConfig from "../../config/express.config";
import mongoose from 'mongoose';

describe('StaysRoute', function () {
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
                email: "mongowavez@yopmail.com",
                password: "password"
            })
        expect(signinResponse.status).toEqual(200)
    });

    let postStayResponse: any = {};
    it('POST /stays', async () => {
        postStayResponse = await request
            .post('/api/stays')
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})
            .send({
                numberOfPassengers: 4,
                vesselYear: 2314,
                vesselLocation: {
                    longitude: "-77.0368707",
                    latitude: "38.9071923"
                },
                vesselAddress: {
                    street: null,
                    postalCode: null,
                    city: "Washington",
                    countryCode: "US",
                    country: "United States",
                    province: "District of Columbia"
                },
                rawAddress: "Washington D.C., DC, USA",
                title: "Test Suite Update",
                vesselType: "STAY",
                vesselCategory: [
                    "609428050103971836d6141f",
                    "6094280d0103971836d61420"
                ],
                numberOfBathrooms: 2,
                numberOfKitchens: 2,
                numberOfBeds: 2
            })

        // console.log(getStaysResponse.body);

        expect(postStayResponse.status).toEqual(200)
    });

    it('GET /stays/:id', async () => {
        const response = await request
            .get(`/api/stays/${postStayResponse.body._id}`)
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})

        // console.log(getStaysResponse.body);

        expect(response.status).toEqual(200)
    });

    it('GET /stays', async () => {

        const response = await request
            .get('/api/stays')
            .expect(200)

        // console.log(getStaysResponse.body);

        expect(response.body).toBeDefined();
        expect(response.status).toEqual(200);
    });

    it('PUT /stays/:id', async () => {
        const response = await request
            .put(`/api/stays/${postStayResponse.body._id}`)
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})
            .send({
                numberOfPassengers: 4,
                vesselYear: 2314,
                vesselLocation: {
                    longitude: "-77.0368707",
                    latitude: "38.9071923"
                },
                vesselAddress: {
                    street: null,
                    postalCode: null,
                    city: "Washington",
                    countryCode: "US",
                    country: "United States",
                    province: "District of Columbia"
                },
                rawAddress: "Washington D.C., DC, USA",
                title: "Test Suite",
                vesselType: "STAY",
                vesselCategory: [
                    "609428050103971836d6141f",
                    "6094280d0103971836d61420"
                ],
                numberOfBathrooms: 3,
                numberOfKitchens: 2,
                numberOfBeds: 2
            })

        // console.log(getStaysResponse.body);

        expect(response.status).toEqual(200)
    });

    it('DELETE /stays/:id', async () => {
        const response = await request
            .delete(`/api/stays/${postStayResponse.body._id}`)
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})

        // console.log(getStaysResponse.body);

        expect(response.status).toEqual(200)
    });

    afterAll(() => mongoose.disconnect());
});
