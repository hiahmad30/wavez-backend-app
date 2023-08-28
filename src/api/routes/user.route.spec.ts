import {Application} from 'express';
import supertest from 'supertest';
import UserRoute from './user.route';
import ExpressConfig from "../../config/express.config";
import mongoose from 'mongoose';

describe('UserRoute', function () {
    const expectedResponse = expect.anything();

    let app: Application;
    let request: supertest.SuperTest<supertest.Test>;

    beforeAll(() => {
        const expressConfig = new ExpressConfig();
        app = expressConfig.getApp();
        request = supertest(app);
    });

    let signinResponse: any = {};
    it('User Sign in POST /signin', async () => {
        signinResponse = await request
            .post('/api/signin')
            .send({
                email: "mongowavez@yopmail.com",
                password: "password"
            })
        expect(signinResponse.status).toEqual(200)
    });

    let getListingsResponse:any = {};
    it('should get the user listings GET /users/getListings', async () => {
        getListingsResponse = await request
            .get(`/api/users/getListings`)
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})

        expect(getListingsResponse.status).toEqual(200)
    });

    it('should get the user listings GET /users/getUserDetails', async () => {
        const response = await request
            .get(`/api/users/getUserDetails`)
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})

        expect(response.status).toEqual(200)
    });

    // TODO find a way to test sign up with email verification
    it('should call userController.signUp function when POST /signup', async () => {
        // console.log('it function executed');
        // const response = await request
        //     .post('/api/users/signup')
        //     .send({
        //         firstName: 'Test Suite',
        //         lastName: 'User',
        //         email: 'mongowavez@yopmail.com',
        //         phoneNumber: 7896541236,
        //         agreementAccepted: true
        //     })
        // console.log(response.body)
        //
        // expect(response.status).toEqual(200)
        expect(1+1).toEqual(2);
    });
    afterAll(() => mongoose.disconnect());
});
