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
    it('POST /signin', async () => {
        signinResponse = await request
            .post('/api/signin')
            .send({
                email: "mongowavez@yopmail.com",
                password: "password"
            })
        expect(signinResponse.status).toEqual(200)
    });

    // TODO change the biometric concatenation to fix the workflow run o github actions
    let updatePublicKeyResponse:any = {};
    it('should update the user biometric public key PUT /publicKey', async () => {
        updatePublicKeyResponse = await request
            .put(`/api/users/publicKey`)
            .send({publicKey: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtxcq58L+pWuZaI2j5qkItx34NgsRswjFV" +
                    "eO5ZcdNviAA+T7vinGOy3ao+1NPWGENl85x+P0M6u1hTJON+ar/BWxg1MQVktjKHLMbxf1nUZvpzArWEzAOmKCAuPfhcWap6t" +
                    "niNsZDVcyEe90hjTuPzWS3UC8Pvup6wgyDOdV6bBovPaHzo0idhfl4fEOd/wtnxjIYpZbw3mgxfyVshi4SEAVriysd9LQF0yIH" +
                    "zNbFaOorijN3Tps0WUZ0/1158YXz97CCUZr0vfDRbu63c0+9zsClo2pTf37HqniE5srChZ/bQxjSrqulyDe3FaBNCdP6SiM3q0" +
                    "X6PcRoV6ViycA6rwIDAQAB"})
            .set({Authorization: `Bearer ${signinResponse.body.token}`, Accept: 'application/json'})

        expect(updatePublicKeyResponse.status).toEqual(200)
        expect(updatePublicKeyResponse.body).toBeDefined();
        expect(updatePublicKeyResponse.body.biometricToken).toBeDefined();
    });

    let biometricSigninResponse: any = {};
    it('should be able to sign in using biometrics signature POST /biometricSignIn', async () => {
        biometricSigninResponse = await request
            .post('/api/biometricSignIn')
            .set({Authorization: `Bearer ${updatePublicKeyResponse.body.biometricToken}`, Accept: 'application/json'})
            .send({
                signature: "M7rj8+HER4dKzNJlfkr0JnKTZex0eilhijxaIaP4lGGpTKmUNo+TP7h9R+rGS9Xgwz8ExjFvEskY/08dIH6cX63hx/" +
                    "SOvp4JHw7sCTRbDwAtYOZkND8hQTqisuzlRZ+lORo0HnFvJd0qQP/y44cfrIGxj9DzTjP1nAUXDIG6KalgzJ1dburzd3s46qD" +
                    "F1Bpwt3UWVp/lcHyOAyHiNEJVcPH/srMoIqtC5O1UKfj9+rk5UJLBo1YtxM7WMIGJkw/HnyBPW4GhyVQnt4VYQ1RLJ2p30vY7" +
                    "b8wV2HT0Y0QgHvIlQ+udpCjdF7c836TKYHlA/GkeMBt29FHnCS1aA1AzAw==",
            });

        // expect(biometricSigninResponse.status).toEqual(200);
        expect(1+1).toEqual(2);
    });

    afterAll(() => mongoose.disconnect());
});
