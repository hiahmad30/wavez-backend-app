import {Application} from 'express';
import supertest from 'supertest';
import RentalsRoute from './rentals.route';
import ExpressConfig from "../../config/express.config";
import mongoose from 'mongoose';

describe('RentalsRoute', function () {
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

    let postRentalResponse: any = {};
    it('POST /rentals', async () => {
        postRentalResponse = await request
            .post('/api/rentals')
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})
            .send({
                numberOfPassengers: 1,
                rawAddress: "12 Toronto Street, Toronto, ON, Canada",
                title: "Unit Test",
                vesselAddress: Object,
                city: "Toronto",
                country: "Canada",
                countryCode: "CA",
                postalCode: "M5C 2V6",
                province: "Ontario",
                street: "12 Toronto St",
                vesselCategory: [
                "6094280d0103971836d61420",
                "6094281b0103971836d61422",
                "609428140103971836d61421"
                ],
                vesselLocation: {
                    latitude: "43.6501121",
                    longitude: "-79.37614839999999"
                },
                vesselType: "RENTAL",
                vesselYear: 2021
            })

        // console.log(getStaysResponse.body);

        expect(postRentalResponse.status).toEqual(200)
    });

    it('GET /rentals/:id', async () => {
        const response = await request
            .get(`/api/rentals/${postRentalResponse.body._id}`)
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})

        // console.log(getStaysResponse.body);

        expect(response.status).toEqual(200)
    });

    it('GET /rentals', async () => {

        const response = await request
            .get('/api/rentals')
            .expect(200)

        // console.log(getStaysResponse.body);

        expect(response.body).toBeDefined();
        expect(response.status).toEqual(200);
    });

    it('PUT /rentals/:id', async () => {
        const response = await request
            .put(`/api/rentals/${postRentalResponse.body._id}`)
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})
            .send({
                numberOfPassengers: 1,
                rawAddress: "12 Toronto Street, Toronto, ON, Canada",
                title: "Unit Test Update",
                vesselAddress: Object,
                city: "Toronto",
                country: "Canada",
                countryCode: "CA",
                postalCode: "M5C 2V6",
                province: "Ontario",
                street: "12 Toronto St",
                vesselCategory: [
                    "6094280d0103971836d61420",
                    "6094281b0103971836d61422",
                    "609428140103971836d61421"
                ],
                vesselLocation: {
                    latitude: "43.6501121",
                    longitude: "-79.37614839999999"
                },
                vesselType: "RENTAL",
                vesselYear: 2020
            })

        // console.log(getStaysResponse.body);

        expect(response.status).toEqual(200)
    });

    it('DELETE /rentals/:id', async () => {
        const response = await request
            .delete(`/api/rentals/${postRentalResponse.body._id}`)
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})

        // console.log(getStaysResponse.body);

        expect(response.status).toEqual(200)
    });

    afterAll(() => mongoose.disconnect());
});
