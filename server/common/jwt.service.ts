import { APIResponse } from './../api/api.service';
import * as EventEmitter from 'events';
var expressJwt = require('express-jwt');
import * as uuid from 'uuid';
import * as jwt from 'jsonwebtoken';
// export const secret: string = uuid.v4();
//temp for dev
export const secret: string = '0f952eb0-5da5-45ad-8971-a9b15f9db6db';

const UNAUTHORIZED_PATHS: Array<string> = [
    '/favicon.ico',
    '/v1/auth/login',
    '/v1/auth/register',
    '/v1/auth/check-email',
    '/v1/auth/set-password',
    '/privacypolicy',
    '/v1/auth/verify',
    '/mail/recovery-password',
    '/mail/verification',
];

export class JWTService {
    public app: any;
    constructor() {

    }

  init(app) {
    console.log('JwT initiated with secret: ' + secret);
    app.use(expressJwt({ secret: secret }).unless({ path: UNAUTHORIZED_PATHS }));
    this.handleError(app);
  }

    handleError(app) {
        app.use(function (err, req, res, next) {
            if (err.name === 'UnauthorizedError') {
                let response: APIResponse = {
                    status: false,
                    error: 'UNAUTHORIZED'
                };

                res.status(401).send(response);
            }
        });
    }

    createToken(data) {
        let token = jwt.sign(data, secret);
        return token;
    }
}
