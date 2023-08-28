import {Application} from 'express';
import supertest from 'supertest';
import ChartersRoute from './charters.route';
import ExpressConfig from "../../config/express.config";
import mongoose from 'mongoose';

describe('ChartersRoute', function () {
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

    let postCharterResponse: any = {};
    it('POST /charters', async () => {
        postCharterResponse = await request
            .post('/api/charters')
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})
            .send({
                numberOfPassengers: 1,
                vesselLocation: {
                    longitude: "-79.37627669999999",
                    latitude: "43.65076579999999"
                },
                destinationLocation: [
                    {
                        latitude: "43.6499823",
                        longitude: "-79.3763585"
                    }
                ],
                vesselAddress: {
                    street: "13 Toronto St",
                    postalCode: "M5C 2R1",
                    city: "Toronto",
                    countryCode: "CA",
                    country: "Canada",
                    province: "Ontario"
                },
                rawAddress: "13 Toronto Street, Toronto, ON, Canada",
                destinationAddress: [
                    {
                        street: "10 Toronto St",
                        postalCode: "M5C 2B7",
                        city: "Toronto",
                        countryCode: "CA",
                        country: "Canada",
                        province: "Ontario",
                        rawAddress: "10 Toronto Street, Toronto, ON, Canada"
                    }
                ],
                title: "Unit Testing Charter",
                vesselYear: 2021,
                vesselType: "CHARTER",
                vesselCategory: [
                    "6094280d0103971836d61420",
                    "609428140103971836d61421",
                    "609428210103971836d61423"
                ]
            })

        // console.log(getStaysResponse.body);

        expect(postCharterResponse.status).toEqual(200)
    });

    it('GET /charters/:id', async () => {
        const response = await request
            .get(`/api/charters/${postCharterResponse.body._id}`)
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})

        // console.log(getStaysResponse.body);

        expect(response.status).toEqual(200)
    });

    it('GET /charters', async () => {

        const response = await request
            .get('/api/charters')
            .expect(200)

        // console.log(getStaysResponse.body);

        expect(response.body).toBeDefined();
        expect(response.status).toEqual(200);
    });

    it('PUT /charters/:id', async () => {
        const response = await request
            .put(`/api/charters/${postCharterResponse.body._id}`)
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})
            .send({
                numberOfPassengers: 1,
                vesselLocation: {
                    longitude: "-79.37627669999999",
                    latitude: "43.65076579999999"
                },
                destinationLocation: [
                    {
                        latitude: "43.6499823",
                        longitude: "-79.3763585"
                    }
                ],
                vesselAddress: {
                    street: "13 Toronto St",
                    postalCode: "M5C 2R1",
                    city: "Toronto",
                    countryCode: "CA",
                    country: "Canada",
                    province: "Ontario"
                },
                rawAddress: "13 Toronto Street, Toronto, ON, Canada",
                destinationAddress: [
                    {
                        street: "10 Toronto St",
                        postalCode: "M5C 2B7",
                        city: "Toronto",
                        countryCode: "CA",
                        country: "Canada",
                        province: "Ontario",
                        rawAddress: "10 Toronto Street, Toronto, ON, Canada"
                    }
                ],
                title: "Unit Testing Charter Update",
                vesselYear: 2020,
                vesselType: "CHARTER",
                vesselCategory: [
                    "6094280d0103971836d61420",
                    "609428140103971836d61421",
                    "609428210103971836d61423"
                ]
            })

        // console.log(getStaysResponse.body);

        expect(response.status).toEqual(200)
    });

    it('DELETE /charters/:id', async () => {
        const response = await request
            .delete(`/api/charters/${postCharterResponse.body._id}`)
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})

        // console.log(getStaysResponse.body);

        expect(response.status).toEqual(200)
    });

    afterAll(() => mongoose.disconnect());
});
