import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

import {environment} from "../../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class BudgetsService {
    constructor(
        private http: HttpClient
    ) {
    }

    getByCycleID(cycle_id: any): Observable<any> {
        return this.http.post(environment.budgetsUrl + '/' + cycle_id, null);
    }
}
