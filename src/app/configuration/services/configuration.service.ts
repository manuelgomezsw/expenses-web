import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Salary } from '../../domain/salary';
import { FixedExpense } from '../../domain/fixed-expense';
import { DailyExpensesConfig } from '../../domain/daily-expenses-config';
import { Pocket } from '../../domain/pocket';
import { MockDataService } from '../../services/mock-data.service';
import { NotificationService } from '../../services/notification/notification.service';
import { environment } from '../../../environments/environment';

// Interfaces para el manejo de errores del backend
export interface BackendErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
}

export interface FinancialConfiguration {
  salary: Salary;
  pockets: Pocket[];
  fixedExpenses: FixedExpense[];
  dailyExpensesConfig: DailyExpensesConfig;
}

export interface CreateFixedExpenseRequest {
  pocket_name: string;
  concept_name: string;
  amount: number;
  payment_day: number;
}

export interface UpdateSalaryRequest {
  monthly_amount: number;
}

export interface UpdateDailyBudgetRequest {
  monthly_budget: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService,
    private notificationService: NotificationService
  ) { }

  /**
   * Maneja errores HTTP según el contrato estándar del backend
   */
  private handleHttpError(error: HttpErrorResponse): Observable<never> {
    console.error('Error HTTP completo:', {
      status: error.status,
      statusText: error.statusText,
      error: error.error,
      url: error.url
    });
    
    if (error.status >= 400 && error.status < 500) {
      // Errores 4xx: mostrar el mensaje del campo "error"
      const backendError = error.error as BackendErrorResponse;
      const errorMessage = backendError?.error || 'Error en la solicitud';
      console.log('Error 4xx - Mostrando mensaje específico:', errorMessage);
      this.notificationService.openSnackBar(errorMessage);
    } else if (error.status >= 500) {
      // Errores 5xx: mensaje genérico
      console.log('Error 5xx - Mostrando mensaje genérico');
      this.notificationService.openSnackBar('Ocurrió un error interno. Por favor, inténtalo nuevamente.');
    } else if (error.status === 0) {
      // Error de red (servidor no disponible)
      console.log('Error de red - Servidor no disponible');
      this.notificationService.openSnackBar('No se pudo conectar al servidor. Verificando disponibilidad...');
    } else {
      // Otros errores
      console.log('Error desconocido:', error.status);
      this.notificationService.openSnackBar('Error de conexión. Por favor, inténtalo nuevamente.');
    }
    
    return throwError(() => error);
  }

  /**
   * Obtiene toda la configuración financiera del mes
   * Conecta con el backend para obtener el salario (income)
   */
  getFinancialConfiguration(month: string): Observable<FinancialConfiguration> {
    return forkJoin({
      salary: this.getSalary(month),
      fixedExpenses: this.mockDataService.getFixedExpenses(month),
      dailyExpensesConfig: this.mockDataService.getDailyExpensesConfig(month)
    }).pipe(
      map(({ salary, fixedExpenses, dailyExpensesConfig }) => {
        // Extract unique pockets from fixed expenses
        const pockets = this.extractPocketsFromExpenses(fixedExpenses);
        
        return {
          salary,
          pockets,
          fixedExpenses,
          dailyExpensesConfig
        };
      })
    );
  }

  /**
   * Obtiene el salario/ingreso mensual del backend
   * GET /api/config/income/{month}
   * Respuesta: objeto único con propiedad monthly_amount
   */
  getSalary(month: string): Observable<Salary> {
    const url = `${environment.incomeUrl}/${month}`;
    console.log('Obteniendo salario desde:', url);
    
    return this.http.get<{monthly_amount: number}>(url).pipe(
      map(response => {
        console.log('Respuesta del backend (objeto único):', response);
        
        // El backend retorna solo {monthly_amount: number}
        if (response && typeof response.monthly_amount === 'number') {
          const salary: Salary = {
            id: 1, // ID por defecto ya que el backend no lo retorna
            monthly_amount: response.monthly_amount,
            month: month,
            created_at: new Date().toISOString()
          };
          console.log('Salario obtenido exitosamente:', salary);
          return salary;
        } else {
          // Si no hay datos válidos, crear un salario por defecto
          const defaultSalary: Salary = {
            id: 0,
            monthly_amount: 0,
            month: month,
            created_at: new Date().toISOString()
          };
          console.log('Respuesta inválida, usando valores por defecto:', defaultSalary);
          return defaultSalary;
        }
      }),
      catchError(error => {
        console.error('Error obteniendo salario del backend:', error);
        console.error('URL utilizada:', url);
        
        // Manejar error según contrato estándar
        this.handleHttpError(error);
        
        console.log('Usando datos mock como fallback');
        // Fallback a datos mock en caso de error
        return this.mockDataService.getSalary(month);
      })
    );
  }

  /**
   * Actualiza el salario mensual en el backend
   * PUT /api/config/income/{month}
   * Respuesta: objeto único con propiedad monthly_amount
   */
  updateSalary(month: string, request: UpdateSalaryRequest): Observable<Salary> {
    const url = `${environment.incomeUrl}/${month}`;
    console.log('Actualizando salario en:', url, 'con datos:', request);
    
    return this.http.put<{monthly_amount: number}>(url, request, this.httpOptions).pipe(
      map(response => {
        console.log('Salario actualizado exitosamente (objeto único):', response);
        
        // El backend retorna solo {monthly_amount: number}
        if (response && typeof response.monthly_amount === 'number') {
          const updatedSalary: Salary = {
            id: 1, // ID por defecto ya que el backend no lo retorna
            monthly_amount: response.monthly_amount,
            month: month,
            created_at: new Date().toISOString()
          };
          console.log('Salario procesado correctamente:', updatedSalary);
          return updatedSalary;
        } else {
          // Si la respuesta no tiene la estructura esperada, usar los datos enviados
          const updatedSalary: Salary = {
            id: 1,
            monthly_amount: request.monthly_amount,
            month: month,
            created_at: new Date().toISOString()
          };
          console.log('Respuesta inesperada, usando datos enviados:', updatedSalary);
          return updatedSalary;
        }
      }),
      catchError(error => {
        console.error('Error actualizando salario en el backend:', error);
        console.error('URL utilizada:', url);
        console.error('Datos enviados:', request);
        
        // Manejar error según contrato estándar
        this.handleHttpError(error);
        
        // Fallback a implementación mock en caso de error
        const updatedSalary: Salary = {
          id: 1,
          monthly_amount: request.monthly_amount,
          month: month,
          created_at: new Date().toISOString()
        };
        console.log('Usando fallback mock para salario:', updatedSalary);
        return of(updatedSalary);
      })
    );
  }

  /**
   * Actualiza el presupuesto de gastos diarios
   * En el futuro se conectará a: PUT /api/daily-expenses/budget/{month}
   */
  updateDailyBudget(month: string, request: UpdateDailyBudgetRequest): Observable<DailyExpensesConfig> {
    // Mock implementation
    const updatedConfig: DailyExpensesConfig = {
      id: 1,
      monthly_budget: request.monthly_budget,
      month: month
    };
    console.log('Updating daily budget:', updatedConfig);
    return of(updatedConfig);
  }

  /**
   * Crea un nuevo gasto fijo
   * En el futuro se conectará a: POST /api/fixed-expenses
   */
  createFixedExpense(month: string, request: CreateFixedExpenseRequest): Observable<FixedExpense> {
    // Mock implementation
    const newExpense: FixedExpense = {
      id: Math.floor(Math.random() * 1000) + 100,
      pocket_name: request.pocket_name,
      concept_name: request.concept_name,
      amount: request.amount,
      payment_day: request.payment_day,
      is_paid: false,
      month: month,
      created_at: new Date().toISOString()
    };
    console.log('Creating fixed expense:', newExpense);
    return of(newExpense);
  }

  /**
   * Actualiza un gasto fijo existente
   * En el futuro se conectará a: PUT /api/fixed-expenses/{id}
   */
  updateFixedExpense(expense: FixedExpense): Observable<FixedExpense> {
    // Mock implementation
    const updatedExpense: FixedExpense = {
      ...expense,
      created_at: expense.created_at || new Date().toISOString()
    };
    console.log('Updating fixed expense:', updatedExpense);
    return of(updatedExpense);
  }

  /**
   * Elimina un gasto fijo
   * En el futuro se conectará a: DELETE /api/fixed-expenses/{id}
   */
  deleteFixedExpense(expenseId: number): Observable<boolean> {
    // Mock implementation
    console.log('Deleting fixed expense:', expenseId);
    return of(true);
  }

  /**
   * Crea un nuevo bolsillo
   * En el futuro se conectará a: POST /api/pockets
   */
  createPocket(name: string, description?: string): Observable<Pocket> {
    // Mock implementation
    const newPocket: Pocket = {
      id: Math.floor(Math.random() * 1000) + 100,
      name: name,
      description: description,
      created_at: new Date().toISOString()
    };
    console.log('Creating pocket:', newPocket);
    return of(newPocket);
  }

  /**
   * Actualiza un bolsillo existente
   * En el futuro se conectará a: PUT /api/pockets/{id}
   */
  updatePocket(pocket: Pocket): Observable<Pocket> {
    // Mock implementation
    const updatedPocket: Pocket = {
      ...pocket,
      created_at: pocket.created_at || new Date().toISOString()
    };
    console.log('Updating pocket:', updatedPocket);
    return of(updatedPocket);
  }

  /**
   * Elimina un bolsillo
   * En el futuro se conectará a: DELETE /api/pockets/{id}
   */
  deletePocket(pocketId: number): Observable<boolean> {
    // Mock implementation
    console.log('Deleting pocket:', pocketId);
    return of(true);
  }

  /**
   * Extrae bolsillos únicos de los gastos fijos
   */
  private extractPocketsFromExpenses(expenses: FixedExpense[]): Pocket[] {
    const pocketNames = [...new Set(expenses.map(e => e.pocket_name))];
    return pocketNames.map((name, index) => ({
      id: index + 1,
      name: name,
      description: `Bolsillo para gastos de ${name.toLowerCase()}`
    }));
  }

  /**
   * Obtiene los bolsillos disponibles
   */
  getAvailablePockets(): Observable<Pocket[]> {
    // Mock implementation - en el futuro será: GET /api/pockets
    const mockPockets: Pocket[] = [
      { id: 1, name: 'Vivienda', description: 'Gastos relacionados con la vivienda' },
      { id: 2, name: 'Transporte', description: 'Gastos de transporte y vehículo' },
      { id: 3, name: 'Alimentación', description: 'Gastos de comida y mercado' },
      { id: 4, name: 'Salud', description: 'Gastos médicos y de salud' },
      { id: 5, name: 'Educación', description: 'Gastos educativos y capacitación' },
      { id: 6, name: 'Entretenimiento', description: 'Gastos de ocio y entretenimiento' }
    ];
    return of(mockPockets);
  }
}