import { Observable } from 'rxjs';
export class RequestHandler {
    constructor() {}
    handle(req) {
        return new Observable(observer => {
            let hasQuery: boolean = false;
            if (Object.keys(req.query).length) hasQuery = true;
            // console.log('Object.keys(req.query)', Object.keys(req.query), req.query, hasQuery);
            let hasBody: boolean = false;
            if (Object.keys(req.body).length) hasBody = true;
            // console.log('Object.keys(req.body)', Object.keys(req.body), req.body, hasBody); 

            if (hasBody && !hasQuery)
                observer.next(req.body);
            else if (hasQuery && !hasBody)
                observer.next(req.query);
            else if (hasQuery && hasBody)
                observer.next(Object.assign(req.query, req.body));
            else {
                observer.next({});
            }
        })
    }
}