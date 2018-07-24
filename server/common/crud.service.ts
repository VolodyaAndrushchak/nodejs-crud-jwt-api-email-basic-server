import { DBClient } from './../db/db.client';
import { Observable } from 'rxjs';
import * as EventEmitter from 'events';
import * as uuid from 'uuid';

export class CRUDService {
    constructor(
        private dbClient: DBClient
    ) {
    }

    read(collectionName: string, filter: Object = {}) {
        const collection = this.dbClient.db.collection(collectionName);
        console.log('read');
        return new Observable<any[]>(observer => {
            collection.find(filter).toArray((err, docs) => {
                if (err) { observer.error('DATABASE_ERROR'); }
                observer.next(docs);
            });
        })
    }

    create(collectionName: string, data: [Object]) {
        return new Observable(observer => {
            console.log('create: ', data);
            new Promise((resolve, reject) => {
                let length = data.length - 1;
                data.forEach((item, index) => {
                    if(!item['id'])
                        item['id'] = uuid.v4();
                    if (index === length) {
                        resolve(data);
                    }
                })
            }).then((data) => {
                const collection = this.dbClient.db.collection(collectionName);

                collection.insertMany(data, (err, docs) => {
                    if (err) observer.error('DATABASE_ERROR');
                    observer.next(docs);
                });
            })
        });
    }

    createOne(collectionName: string, data: [Object]) {
        return new Observable(observer => {
            if(!data['id']) data['id'] = uuid.v4();

            console.log('createOne: ', data);
            const collection = this.dbClient.db.collection(collectionName);

            collection.insertOne(data, (err, docs) => {
                if (err) observer.error('DATABASE_ERROR');
                observer.next({id: data['id']});
            });
        })

    }

    update(collectionName: string, search: Object, set: Object) {
        const collection = this.dbClient.db.collection(collectionName);
        return new Observable(observer => {
            console.log('update: ', set);
            collection.updateMany(search, { $set: set }, (err, docs) => {
                if (err) observer.error({ message: 'DATABASE_ERROR', error: err });
                observer.next(docs.result);
            });
        });
    }

    delete(collectionName: string, search: Object) {
        const collection = this.dbClient.db.collection(collectionName);
        return new Observable(observer => {
            console.log('DELETE ---->', collectionName, search);
            collection.deleteMany(search, (err, docs) => {
                if (err) observer.error('DATABASE_ERROR');
                observer.next(docs);
            });
        });
    }

}
