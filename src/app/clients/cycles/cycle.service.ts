import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

import {environment} from "../../../environments/environment";
import {Cycle} from "../../domain/cycle";

@Injectable({
    providedIn: 'root'
})
export class CycleService {
    constructor(
        private http: HttpClient
    ) {
    }

    getAll(): Observable<any> {
        return this.http.get(environment.cyclesUrl);
    }

    getActive(): Observable<any> {
        return this.http.get(environment.cyclesUrl + "/active");
    }

    getByID(cycle_id: any): Observable<any> {
        return this.http.get(environment.cyclesUrl + "/" + cycle_id);
    }

    newCycle(cycle: Cycle): Observable<any> {
        return this.http.post(environment.cyclesUrl, cycle);
    }

    updateCycle(cycle: Cycle): Observable<any> {
        return this.http.put(environment.cyclesUrl + "/" + cycle.cycle_id, cycle);
    }

    deleteCycle(cycle_id: any): Observable<any> {
        return this.http.delete(environment.cyclesUrl + "/" + cycle_id);
    }
}
