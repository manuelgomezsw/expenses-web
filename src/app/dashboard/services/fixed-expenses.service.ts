import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { FixedExpense } from '../../domain/fixed-expense';
import { HttpErrorHandlerService } from '../../shared/services/http-error-handler.service';
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

  constructor(
    private http: HttpClient,
    private errorHandler: HttpErrorHandlerService
  ) { }

  /**
   * Obtiene todos los gastos fijos del mes desde el backend
   * GET /api/fixed-expenses/by-month/{month}
   */
  getFixedExpenses(month: string): Observable<FixedExpense[]> {
    const url = `${environment.fixedExpensesUrl}/by-month/${month}`;
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
   * Agrupa los gastos fijos por bolsillo y los ordena
   */
  groupExpensesByPocket(expenses: FixedExpense[]): FixedExpensesByPocket {
    const groups = expenses.reduce((groups, expense) => {
      const pocket = expense.pocket_name || `Bolsillo ${expense.pocket_id}`;
      if (!groups[pocket]) {
        groups[pocket] = [];
      }
      groups[pocket].push(expense);
      return groups;
    }, {} as FixedExpensesByPocket);

    // Ordenar gastos dentro de cada bolsillo
    Object.keys(groups).forEach(pocketName => {
      groups[pocketName] = this.sortExpensesByStatusAndAmount(groups[pocketName]);
    });

    return groups;
  }

  /**
   * Ordena gastos por estado (vencido → pendiente → pagado) y luego por monto (mayor a menor)
   * 
   * Ejemplo de resultado:
   * 1. Servicios: $300,000 (vencido)
   * 2. Arriendo: $1,200,000 (pendiente) 
   * 3. Celular: $50,000 (pendiente)
   * 4. Internet: $80,000 (pagado)
   */
  sortExpensesByStatusAndAmount(expenses: FixedExpense[]): FixedExpense[] {
    return expenses.sort((a, b) => {
      // Primer criterio: ordenar por estado (vencido → pendiente → pagado)
      const statusA = this.getExpenseStatus(a);
      const statusB = this.getExpenseStatus(b);
      
      const statusOrder = { 'overdue': 0, 'due': 1, 'paid': 2 };
      const statusDiff = statusOrder[statusA] - statusOrder[statusB];
      if (statusDiff !== 0) {
        return statusDiff;
      }

      // Segundo criterio: ordenar por monto (mayor a menor)
      return b.amount - a.amount;
    });
  }

  /**
   * Filtra gastos por estado
   */
  filterExpensesByStatus(expenses: FixedExpense[], filter: 'all' | 'paid' | 'pending'): FixedExpense[] {
    if (filter === 'all') {
      return expenses;
    }
    
    if (filter === 'paid') {
      return expenses.filter(expense => expense.is_paid);
    }
    
    if (filter === 'pending') {
      return expenses.filter(expense => !expense.is_paid);
    }
    
    return expenses;
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

  // Método handleHttpError movido a HttpErrorHandlerService para evitar duplicación
}