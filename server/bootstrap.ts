import { JWTService } from './common/jwt.service';
import { CRUDService } from './common/crud.service';
import { EmailService } from './common/email.service';
import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import { GlobalService } from './common/global.service';
import { APIHandler } from './api/api.service';
import * as http from 'http';
import { DBClient } from './db/db.client';

export class Server {
    private app: any;
    private API: APIHandler;
    private CRUD: CRUDService;
    private JWT: JWTService;
    private ES: EmailService;
    private $http;
    private dbClient: DBClient;
    private io: any;
    private server: any;
    private stagingServer: string;
    private stagingClient: string;
    //CORS doesn't want # in url
    private stagingOnluForCORS: string;
    constructor(
        private globalService: GlobalService
    ) {
        global.isProduction = false;

        if (global.isProduction) {
          console.log = function(){}
          this.stagingServer = '';
          this.stagingClient = '';
          this.stagingOnluForCORS = '';
        } else {
          this.stagingServer = '';
          this.stagingClient = '';
          this.stagingOnluForCORS = '';
        }

        this.dbClient = new DBClient(this.globalService);
        this.dbClient.connect().subscribe(() => {
            this.CRUD = new CRUDService(this.dbClient);
            this.JWT = new JWTService();
            this.ES = new EmailService(
                this.CRUD,
                this.stagingServer,
                this.stagingClient
            );
            this.API = new APIHandler(
                this.globalService,
                this.dbClient,
                this.JWT,
                this.CRUD,
                this.ES
            );

            this.bootstrap();
        });
    }
    bootstrap() {
        this.app = express();
        this.$http = http['Server'](this.app);
        this.app.use(bodyParser.json());
        this.app.use(cookieParser());
        this.app.use(express.static(path.join(__dirname, '../public')));

        this.app.use((req, res, next) => {

           res.header('Access-Control-Allow-Origin', this.stagingOnluForCORS);

            res.header(
                'Acces-Control-Allow-Methods',
                'GET,PUT,POST,DELETE,OPTIONS'
            );
            res.header(
                'Access-Control-Allow-Headers',
                'Origin, X-Requested-With, Content-Type, Accept, Authorization'
            );

            next();
        });

        this.globalService.app = this.app;
        this.JWT.init(this.app);
        this.API.routes();

        this.server = this.$http.listen(process.env.PORT || 1337, () => {
            console.log('Server runs at ' + (process.env.PORT || 1337));
        });
    }
}
