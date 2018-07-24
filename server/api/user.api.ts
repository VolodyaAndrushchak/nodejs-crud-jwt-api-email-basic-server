import { CRUDService } from './../common/crud.service';
import { APIResponse } from './api.service';
import { Observable } from 'rxjs';
import { JWTService } from './../common/jwt.service';
import { EmailService } from './../common/email.service';
import * as uuid from 'uuid';
var md5 = require('md5');

export class UserAPI {

  constructor(
    private JWT: JWTService,
    private CRUD: CRUDService,
    private ES: EmailService
  ) {
  }

  //***********************************//
  //get

  getUser(data, user_id) {
    return new Observable(observer => {
      this.CRUD.read('users', { id: user_id }).subscribe(users => {
        const user = users[0];

        if (!user) return observer.error('User not found.');

        delete user.password;
        delete user._id;
        delete user.verified;
        delete user.passwordResetHash;
        delete user.hash;
        observer.next(user);
      }, err => observer.error(err));
    });
  }

  //***********************************//
  // post


  //***********************************//
  // put

 initiateResetPassword(data) {
   return new Observable(observer => {
     const hash = uuid.v4();
     this.CRUD.update(
       'users',
       { email: data.email },
       { passwordResetHash:  hash}
     ).subscribe((res: any) => {
       if (res.nModified == 1) {
         this.ES.sendPasswordRecoveryLink(data.email, hash).subscribe( res => {

           if (res === true) {
             return observer.next({ status: 'success' });
           }
           return observer.error("Unexpected error!")
         });
       } else observer.error('User not found!');
     }, err => observer.error(err));
   });
 }

 setPassword(data) {
   return new Observable(observer => {

    if ( !data.password || !data.email || !data.passwordResetHash) return observer.error('INVALID_USER_DATA');

     this.CRUD.read(
       'users',
       { email: data.email, passwordResetHash:  data.passwordResetHash }
     ).subscribe((user: any) => {
       if (user.length > 0) {
         this.CRUD.update(
           'users',
           { email: data.email, passwordResetHash:  data.passwordResetHash },
           { password: md5(data.password) }
         ).subscribe((res: any) => {
             return observer.next({ status: 'success' });
        }, err => observer.error(err));

       } else observer.error('User not found!');
     }, err => observer.error(err));
   });
 }

 privacyPolicy() {
   return new Observable(observer => {
      observer.next({ typeResponse: 'html', data: 'privacy.html',
       root: { root: __dirname + '/../../public/mail' }});
   })
 }
}
