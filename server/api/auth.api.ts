import { CRUDService } from './../common/crud.service';
import { APIResponse } from './api.service';
import { Observable } from 'rxjs';
import { JWTService } from './../common/jwt.service';
import { EmailService } from './../common/email.service';
import * as uuid from 'uuid';

var md5 = require('md5');
export class AuthAPI {

    private socialSecret: string = 'e4901652-9ef1-4e79-abd1-cde058ba51bf';

    constructor(
        private JWT: JWTService,
        private CRUD: CRUDService,
        private ES: EmailService
    ){}

    login(data) {
        let response: APIResponse;
        return new Observable(observer => {
            data.password = md5(data.password);
            this.CRUD.read('users', data).subscribe((res: any) => {
                if (res.length === 1) {
                    response = {
                      status: true,
                      data: this.JWT.createToken({ user_id: res[0]['id'] })
                    };

                    if (!res[0]['verified']) {
                      data.verified = true;
                      this.CRUD.update('users', {email: data.email}, data).subscribe();
                    }
                    observer.next(response);
                } else {
                    observer.error('WRONG_LOGIN')
                }
            }, err => {
                observer.error(err);
            })

        })
    }

    adminLogin(data) {
        let response: APIResponse;
        return new Observable(observer => {

            if ( !data.password || !data.email ) return observer.error('INVALID_USER_DATA');

            data.password = md5(data.password);
            this.CRUD.read('admins', data).subscribe((res: any) => {
                if (res.length === 1) {
                    response = {
                      status: true,
                      data: this.JWT.createToken({ admin_id: res[0]['id'] })
                    };

                    if (!res[0]['verified']) {
                      data.verified = true;
                      this.CRUD.update('admins', {email: data.email}, data).subscribe();
                    }
                    observer.next(response);
                } else {
                    observer.error('WRONG_ADMIN_LOGIN')
                }
            }, err => {
                observer.error(err);
            })
        })
    }

    checkEmail(data) {
      return new Observable(observer => {

        if ( !data.email ) return observer.error('INVALID_USER_DATA');

        this.CRUD.read('users', { email: data.email }).subscribe((res: any) => {
          if (res.length > 0) {
            observer.next({ isUsed: true })
          } else {
            observer.next({ isUsed: false });
          }
        });
      });
    }

    register(data) {
      let response: APIResponse;
      return new Observable(observer => {

        if ( !data.password || !data.email ) return observer.error('INVALID_USER_DATA');

        data.password = md5(data.password);
        this.CRUD.read('users', { email: data.email }).subscribe((res: any) => {
          if (!res.length) {
            data.verified = false;
            data.hash = uuid.v4();
            this.CRUD.createOne('users', data).subscribe((res: any) => {
              // send verifivation email
               this.ES.sendVerificationLink(data.email, data.hash).subscribe( res => {
                 response = {
                   status: true,
                 }
                 observer.next(response);
               }, err => observer.error(err));
              // automatic login after signup disabled. user should verify his email to be able to log in
            }, err => observer.error(err));
          } else {
            observer.error('EMAIL_ALREADY_EXISTS')
          }
        }, err => observer.error(err))
      })
    }

    verifyAccount(data) {
      return new Observable( observer => {
        this.CRUD.read(
          'users',
          { hash: data.hash }
        ).subscribe(users => {
          const user = users[0];

          if (!user) return observer.next({typeResponse: 'redirect', data: `http://localhost:1337`});

          this.JWT.createToken({ user_id: user['id'] });
          this.CRUD.update(
            'users',
            { hash: data.hash },
            { hash: null, verified: true }
          ).subscribe((res: any) => {
            if (res.nModified !== 1) return observer.error('this hash is broken');
            observer.next({typeResponse: 'redirect', data: `http://localhost:1337`});
          });
        });
      });
    }

}
