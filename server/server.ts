import { Server } from './bootstrap';
import {GlobalService} from './common/global.service';

var $server = new Server(new GlobalService());
