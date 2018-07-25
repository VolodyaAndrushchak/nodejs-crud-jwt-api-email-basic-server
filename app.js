module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/Users/test/Projects/startUp/server";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var bootstrap_1 = __webpack_require__(9);
	var global_service_1 = __webpack_require__(12);
	var $server = new bootstrap_1.Server(new global_service_1.GlobalService());


/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports = require("rxjs");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	module.exports = require("md5");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	module.exports = require("uuid");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	module.exports = require("nodemailer");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {"use strict";
	var user_api_1 = __webpack_require__(8);
	var request_handler_1 = __webpack_require__(7);
	var auth_api_1 = __webpack_require__(6);
	var md5 = __webpack_require__(2);
	var MobileDetect = __webpack_require__(23);
	var APIHandler = (function () {
	    function APIHandler(globalService, db, JWT, CRUD, ES) {
	        this.globalService = globalService;
	        this.db = db;
	        this.JWT = JWT;
	        this.CRUD = CRUD;
	        this.ES = ES;
	        this.clientUrl = 'http://localhost:4200/#';
	        this.auth = new auth_api_1.AuthAPI(JWT, CRUD, ES);
	        this.user = new user_api_1.UserAPI(JWT, CRUD, ES);
	        this.requestHandler = new request_handler_1.RequestHandler();
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
	    APIHandler.prototype.routes = function () {
	        var _this = this;
	        this.apiEndpoints.forEach(function (endpoint) {
	            _this.initRoute(endpoint);
	        });
	        this.globalService.app.get('**', function (req, res, next) {
	            console.log('got request');
	        });
	    };
	    APIHandler.prototype.initRoute = function (endpoint) {
	        var _this = this;
	        this.globalService.app[endpoint.type](endpoint.address, function (req, res, next) {
	            res.setHeader('Access-Control-Allow-Origin', '*');
	            console.log(endpoint.address + ' ' + endpoint.type.toUpperCase() + ' Request: ', req.body);
	            if (!endpoint.class || !endpoint.class[endpoint.method])
	                _this.returnError(res, 'Endpoint not found.', endpoint.address, endpoint.type, 404);
	            _this.requestHandler.handle(req).subscribe(function (handledReq) {
	                var someone = req.user;
	                if (someone && someone['user_id']) {
	                    console.log('got user', someone);
	                    endpoint.class[endpoint.method](handledReq, someone['user_id']).subscribe(function (resAPI) {
	                        console.log(endpoint.address + ' ' + endpoint.type.toUpperCase() + ' Response 1: ', resAPI);
	                        switch (resAPI.typeResponse) {
	                            case 'redirect':
	                                console.log('redirect');
	                                res.redirect(resAPI.data);
	                                break;
	                            case 'html':
	                                console.log('html');
	                                res.sendFile(resAPI.data, { root: __dirname + '/../../public/mail' });
	                                break;
	                            default:
	                                console.log('default');
	                                res.json(resAPI);
	                                break;
	                        }
	                    }, function (err) { return _this.returnError(res, err, endpoint.address, endpoint.type); });
	                }
	                else {
	                    console.log('no user');
	                    endpoint.class[endpoint.method](handledReq).subscribe(function (resAPI) {
	                        console.log(endpoint.address + ' ' + endpoint.type.toUpperCase() + ' Response 2: ', resAPI);
	                        switch (resAPI.typeResponse) {
	                            case 'redirect':
	                                res.redirect(resAPI.data);
	                                break;
	                            case 'html':
	                                res.sendFile(resAPI.data, resAPI.root);
	                                break;
	                            default:
	                                res.json(resAPI);
	                                break;
	                        }
	                    }, function (err) {
	                        console.log(err, 'err');
	                        _this.returnError(res, err, endpoint.address, endpoint.type, 401);
	                    });
	                }
	            }, function (err) { return _this.returnError(res, err); });
	        });
	    };
	    APIHandler.prototype.returnError = function (res, message, address, type, status) {
	        if (address === void 0) { address = 'Undefined'; }
	        if (type === void 0) { type = 'Undefined'; }
	        if (status === void 0) { status = 400; }
	        console.log(address + ' ' + type.toUpperCase() + ' Error: ', message);
	        var error = {
	            status: false,
	            error: message
	        };
	        res.status(status).json(error);
	    };
	    return APIHandler;
	}());
	exports.APIHandler = APIHandler;
	
	/* WEBPACK VAR INJECTION */}.call(exports, "server/api"))

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var rxjs_1 = __webpack_require__(1);
	var uuid = __webpack_require__(3);
	var md5 = __webpack_require__(2);
	var AuthAPI = (function () {
	    function AuthAPI(JWT, CRUD, ES) {
	        this.JWT = JWT;
	        this.CRUD = CRUD;
	        this.ES = ES;
	        this.socialSecret = 'e4901652-9ef1-4e79-abd1-cde058ba51bf';
	    }
	    AuthAPI.prototype.login = function (data) {
	        var _this = this;
	        var response;
	        return new rxjs_1.Observable(function (observer) {
	            data.password = md5(data.password);
	            _this.CRUD.read('users', data).subscribe(function (res) {
	                if (res.length === 1) {
	                    response = {
	                        status: true,
	                        data: _this.JWT.createToken({ user_id: res[0]['id'] })
	                    };
	                    if (!res[0]['verified']) {
	                        data.verified = true;
	                        _this.CRUD.update('users', { email: data.email }, data).subscribe();
	                    }
	                    observer.next(response);
	                }
	                else {
	                    observer.error('WRONG_LOGIN');
	                }
	            }, function (err) {
	                observer.error(err);
	            });
	        });
	    };
	    AuthAPI.prototype.adminLogin = function (data) {
	        var _this = this;
	        var response;
	        return new rxjs_1.Observable(function (observer) {
	            if (!data.password || !data.email)
	                return observer.error('INVALID_USER_DATA');
	            data.password = md5(data.password);
	            _this.CRUD.read('admins', data).subscribe(function (res) {
	                if (res.length === 1) {
	                    response = {
	                        status: true,
	                        data: _this.JWT.createToken({ admin_id: res[0]['id'] })
	                    };
	                    if (!res[0]['verified']) {
	                        data.verified = true;
	                        _this.CRUD.update('admins', { email: data.email }, data).subscribe();
	                    }
	                    observer.next(response);
	                }
	                else {
	                    observer.error('WRONG_ADMIN_LOGIN');
	                }
	            }, function (err) {
	                observer.error(err);
	            });
	        });
	    };
	    AuthAPI.prototype.checkEmail = function (data) {
	        var _this = this;
	        return new rxjs_1.Observable(function (observer) {
	            if (!data.email)
	                return observer.error('INVALID_USER_DATA');
	            _this.CRUD.read('users', { email: data.email }).subscribe(function (res) {
	                if (res.length > 0) {
	                    observer.next({ isUsed: true });
	                }
	                else {
	                    observer.next({ isUsed: false });
	                }
	            });
	        });
	    };
	    AuthAPI.prototype.register = function (data) {
	        var _this = this;
	        var response;
	        return new rxjs_1.Observable(function (observer) {
	            if (!data.password || !data.email)
	                return observer.error('INVALID_USER_DATA');
	            data.password = md5(data.password);
	            _this.CRUD.read('users', { email: data.email }).subscribe(function (res) {
	                if (!res.length) {
	                    data.verified = false;
	                    data.hash = uuid.v4();
	                    _this.CRUD.createOne('users', data).subscribe(function (res) {
	                        _this.ES.sendVerificationLink(data.email, data.hash).subscribe(function (res) {
	                            response = {
	                                status: true,
	                            };
	                            observer.next(response);
	                        }, function (err) { return observer.error(err); });
	                    }, function (err) { return observer.error(err); });
	                }
	                else {
	                    observer.error('EMAIL_ALREADY_EXISTS');
	                }
	            }, function (err) { return observer.error(err); });
	        });
	    };
	    AuthAPI.prototype.verifyAccount = function (data) {
	        var _this = this;
	        return new rxjs_1.Observable(function (observer) {
	            _this.CRUD.read('users', { hash: data.hash }).subscribe(function (users) {
	                var user = users[0];
	                if (!user)
	                    return observer.next({ typeResponse: 'redirect', data: "http://localhost:1337" });
	                _this.JWT.createToken({ user_id: user['id'] });
	                _this.CRUD.update('users', { hash: data.hash }, { hash: null, verified: true }).subscribe(function (res) {
	                    if (res.nModified !== 1)
	                        return observer.error('this hash is broken');
	                    observer.next({ typeResponse: 'redirect', data: "http://localhost:1337" });
	                });
	            });
	        });
	    };
	    return AuthAPI;
	}());
	exports.AuthAPI = AuthAPI;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var rxjs_1 = __webpack_require__(1);
	var RequestHandler = (function () {
	    function RequestHandler() {
	    }
	    RequestHandler.prototype.handle = function (req) {
	        return new rxjs_1.Observable(function (observer) {
	            var hasQuery = false;
	            if (Object.keys(req.query).length)
	                hasQuery = true;
	            var hasBody = false;
	            if (Object.keys(req.body).length)
	                hasBody = true;
	            if (hasBody && !hasQuery)
	                observer.next(req.body);
	            else if (hasQuery && !hasBody)
	                observer.next(req.query);
	            else if (hasQuery && hasBody)
	                observer.next(Object.assign(req.query, req.body));
	            else {
	                observer.next({});
	            }
	        });
	    };
	    return RequestHandler;
	}());
	exports.RequestHandler = RequestHandler;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {"use strict";
	var rxjs_1 = __webpack_require__(1);
	var uuid = __webpack_require__(3);
	var md5 = __webpack_require__(2);
	var UserAPI = (function () {
	    function UserAPI(JWT, CRUD, ES) {
	        this.JWT = JWT;
	        this.CRUD = CRUD;
	        this.ES = ES;
	    }
	    UserAPI.prototype.getUser = function (data, user_id) {
	        var _this = this;
	        return new rxjs_1.Observable(function (observer) {
	            _this.CRUD.read('users', { id: user_id }).subscribe(function (users) {
	                var user = users[0];
	                if (!user)
	                    return observer.error('User not found.');
	                delete user.password;
	                delete user._id;
	                delete user.verified;
	                delete user.passwordResetHash;
	                delete user.hash;
	                observer.next(user);
	            }, function (err) { return observer.error(err); });
	        });
	    };
	    UserAPI.prototype.initiateResetPassword = function (data) {
	        var _this = this;
	        return new rxjs_1.Observable(function (observer) {
	            var hash = uuid.v4();
	            _this.CRUD.update('users', { email: data.email }, { passwordResetHash: hash }).subscribe(function (res) {
	                if (res.nModified == 1) {
	                    _this.ES.sendPasswordRecoveryLink(data.email, hash).subscribe(function (res) {
	                        if (res === true) {
	                            return observer.next({ status: 'success' });
	                        }
	                        return observer.error("Unexpected error!");
	                    });
	                }
	                else
	                    observer.error('User not found!');
	            }, function (err) { return observer.error(err); });
	        });
	    };
	    UserAPI.prototype.setPassword = function (data) {
	        var _this = this;
	        return new rxjs_1.Observable(function (observer) {
	            if (!data.password || !data.email || !data.passwordResetHash)
	                return observer.error('INVALID_USER_DATA');
	            _this.CRUD.read('users', { email: data.email, passwordResetHash: data.passwordResetHash }).subscribe(function (user) {
	                if (user.length > 0) {
	                    _this.CRUD.update('users', { email: data.email, passwordResetHash: data.passwordResetHash }, { password: md5(data.password) }).subscribe(function (res) {
	                        return observer.next({ status: 'success' });
	                    }, function (err) { return observer.error(err); });
	                }
	                else
	                    observer.error('User not found!');
	            }, function (err) { return observer.error(err); });
	        });
	    };
	    UserAPI.prototype.privacyPolicy = function () {
	        return new rxjs_1.Observable(function (observer) {
	            observer.next({ typeResponse: 'html', data: 'privacy.html',
	                root: { root: __dirname + '/../../public/mail' } });
	        });
	    };
	    return UserAPI;
	}());
	exports.UserAPI = UserAPI;
	
	/* WEBPACK VAR INJECTION */}.call(exports, "server/api"))

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {"use strict";
	var jwt_service_1 = __webpack_require__(13);
	var crud_service_1 = __webpack_require__(10);
	var email_service_1 = __webpack_require__(11);
	var path = __webpack_require__(25);
	var express = __webpack_require__(18);
	var bodyParser = __webpack_require__(15);
	var cookieParser = __webpack_require__(16);
	var api_service_1 = __webpack_require__(5);
	var http = __webpack_require__(21);
	var db_client_1 = __webpack_require__(14);
	var Server = (function () {
	    function Server(globalService) {
	        var _this = this;
	        this.globalService = globalService;
	        global.isProduction = false;
	        if (global.isProduction) {
	            console.log = function () { };
	            this.stagingServer = '';
	            this.stagingClient = '';
	            this.stagingOnluForCORS = '';
	        }
	        else {
	            this.stagingServer = '';
	            this.stagingClient = '';
	            this.stagingOnluForCORS = '';
	        }
	        this.dbClient = new db_client_1.DBClient(this.globalService);
	        this.dbClient.connect().subscribe(function () {
	            _this.CRUD = new crud_service_1.CRUDService(_this.dbClient);
	            _this.JWT = new jwt_service_1.JWTService();
	            _this.ES = new email_service_1.EmailService(_this.CRUD, _this.stagingServer, _this.stagingClient);
	            _this.API = new api_service_1.APIHandler(_this.globalService, _this.dbClient, _this.JWT, _this.CRUD, _this.ES);
	            _this.bootstrap();
	        });
	    }
	    Server.prototype.bootstrap = function () {
	        var _this = this;
	        this.app = express();
	        this.$http = http['Server'](this.app);
	        this.app.use(bodyParser.json());
	        this.app.use(cookieParser());
	        this.app.use(express.static(path.join(__dirname, '../public')));
	        this.app.use(function (req, res, next) {
	            res.header('Access-Control-Allow-Origin', _this.stagingOnluForCORS);
	            res.header('Acces-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	            next();
	        });
	        this.globalService.app = this.app;
	        this.JWT.init(this.app);
	        this.API.routes();
	        this.server = this.$http.listen(process.env.PORT || 1337, function () {
	            console.log('Server runs at ' + (process.env.PORT || 1337));
	        });
	    };
	    return Server;
	}());
	exports.Server = Server;
	
	/* WEBPACK VAR INJECTION */}.call(exports, "server"))

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var rxjs_1 = __webpack_require__(1);
	var uuid = __webpack_require__(3);
	var CRUDService = (function () {
	    function CRUDService(dbClient) {
	        this.dbClient = dbClient;
	    }
	    CRUDService.prototype.read = function (collectionName, filter) {
	        if (filter === void 0) { filter = {}; }
	        var collection = this.dbClient.db.collection(collectionName);
	        console.log('read');
	        return new rxjs_1.Observable(function (observer) {
	            collection.find(filter).toArray(function (err, docs) {
	                if (err) {
	                    observer.error('DATABASE_ERROR');
	                }
	                observer.next(docs);
	            });
	        });
	    };
	    CRUDService.prototype.create = function (collectionName, data) {
	        var _this = this;
	        return new rxjs_1.Observable(function (observer) {
	            console.log('create: ', data);
	            new Promise(function (resolve, reject) {
	                var length = data.length - 1;
	                data.forEach(function (item, index) {
	                    if (!item['id'])
	                        item['id'] = uuid.v4();
	                    if (index === length) {
	                        resolve(data);
	                    }
	                });
	            }).then(function (data) {
	                var collection = _this.dbClient.db.collection(collectionName);
	                collection.insertMany(data, function (err, docs) {
	                    if (err)
	                        observer.error('DATABASE_ERROR');
	                    observer.next(docs);
	                });
	            });
	        });
	    };
	    CRUDService.prototype.createOne = function (collectionName, data) {
	        var _this = this;
	        return new rxjs_1.Observable(function (observer) {
	            if (!data['id'])
	                data['id'] = uuid.v4();
	            console.log('createOne: ', data);
	            var collection = _this.dbClient.db.collection(collectionName);
	            collection.insertOne(data, function (err, docs) {
	                if (err)
	                    observer.error('DATABASE_ERROR');
	                observer.next({ id: data['id'] });
	            });
	        });
	    };
	    CRUDService.prototype.update = function (collectionName, search, set) {
	        var collection = this.dbClient.db.collection(collectionName);
	        return new rxjs_1.Observable(function (observer) {
	            console.log('update: ', set);
	            collection.updateMany(search, { $set: set }, function (err, docs) {
	                if (err)
	                    observer.error({ message: 'DATABASE_ERROR', error: err });
	                observer.next(docs.result);
	            });
	        });
	    };
	    CRUDService.prototype.delete = function (collectionName, search) {
	        var collection = this.dbClient.db.collection(collectionName);
	        return new rxjs_1.Observable(function (observer) {
	            console.log('DELETE ---->', collectionName, search);
	            collection.deleteMany(search, function (err, docs) {
	                if (err)
	                    observer.error('DATABASE_ERROR');
	                observer.next(docs);
	            });
	        });
	    };
	    return CRUDService;
	}());
	exports.CRUDService = CRUDService;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {"use strict";
	var NodeMailer = __webpack_require__(4);
	var rxjs_1 = __webpack_require__(1);
	var nodemailer = __webpack_require__(4);
	var fs = __webpack_require__(20);
	__webpack_require__(17).config();
	var EmailService = (function () {
	    function EmailService(CRUD, stagingServer, stagingClient) {
	        this.CRUD = CRUD;
	        this.stagingServer = stagingServer;
	        this.stagingClient = stagingClient;
	        this.emailInfo = '';
	        this.emailForProblems = '';
	    }
	    EmailService.prototype.sendVerificationLink = function (email, hash) {
	        var _this = this;
	        return new rxjs_1.Observable(function (observer) {
	            var fileContent = fs.readFileSync(__dirname + '/../../public/mail/verification.html').toString();
	            var html = fileContent
	                .replace(/{{LINK}}/g, _this.stagingServer + "/v1/auth/verify?hash=" + hash)
	                .replace(/{{HOST}}/g, _this.stagingServer)
	                .replace(/{{HOST_CLIENT}}/g, _this.stagingClient);
	            _this.sendEmailFunction(email, "", html).subscribe(function (res) { return observer.next(); }, function (err) { return observer.error(err); });
	        });
	    };
	    EmailService.prototype.sendPasswordRecoveryLink = function (user_email, passwordResetHash) {
	        var _this = this;
	        return new rxjs_1.Observable(function (observer) {
	            var fileContent = fs.readFileSync(__dirname + '/../../public/mail/recovery-password.html').toString();
	            var html = fileContent
	                .replace(/{{LINK}}/g, _this.stagingClient + "/reset?hash=" + passwordResetHash)
	                .replace(/{{HOST}}/g, _this.stagingServer)
	                .replace(/{{HOST_CLIENT}}/g, _this.stagingClient);
	            _this.sendEmailFunction(user_email, "", html).subscribe(function (res) { return observer.next(); }, function (err) { return observer.error(err); });
	        });
	    };
	    EmailService.prototype.sendEmailFunction = function (email, text, html) {
	        return new rxjs_1.Observable(function (observer) {
	            nodemailer.createTestAccount(function (err, account) {
	                var transporter = nodemailer.createTransport({
	                    host: '',
	                    port: 465,
	                    secure: true,
	                    auth: {
	                        user: '',
	                        pass: ''
	                    }
	                });
	                var mailOptions = {
	                    from: '',
	                    to: email,
	                    subject: 'Verification',
	                    text: '',
	                    html: html
	                };
	                transporter.sendMail(mailOptions, function (error, info) {
	                    if (error) {
	                        observer.error(error);
	                    }
	                    observer.next(true);
	                });
	            });
	        });
	    };
	    return EmailService;
	}());
	exports.EmailService = EmailService;
	
	/* WEBPACK VAR INJECTION */}.call(exports, "server/common"))

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	"use strict";
	var GlobalService = (function () {
	    function GlobalService() {
	    }
	    return GlobalService;
	}());
	exports.GlobalService = GlobalService;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var expressJwt = __webpack_require__(19);
	var jwt = __webpack_require__(22);
	exports.secret = '0f952eb0-5da5-45ad-8971-a9b15f9db6db';
	var UNAUTHORIZED_PATHS = [
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
	var JWTService = (function () {
	    function JWTService() {
	    }
	    JWTService.prototype.init = function (app) {
	        console.log('JwT initiated with secret: ' + exports.secret);
	        app.use(expressJwt({ secret: exports.secret }).unless({ path: UNAUTHORIZED_PATHS }));
	        this.handleError(app);
	    };
	    JWTService.prototype.handleError = function (app) {
	        app.use(function (err, req, res, next) {
	            if (err.name === 'UnauthorizedError') {
	                var response = {
	                    status: false,
	                    error: 'UNAUTHORIZED'
	                };
	                res.status(401).send(response);
	            }
	        });
	    };
	    JWTService.prototype.createToken = function (data) {
	        var token = jwt.sign(data, exports.secret);
	        return token;
	    };
	    return JWTService;
	}());
	exports.JWTService = JWTService;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var rxjs_1 = __webpack_require__(1);
	var MongoClient = __webpack_require__(24).MongoClient;
	var url = 'mongodb://root:root@ds115436.mlab.com:15436/heroku_l8mlnz5x';
	var DBClient = (function () {
	    function DBClient(globalService) {
	        this.globalService = globalService;
	        this.db = this.globalService.DBClient;
	    }
	    DBClient.prototype.connect = function () {
	        var _this = this;
	        console.log('Connecting to db..');
	        return new rxjs_1.Observable(function (observer) {
	            MongoClient.connect(url, function (err, db) {
	                if (!err) {
	                    _this.db = db;
	                    console.log('Connected successfully to MongoDB server.');
	                    observer.next();
	                }
	                else {
	                    console.log('Error connecting to server: ', err);
	                    observer.error();
	                }
	            });
	        });
	    };
	    DBClient.prototype.disconnect = function () {
	        this.db.close();
	    };
	    return DBClient;
	}());
	exports.DBClient = DBClient;


/***/ }),
/* 15 */
/***/ (function(module, exports) {

	module.exports = require("body-parser");

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	module.exports = require("cookie-parser");

/***/ }),
/* 17 */
/***/ (function(module, exports) {

	module.exports = require("dotenv");

/***/ }),
/* 18 */
/***/ (function(module, exports) {

	module.exports = require("express");

/***/ }),
/* 19 */
/***/ (function(module, exports) {

	module.exports = require("express-jwt");

/***/ }),
/* 20 */
/***/ (function(module, exports) {

	module.exports = require("fs");

/***/ }),
/* 21 */
/***/ (function(module, exports) {

	module.exports = require("http");

/***/ }),
/* 22 */
/***/ (function(module, exports) {

	module.exports = require("jsonwebtoken");

/***/ }),
/* 23 */
/***/ (function(module, exports) {

	module.exports = require("mobile-detect");

/***/ }),
/* 24 */
/***/ (function(module, exports) {

	module.exports = require("mongodb");

/***/ }),
/* 25 */
/***/ (function(module, exports) {

	module.exports = require("path");

/***/ })
/******/ ]);
//# sourceMappingURL=app.js.map