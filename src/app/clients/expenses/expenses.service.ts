import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

import {environment} from "../../../environments/environment";
import {Expense} from "../../domain/expense";

@Injectable({
    providedIn: 'root'
})
export class ExpensesService {
    constructor(
        private http: HttpClient
    ) {
    }

    getAll(): Observable<any> {
        return this.http.get(environment.expensesUrl);
    }

    getByCycleID(cycle_id: any): Observable<any> {
        return this.http.get(environment.cyclesUrl + '/' + cycle_id + "/expenses");
    }

    new(expense: Expense): Observable<any> {
        return this.http.post(environment.expensesUrl, expense);
    }

    edit(expense: Expense): Observable<any> {
        return this.http.put(environment.expensesUrl + "/" + expense.expense_id, expense);
    }

    delete(expense_id: any): Observable<any> {
        return this.http.delete(environment.expensesUrl + "/" + expense_id);
    }
}
