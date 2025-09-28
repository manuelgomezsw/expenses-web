import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { FixedExpense } from '../../domain/fixed-expense';

export interface FixedExpensesByPocket {
  [pocketName: string]: FixedExpense[];
}

@Injectable({
  providedIn: 'root'
})
export class FixedExpensesService {

  constructor() { }

  /**
   * Obtiene todos los gastos fijos del mes agrupados por bolsillo
   * En el futuro se conectará a: GET /api/fixed-expenses/{month}
   */
  getFixedExpenses(month: string): Observable<FixedExpense[]> {
    // Mock data - será reemplazado por llamada HTTP real
    const mockFixedExpenses: FixedExpense[] = [
      // Bolsillo: Vivienda
      {
        id: 1,
        pocket_name: 'Vivienda',
        concept_name: 'Arriendo',
        amount: 1200000,
        payment_day: 5,
        is_paid: true,
        month: month,
        paid_date: '2024-01-05'
      },
      {
        id: 2,
        pocket_name: 'Vivienda',
        concept_name: 'Servicios públicos',
        amount: 350000,
        payment_day: 15,
        is_paid: false,
        month: month
      },
      {
        id: 3,
        pocket_name: 'Vivienda',
        concept_name: 'Internet',
        amount: 89000,
        payment_day: 20,
        is_paid: false,
        month: month
      },
      // Bolsillo: Transporte
      {
        id: 4,
        pocket_name: 'Transporte',
        concept_name: 'Gasolina',
        amount: 400000,
        payment_day: 1,
        is_paid: true,
        month: month,
        paid_date: '2024-01-01'
      },
      {
        id: 5,
        pocket_name: 'Transporte',
        concept_name: 'SOAT',
        amount: 180000,
        payment_day: 25,
        is_paid: false,
        month: month
      },
      // Bolsillo: Alimentación
      {
        id: 6,
        pocket_name: 'Alimentación',
        concept_name: 'Mercado semanal',
        amount: 600000,
        payment_day: 7,
        is_paid: true,
        month: month,
        paid_date: '2024-01-07'
      },
      // Bolsillo: Salud
      {
        id: 7,
        pocket_name: 'Salud',
        concept_name: 'EPS',
        amount: 120000,
        payment_day: 10,
        is_paid: false,
        month: month
      },
      {
        id: 8,
        pocket_name: 'Salud',
        concept_name: 'Medicina prepagada',
        amount: 250000,
        payment_day: 12,
        is_paid: false,
        month: month
      }
    ];

    return of(mockFixedExpenses);
  }

  /**
   * Agrupa los gastos fijos por bolsillo
   */
  groupExpensesByPocket(expenses: FixedExpense[]): FixedExpensesByPocket {
    return expenses.reduce((groups, expense) => {
      const pocket = expense.pocket_name;
      if (!groups[pocket]) {
        groups[pocket] = [];
      }
      groups[pocket].push(expense);
      return groups;
    }, {} as FixedExpensesByPocket);
  }

  /**
   * Marca un gasto fijo como pagado/no pagado
   * En el futuro se conectará a: PUT /api/fixed-expenses/{id}/toggle-payment
   */
  togglePaymentStatus(expenseId: number, isPaid: boolean): Observable<boolean> {
    // Mock implementation
    console.log(`Toggling payment status for expense ${expenseId}: ${isPaid}`);
    return of(true);
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
}
