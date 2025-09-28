import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Salary } from '../domain/salary';
import { FixedExpense } from '../domain/fixed-expense';
import { DailyExpense } from '../domain/daily-expense';
import { DailyExpensesConfig } from '../domain/daily-expenses-config';

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
        is_paid: this.shouldExpenseBePaid(month, 5),
        month: month,
        paid_date: this.shouldExpenseBePaid(month, 5) ? this.getPaidDate(month, 5) : undefined
      },
      {
        id: 2,
        pocket_name: 'Vivienda',
        concept_name: 'Servicios públicos',
        amount: 350000,
        payment_day: 15,
        is_paid: this.shouldExpenseBePaid(month, 15),
        month: month,
        paid_date: this.shouldExpenseBePaid(month, 15) ? this.getPaidDate(month, 15) : undefined
      },
      {
        id: 3,
        pocket_name: 'Vivienda',
        concept_name: 'Internet',
        amount: 89000,
        payment_day: 20,
        is_paid: this.shouldExpenseBePaid(month, 20),
        month: month,
        paid_date: this.shouldExpenseBePaid(month, 20) ? this.getPaidDate(month, 20) : undefined
      },
      // Bolsillo: Transporte
      {
        id: 4,
        pocket_name: 'Transporte',
        concept_name: 'Gasolina',
        amount: 400000,
        payment_day: 1,
        is_paid: this.shouldExpenseBePaid(month, 1),
        month: month,
        paid_date: this.shouldExpenseBePaid(month, 1) ? this.getPaidDate(month, 1) : undefined
      },
      {
        id: 5,
        pocket_name: 'Transporte',
        concept_name: 'SOAT',
        amount: 180000,
        payment_day: 25,
        is_paid: this.shouldExpenseBePaid(month, 25),
        month: month,
        paid_date: this.shouldExpenseBePaid(month, 25) ? this.getPaidDate(month, 25) : undefined
      },
      // Bolsillo: Alimentación
      {
        id: 6,
        pocket_name: 'Alimentación',
        concept_name: 'Mercado semanal',
        amount: 600000,
        payment_day: 7,
        is_paid: this.shouldExpenseBePaid(month, 7),
        month: month,
        paid_date: this.shouldExpenseBePaid(month, 7) ? this.getPaidDate(month, 7) : undefined
      },
      // Bolsillo: Salud
      {
        id: 7,
        pocket_name: 'Salud',
        concept_name: 'EPS',
        amount: 120000,
        payment_day: 10,
        is_paid: this.shouldExpenseBePaid(month, 20),
        month: month,
        paid_date: this.shouldExpenseBePaid(month, 20) ? this.getPaidDate(month, 20) : undefined
      },
      {
        id: 8,
        pocket_name: 'Salud',
        concept_name: 'Medicina prepagada',
        amount: 250000,
        payment_day: 12,
        is_paid: this.shouldExpenseBePaid(month, 20),
        month: month,
        paid_date: this.shouldExpenseBePaid(month, 20) ? this.getPaidDate(month, 20) : undefined
      }
    ];
    return of(mockFixedExpenses);
  }

  // Configuración de gastos diarios mock
  getDailyExpensesConfig(month: string): Observable<DailyExpensesConfig> {
    const mockConfig: DailyExpensesConfig = {
      id: 1,
      monthly_budget: 500000,
      month: month
    };
    return of(mockConfig);
  }

  // Gastos diarios mock
  getDailyExpenses(month: string): Observable<DailyExpense[]> {
    const mockDailyExpenses: DailyExpense[] = this.generateDailyExpensesForMonth(month);
    return of(mockDailyExpenses);
  }

  /**
   * Genera gastos diarios dinámicos para el mes especificado
   */
  private generateDailyExpensesForMonth(month: string): DailyExpense[] {
    const [year, monthNum] = month.split('-');
    const currentDate = new Date();
    const targetMonth = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    
    // Si es el mes actual, generar hasta la fecha actual
    // Si es un mes pasado, generar todo el mes
    // Si es un mes futuro, no generar gastos
    const isCurrentMonth = targetMonth.getFullYear() === currentDate.getFullYear() && 
                          targetMonth.getMonth() === currentDate.getMonth();
    const isFutureMonth = targetMonth > currentDate;
    
    if (isFutureMonth) {
      return []; // No hay gastos en meses futuros
    }
    
    const maxDay = isCurrentMonth ? currentDate.getDate() : new Date(parseInt(year), parseInt(monthNum), 0).getDate();
    const expenses: DailyExpense[] = [];
    
    // Gastos típicos que pueden aparecer
    const expenseTypes = [
      { description: 'Café en Juan Valdez', amount: 8500, frequency: 0.3 },
      { description: 'Almuerzo en el trabajo', amount: 25000, frequency: 0.4 },
      { description: 'Transporte público', amount: 3500, frequency: 0.6 },
      { description: 'Dulces para la niña', amount: 12000, frequency: 0.2 },
      { description: 'Libro', amount: 45000, frequency: 0.1 },
      { description: 'Cine con la familia', amount: 65000, frequency: 0.1 },
      { description: 'Helado', amount: 15000, frequency: 0.15 },
      { description: 'Farmacia', amount: 28000, frequency: 0.1 },
      { description: 'Café con amigos', amount: 18000, frequency: 0.2 },
      { description: 'Snacks', amount: 8000, frequency: 0.25 }
    ];
    
    let idCounter = 1;
    
    // Generar gastos para cada día del mes
    for (let day = 1; day <= maxDay; day++) {
      const dateStr = `${year}-${monthNum.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      // Cada día tiene una probabilidad de tener gastos
      expenseTypes.forEach(expenseType => {
        if (Math.random() < expenseType.frequency) {
          expenses.push({
            id: idCounter++,
            description: expenseType.description,
            amount: expenseType.amount + Math.floor(Math.random() * 5000) - 2500, // Variación de ±2500
            date: dateStr,
            created_at: `${dateStr}T${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00Z`
          });
        }
      });
    }
    
    // Ordenar por fecha descendente (más recientes primero)
    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Método para agregar nuevo gasto diario
  addDailyExpense(expense: DailyExpense): Observable<DailyExpense> {
    const newExpense: DailyExpense = {
      ...expense,
      id: Math.floor(Math.random() * 1000) + 100,
      created_at: new Date().toISOString()
    };
    return of(newExpense);
  }

  // Método para actualizar gasto diario
  updateDailyExpense(expense: DailyExpense): Observable<DailyExpense> {
    const updatedExpense: DailyExpense = {
      ...expense,
      created_at: expense.created_at || new Date().toISOString()
    };
    return of(updatedExpense);
  }

  // Método para eliminar gasto diario
  deleteDailyExpense(expenseId: number): Observable<boolean> {
    return of(true);
  }

  // Método para marcar gasto fijo como pagado
  markFixedExpenseAsPaid(expenseId: number): Observable<boolean> {
    return of(true);
  }

  /**
   * Determina si un gasto fijo debería estar pagado según el mes y día de pago
   */
  private shouldExpenseBePaid(month: string, paymentDay: number): boolean {
    const [year, monthNum] = month.split('-');
    const currentDate = new Date();
    const targetMonth = new Date(parseInt(year), parseInt(monthNum) - 1, paymentDay);
    
    // Si es un mes futuro, no está pagado
    if (targetMonth > currentDate) {
      return false;
    }
    
    // Si es el mes actual, verificar si ya pasó la fecha de pago
    if (targetMonth.getFullYear() === currentDate.getFullYear() && 
        targetMonth.getMonth() === currentDate.getMonth()) {
      return currentDate.getDate() >= paymentDay;
    }
    
    // Si es un mes pasado, está pagado
    return true;
  }

  /**
   * Genera la fecha de pago para un gasto fijo
   */
  private getPaidDate(month: string, paymentDay: number): string {
    const [year, monthNum] = month.split('-');
    return `${year}-${monthNum.padStart(2, '0')}-${paymentDay.toString().padStart(2, '0')}`;
  }
}
