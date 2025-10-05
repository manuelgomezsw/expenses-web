import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { HybridTransaction, CreateHybridTransactionRequest, UpdateHybridTransactionRequest } from '../../domain/fixed-expense';

@Injectable({
  providedIn: 'root'
})
export class HybridTransactionsService {

  private readonly baseUrl = `${environment.fixedExpensesUrl}/transactions`;
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las transacciones de un gasto híbrido
   */
  getTransactionsByExpenseId(expenseId: number): Observable<HybridTransaction[]> {
    const url = `${this.baseUrl}/${expenseId}`;
    
    return this.http.get<HybridTransaction[]>(url).pipe(
      map(response => {
        if (!response || !Array.isArray(response)) {
          return [];
        }
        return response.sort((a, b) => 
          new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
        );
      }),
      catchError(error => {
        if (error.status === 404) {
          return of([]);
        }
        console.error('Error fetching hybrid transactions:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crea una nueva transacción híbrida
   */
  createTransaction(request: CreateHybridTransactionRequest): Observable<HybridTransaction> {
    return this.http.post<HybridTransaction>(this.baseUrl, request, this.httpOptions).pipe(
      map(response => {
        if (!response) {
          // Si el backend retorna null, construir objeto local
          return {
            id: Date.now(), // ID temporal
            fixed_expense_id: request.fixed_expense_id,
            amount: request.amount,
            description: request.description,
            transaction_date: request.transaction_date,
            created_at: new Date().toISOString()
          };
        }
        return response;
      }),
      catchError(error => {
        console.error('Error creating hybrid transaction:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza una transacción híbrida existente
   */
  updateTransaction(transactionId: number, request: UpdateHybridTransactionRequest): Observable<HybridTransaction> {
    const url = `${this.baseUrl}/${transactionId}`;
    
    return this.http.put<HybridTransaction>(url, request, this.httpOptions).pipe(
      map(response => {
        if (!response) {
          // Si el backend retorna null, construir objeto local
          return {
            id: transactionId,
            fixed_expense_id: 0, // Se actualizará desde el componente
            amount: request.amount || 0,
            description: request.description,
            transaction_date: request.transaction_date || new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
          };
        }
        return response;
      }),
      catchError(error => {
        console.error('Error updating hybrid transaction:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina una transacción híbrida
   */
  deleteTransaction(transactionId: number): Observable<void> {
    const url = `${this.baseUrl}/${transactionId}`;
    
    return this.http.delete<void>(url).pipe(
      catchError(error => {
        console.error('Error deleting hybrid transaction:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Calcula el total gastado de las transacciones
   */
  calculateTotalSpent(transactions: HybridTransaction[]): number {
    return transactions.reduce((total, transaction) => total + transaction.amount, 0);
  }

  /**
   * Verifica si el presupuesto está excedido
   */
  isBudgetExceeded(budgetLimit: number, currentSpent: number): boolean {
    return currentSpent > budgetLimit;
  }

  /**
   * Calcula el presupuesto restante
   */
  getRemainingBudget(budgetLimit: number, currentSpent: number): number {
    return budgetLimit - currentSpent;
  }

  /**
   * Calcula el porcentaje de presupuesto utilizado
   */
  getBudgetUsagePercentage(budgetLimit: number, currentSpent: number): number {
    if (budgetLimit === 0) return 0;
    return Math.min((currentSpent / budgetLimit) * 100, 100);
  }
}