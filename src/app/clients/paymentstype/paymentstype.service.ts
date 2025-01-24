import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

import {environment} from "../../../environments/environment";
import {PaymentType} from "../../domain/payment_type";

@Injectable({
    providedIn: 'root'
})
export class PaymentsTypeService {
    constructor(
        private http: HttpClient
    ) {
    }

    getAll(): Observable<any> {
        return this.http.get(environment.paymentsTypeUrl);
    }

    editPaymentType(paymentType: PaymentType): Observable<any> {
        return this.http.put(environment.paymentsTypeUrl + "/" + paymentType.payment_type_id, paymentType);
    }
}
