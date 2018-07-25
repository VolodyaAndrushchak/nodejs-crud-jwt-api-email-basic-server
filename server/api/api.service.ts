import { UserAPI } from './user.api';
import { CRUDService } from './../common/crud.service';
import { APIResponse } from './api.service';
import { Observable } from 'rxjs';
import { RequestHandler } from './request.handler';
import { AuthAPI } from './auth.api';
import { JWTService } from './../common/jwt.service';
import { DBClient } from './../db/db.client';
import { GlobalService } from '../common/global.service';
import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { EmailService } from './../common/email.service';
const md5 = require('md5');

export interface APIResponse {
    status: boolean,
    typeResponse?: string,
    data?: any,
    error?: string,
    root?: any
}

interface apiEndpoint {
    address: string,
    type: 'post' | 'get' | 'put' | 'delete',
    class: any,
    method: string
}

export class APIHandler {
    private requestHandler: RequestHandler;
    private apiEndpoints: [apiEndpoint];
    private auth: AuthAPI;
    private user: UserAPI;
    private md: any;
    private clientUrl: string = 'http://localhost:4200/#';
    constructor(
        private globalService: GlobalService,
        private db: DBClient,
        private JWT: JWTService,
        private CRUD: CRUDService,
        private ES: EmailService
    ) {
        this.auth = new AuthAPI(JWT, CRUD, ES);
        this.user = new UserAPI(JWT, CRUD, ES);
        this.requestHandler = new RequestHandler();
        this.apiEndpoints = [
          {
              address: '/v1/auth/register',
              type: 'post',
              class: this.auth,
              method: 'register'
          },
          {
              address: '/v1/auth/verify',
              type: 'get',
              class: this.auth,
              method: 'verifyAccount'
          },
          {
              address: '/v1/auth/login',
              type: 'post',
              class: this.auth,
              method: 'login'
          },
          {
              address: '/v1/auth/check-email',
              type: 'post',
              class: this.auth,
              method: 'checkEmail'
          },
          {
              address: '/v1/auth/reset-password',
              type: 'post',
              class: this.user,
              method: 'initiateResetPassword'
          },
          {
              address: '/v1/auth/set-password',
              type: 'post',
              class: this.user,
              method: 'setPassword'
          },
          {
              address: '/privacypolicy',
              type: 'get',
              class: this.user,
              method: 'privacyPolicy'
          }
        ];
    }
    routes() {

        this.apiEndpoints.forEach(endpoint => {
            this.initRoute(endpoint);
        });

        this.globalService.app.get('**', (req, res, next) => {
          console.log('got request')
        });
    }

    initRoute(endpoint: apiEndpoint) {
        this.globalService.app[endpoint.type](endpoint.address, (req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            console.log(endpoint.address + ' ' + endpoint.type.toUpperCase() + ' Request: ', req.body);
            if (!endpoint.class || !endpoint.class[endpoint.method]) this.returnError(res, 'Endpoint not found.', endpoint.address, endpoint.type, 404);
            this.requestHandler.handle(req).subscribe(handledReq => {
                let someone = req.user;
                if (someone && someone['user_id']) {
                    console.log('got user', someone);
                    endpoint.class[endpoint.method](handledReq, someone['user_id']).subscribe((resAPI: APIResponse) => {
                        console.log(endpoint.address + ' ' + endpoint.type.toUpperCase() + ' Response 1: ', resAPI);

                        switch( resAPI.typeResponse ) {
                          case 'redirect':
                          console.log('redirect')
                            res.redirect(resAPI.data);
                            break;
                          case 'html':
                            console.log('html')
                            res.sendFile(
                                resAPI.data,
                                { root: __dirname + '/../../public/mail' }
                            );
                            break;
                          default:
                            console.log('default')
                            res.json(resAPI);
                            break;
                        }

                    }, err => this.returnError(res, err, endpoint.address, endpoint.type))
                } else {
                    console.log('no user');
                    endpoint.class[endpoint.method](handledReq).subscribe((resAPI: APIResponse) => {
                        console.log(endpoint.address + ' ' + endpoint.type.toUpperCase() + ' Response 2: ', resAPI);
                        switch( resAPI.typeResponse ) {
                          case 'redirect':
                            res.redirect(resAPI.data);
                            break;
                          case 'html':
                            res.sendFile(
                                resAPI.data,
                                resAPI.root
                            );
                            break;
                          default:
                            res.json(resAPI);
                            break;
                        }
                    }, err => {
                      console.log(err, 'err');
                      this.returnError(res, err, endpoint.address, endpoint.type, 401)}
                    )
                }
            }, err => this.returnError(res, err));
        })
    }

    returnError(res, message: string, address: string = 'Undefined', type: string = 'Undefined', status: number = 400) {
        console.log(address + ' ' + type.toUpperCase() + ' Error: ', message);
        let error: APIResponse = {
            status: false,
            error: message
        }
        res.status(status).json(error);
    }

}
