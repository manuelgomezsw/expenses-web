import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

import {environment} from "../../../environments/environment";
import {Pocket} from "../../domain/pocket";

@Injectable({
    providedIn: 'root'
})
export class PocketService {
    constructor(
        private http: HttpClient
    ) {
    }

    getAll(): Observable<any> {
        return this.http.get(environment.pocketsUrl + "/all");
    }

    getByID(pocket_id: any): Observable<any> {
        return this.http.get(environment.pocketsUrl + "/" + pocket_id);
    }

    getActive(): Observable<any> {
        return this.http.get(environment.pocketsUrl + "/active");
    }

    newPocket(pocket: Pocket): Observable<any> {
        return this.http.post(environment.pocketsUrl, pocket);
    }

    editPocket(pocket: Pocket): Observable<any> {
        return this.http.put(environment.pocketsUrl + "/" + pocket.pocket_id, pocket);
    }

    deletePocket(pocket_id: any): Observable<any> {
        return this.http.delete(environment.pocketsUrl + "/" + pocket_id);
    }
}
