import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

import {environment} from "../../../environments/environment";
import {Concept} from "../../domain/concept";

@Injectable({
  providedIn: 'root'
})
export class ConceptsService {
  constructor(
      private http: HttpClient
  ) {
  }

  getByPocketID(pocket_id: number | undefined): Observable<any> {
    return this.http.get(environment.pocketsUrl + "/" + pocket_id + "/concepts");
  }

  new(concept: Concept): Observable<any> {
    return this.http.post(environment.conceptsUrl, concept);
  }

  edit(concept: Concept): Observable<any> {
    return this.http.put(environment.conceptsUrl + "/" + concept.id, concept);
  }

  payedEdit(concept_id: number, payed: boolean): Observable<any> {
    return this.http.put(environment.conceptsUrl + '/payed/' + concept_id, payed);
  }

  delete(concept_id: any): Observable<any> {
    return this.http.delete(environment.conceptsUrl + "/" + concept_id);
  }
}
