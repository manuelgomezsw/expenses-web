import { Injectable } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { Salary } from '../../domain/salary';
import { FixedExpense } from '../../domain/fixed-expense';
import { MecatoConfig } from '../../domain/mecato-config';

export interface MonthlySummary {
  salary: number;
  totalFixedExpenses: number;
  mecatoBudget: number;
  availableAfterFixed: number;
  month: string;
}

@Injectable({
  providedIn: 'root'
})
export class SummaryService {

  constructor() { }

  /**
   * Obtiene el resumen financiero del mes
   * En el futuro se conectará a: GET /api/summary/{month}
   */
  getMonthlySummary(month: string): Observable<MonthlySummary> {
    // Mock data - será reemplazado por llamada HTTP real
    const mockSalary: Salary = {
      id: 1,
      monthly_amount: 4500000,
      month: month,
      created_at: new Date().toISOString()
    };

    const mockFixedExpenses: FixedExpense[] = [
      { id: 1, pocket_name: 'Vivienda', concept_name: 'Arriendo', amount: 1200000, payment_day: 5, is_paid: true, month: month },
      { id: 2, pocket_name: 'Vivienda', concept_name: 'Servicios públicos', amount: 350000, payment_day: 15, is_paid: false, month: month },
      { id: 3, pocket_name: 'Vivienda', concept_name: 'Internet', amount: 89000, payment_day: 20, is_paid: false, month: month },
      { id: 4, pocket_name: 'Transporte', concept_name: 'Gasolina', amount: 400000, payment_day: 1, is_paid: true, month: month },
      { id: 5, pocket_name: 'Transporte', concept_name: 'SOAT', amount: 180000, payment_day: 25, is_paid: false, month: month },
      { id: 6, pocket_name: 'Alimentación', concept_name: 'Mercado semanal', amount: 600000, payment_day: 7, is_paid: true, month: month },
      { id: 7, pocket_name: 'Salud', concept_name: 'EPS', amount: 120000, payment_day: 10, is_paid: false, month: month },
      { id: 8, pocket_name: 'Salud', concept_name: 'Medicina prepagada', amount: 250000, payment_day: 12, is_paid: false, month: month }
    ];

    const mockMecatoConfig: MecatoConfig = {
      id: 1,
      monthly_budget: 500000,
      month: month
    };

    // Simular llamadas asíncronas y combinar resultados
    return combineLatest([
      of(mockSalary),
      of(mockFixedExpenses),
      of(mockMecatoConfig)
    ]).pipe(
      map(([salary, fixedExpenses, mecatoConfig]) => {
        const totalFixedExpenses = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const availableAfterFixed = salary.monthly_amount - totalFixedExpenses - mecatoConfig.monthly_budget;

        return {
          salary: salary.monthly_amount,
          totalFixedExpenses,
          mecatoBudget: mecatoConfig.monthly_budget,
          availableAfterFixed,
          month: month
        };
      })
    );
  }

  /**
   * Actualiza el salario mensual
   * En el futuro se conectará a: PUT /api/salary/{month}
   */
  updateSalary(month: string, amount: number): Observable<boolean> {
    // Mock implementation
    console.log(`Updating salary for ${month}: ${amount}`);
    return of(true);
  }
}
