import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Salary } from '../domain/salary';
import { FixedExpense } from '../domain/fixed-expense';
import { MecatoExpense } from '../domain/mecato-expense';
import { MecatoConfig } from '../domain/mecato-config';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  constructor() { }

  // Salario mock
  getSalary(month: string): Observable<Salary> {
    const mockSalary: Salary = {
      id: 1,
      monthly_amount: 4500000,
      month: month,
      created_at: new Date().toISOString()
    };
    return of(mockSalary);
  }

  // Gastos fijos mock
  getFixedExpenses(month: string): Observable<FixedExpense[]> {
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

  // Configuración de mecato mock
  getMecatoConfig(month: string): Observable<MecatoConfig> {
    const mockConfig: MecatoConfig = {
      id: 1,
      monthly_budget: 500000,
      month: month
    };
    return of(mockConfig);
  }

  // Gastos de mecato mock
  getMecatoExpenses(month: string): Observable<MecatoExpense[]> {
    const mockMecatoExpenses: MecatoExpense[] = [
      {
        id: 1,
        description: 'Café en Juan Valdez',
        amount: 8500,
        date: '2024-01-15',
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        description: 'Almuerzo con mi esposa',
        amount: 45000,
        date: '2024-01-14',
        created_at: '2024-01-14T13:15:00Z'
      },
      {
        id: 3,
        description: 'Libro "Cien años de soledad"',
        amount: 35000,
        date: '2024-01-13',
        created_at: '2024-01-13T16:45:00Z'
      },
      {
        id: 4,
        description: 'Helado para mi hija',
        amount: 12000,
        date: '2024-01-12',
        created_at: '2024-01-12T18:20:00Z'
      },
      {
        id: 5,
        description: 'Cine familiar',
        amount: 85000,
        date: '2024-01-11',
        created_at: '2024-01-11T20:00:00Z'
      },
      {
        id: 6,
        description: 'Dulces en la tienda',
        amount: 6500,
        date: '2024-01-10',
        created_at: '2024-01-10T15:30:00Z'
      }
    ];
    return of(mockMecatoExpenses);
  }

  // Método para agregar nuevo gasto de mecato
  addMecatoExpense(expense: MecatoExpense): Observable<MecatoExpense> {
    const newExpense: MecatoExpense = {
      ...expense,
      id: Math.floor(Math.random() * 1000) + 100,
      created_at: new Date().toISOString()
    };
    return of(newExpense);
  }

  // Método para actualizar gasto de mecato
  updateMecatoExpense(expense: MecatoExpense): Observable<MecatoExpense> {
    const updatedExpense: MecatoExpense = {
      ...expense,
      created_at: expense.created_at || new Date().toISOString()
    };
    return of(updatedExpense);
  }

  // Método para eliminar gasto de mecato
  deleteMecatoExpense(expenseId: number): Observable<boolean> {
    return of(true);
  }

  // Método para marcar gasto fijo como pagado
  markFixedExpenseAsPaid(expenseId: number): Observable<boolean> {
    return of(true);
  }
}
