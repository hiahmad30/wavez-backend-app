import {Application} from 'express';
import supertest from 'supertest';
import StaysRoute from './stays.route';
import ExpressConfig from "../../config/express.config";
import mongoose from 'mongoose';

describe('LoginRoute', function () {

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
                email: "admin@wavez.ca",
                password: "W@v35!2021"
            })
        expect(signinResponse.status).toEqual(200)
    });

    let postConfigurationResponse: any = {};
    it('should POST a new configuration POST /configuration', async () => {
        postConfigurationResponse = await request
            .post('/api/configuration')
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})
            .send({
                key: "HOME_HERO_TEXT",
                stringValue: "Test Value",
                booleanValue: true,
                numberValue: 0
            });

        expect(postConfigurationResponse.status).toEqual(200);
        expect(postConfigurationResponse.body.key).toEqual("HOME_HERO_TEXT");
    });

    it('should GET all configurations GET /configuration', async () => {
        const getConfigResponse = await request
            .get('/api/configuration')
            .set({Accept: 'application/json'});

        expect(getConfigResponse.status).toEqual(200);
        expect(getConfigResponse.body).toBeDefined();
        expect(getConfigResponse.body.length).toBeGreaterThan(0);
    });

    it('should GET configuration by key GET /configuration/:key', async () => {
        const getConfigByKeyResponse = await request
            .get("/api/configuration/HOME_HERO_TEXT")
            .set({Accept: 'application/json'});

        expect(getConfigByKeyResponse.status).toEqual(200);
        expect(getConfigByKeyResponse.body).toBeDefined();
        expect(getConfigByKeyResponse.body.key).toEqual("HOME_HERO_TEXT");
    });

    it('should UPDATE configuration by key PUT /configuration/:key', async () => {
        const updateConfigByKeyResponse = await request
            .put('/api/configuration/HOME_HERO_TEXT')
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})
            .send({
                key: "HOME_HERO_TEXT",
                stringValue: "Updated Test Value",
                booleanValue: true,
                numberValue: 0
            });

        expect(updateConfigByKeyResponse.status).toEqual(200);
        expect(updateConfigByKeyResponse.body).toBeDefined();
        expect(updateConfigByKeyResponse.body.key).toEqual("HOME_HERO_TEXT");
        expect(updateConfigByKeyResponse.body.stringValue).toEqual("Updated Test Value");
    });

    it('should DELETE configuration by key DELETE /configuration/:key', async () => {
        const updateConfigByKeyResponse = await request
            .delete('/api/configuration/HOME_HERO_TEXT')
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'});

        expect(updateConfigByKeyResponse.status).toEqual(200);
    });

    afterAll(() => mongoose.disconnect());
});
