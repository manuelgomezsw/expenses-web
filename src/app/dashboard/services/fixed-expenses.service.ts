import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { FixedExpense } from '../../domain/fixed-expense';
import { environment } from '../../../environments/environment';

export interface FixedExpensesByPocket {
  [pocketName: string]: FixedExpense[];
}

@Injectable({
  providedIn: 'root'
})
export class FixedExpensesService {

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los gastos fijos del mes desde el backend
   * GET /api/fixed-expenses/{month}
   */
  getFixedExpenses(month: string): Observable<FixedExpense[]> {
    const url = `${environment.fixedExpensesUrl}/${month}`;
    console.log('Obteniendo gastos fijos desde:', url);

    return this.http.get<FixedExpense[]>(url).pipe(
      map(response => {
        console.log('Gastos fijos obtenidos exitosamente:', response);
        
        // Validar que la respuesta sea un array
        if (!Array.isArray(response)) {
          throw new Error('La respuesta del servidor no es un array válido');
        }

        // Asegurar que cada gasto tenga la estructura correcta
        return response.map(expense => ({
          ...expense,
          month: expense.month || month,
          is_paid: expense.is_paid || false,
          created_at: expense.created_at || new Date().toISOString()
        }));
      }),
      catchError(error => {
        console.error('Error obteniendo gastos fijos del backend:', error);
        console.error('URL utilizada:', url);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error cargando gastos fijos: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Agrupa los gastos fijos por bolsillo
   */
  groupExpensesByPocket(expenses: FixedExpense[]): FixedExpensesByPocket {
    return expenses.reduce((groups, expense) => {
      const pocket = expense.pocket_name || `Bolsillo ${expense.pocket_id}`;
      if (!groups[pocket]) {
        groups[pocket] = [];
      }
      groups[pocket].push(expense);
      return groups;
    }, {} as FixedExpensesByPocket);
  }

  /**
   * Marca un gasto fijo como pagado/no pagado
   * PUT /api/fixed-expenses/{id}/status
   */
  togglePaymentStatus(expenseId: number, isPaid: boolean): Observable<boolean> {
    const url = `${environment.fixedExpensesUrl}/${expenseId}/status`;
    console.log(`Cambiando estado de pago para gasto ${expenseId} a:`, isPaid);

    const body = { is_paid: isPaid };

    return this.http.put<{success: boolean}>(url, body, this.httpOptions).pipe(
      map(response => {
        console.log('Estado de pago actualizado exitosamente:', response);
        return response.success || true;
      }),
      catchError(error => {
        console.error('Error actualizando estado de pago:', error);
        console.error('URL utilizada:', url);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error actualizando estado de pago: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Obtiene el estado de un gasto (paid, due, overdue)
   */
  getExpenseStatus(expense: FixedExpense): 'paid' | 'due' | 'overdue' {
    if (expense.is_paid) return 'paid';
    
    const today = new Date();
    const paymentDate = new Date(today.getFullYear(), today.getMonth(), expense.payment_day);
    
    if (paymentDate < today) return 'overdue';
    return 'due';
  }

  /**
   * Calcula el total de gastos fijos
   */
  calculateTotal(expenses: FixedExpense[]): number {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  /**
   * Maneja errores HTTP de manera consistente
   */
  private handleHttpError(error: any): void {
    if (error.status === 0) {
      console.error('Error de red - No se puede conectar al servidor');
    } else if (error.status >= 400 && error.status < 500) {
      console.error('Error del cliente:', error.status, error.message);
    } else if (error.status >= 500) {
      console.error('Error del servidor:', error.status, error.message);
    }
  }
}