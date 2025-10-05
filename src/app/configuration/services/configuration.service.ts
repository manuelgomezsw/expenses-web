import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Salary } from '../../domain/salary';
import { FixedExpense } from '../../domain/fixed-expense';
import { DailyExpensesConfig } from '../../domain/daily-expenses-config';
import { Pocket } from '../../domain/pocket';
import { NotificationService } from '../../services/notification/notification.service';
import { HttpErrorHandlerService } from '../../shared/services/http-error-handler.service';
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
  pocket_id: number;
  concept_name: string;
  amount: number;
  payment_day: number;
  expense_type?: 'fixed' | 'hybrid';
  budget_limit?: number;
}

export interface CreateFixedExpenseBackendRequest extends CreateFixedExpenseRequest {
  month: string;
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
    private notificationService: NotificationService,
    private errorHandler: HttpErrorHandlerService
  ) { }

  // Método handleHttpError movido a HttpErrorHandlerService para evitar duplicación

  /**
   * Obtiene toda la configuración financiera del mes
   * Conecta con el backend para obtener el salario (income) y gastos fijos
   */
  getFinancialConfiguration(month: string): Observable<FinancialConfiguration> {
    return forkJoin({
      salary: this.getSalary(month),
      fixedExpenses: this.getFixedExpenses(month),
      dailyExpensesConfig: this.getDailyExpensesConfig(month)
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
        this.errorHandler.handleError(error);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error cargando salario: ${error.message || 'Error de conexión'}`));
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
        this.errorHandler.handleError(error);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error actualizando salario: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Obtiene los gastos fijos del mes desde el backend
   * GET /api/config/fixed-expenses/{month}
   * Respuesta: array de gastos fijos
   */
  getFixedExpenses(month: string): Observable<FixedExpense[]> {
    const url = `${environment.fixedExpensesUrl}/${month}`;
    console.log('Obteniendo gastos fijos desde:', url);
    
    return this.http.get<FixedExpense[]>(url).pipe(
      map(response => {
        console.log('Gastos fijos obtenidos exitosamente:', response);
        
        // Validar que la respuesta sea un array
        if (Array.isArray(response)) {
          // Asegurar que cada gasto tenga la estructura correcta
          return response.map(expense => ({
            ...expense,
            month: month, // Asegurar que tenga el mes correcto
            is_paid: expense.is_paid || false, // Valor por defecto
            created_at: expense.created_at || new Date().toISOString()
          }));
        } else {
          console.log('Respuesta no es array, retornando array vacío');
          return [];
        }
      }),
      catchError(error => {
        console.error('Error obteniendo gastos fijos del backend:', error);
        console.error('URL utilizada:', url);
        
        // Manejar error según contrato estándar
        this.errorHandler.handleError(error);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error cargando gastos fijos: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Obtiene la configuración de gastos diarios del mes
   * GET /api/daily-expenses/config/{month}
   */
  getDailyExpensesConfig(month: string): Observable<DailyExpensesConfig> {
    const url = `${environment.dailyExpensesConfigUrl}/${month}`;
    console.log('Obteniendo configuración de gastos diarios desde:', url);

    return this.http.get<DailyExpensesConfig>(url).pipe(
      map(response => {
        console.log('Configuración de gastos diarios obtenida exitosamente:', response);
        
        // Asegurar que la respuesta tenga la estructura correcta
        return {
          ...response,
          month: response.month || month,
          monthly_budget: response.monthly_budget || 0
        };
      }),
      catchError(error => {
        console.error('Error obteniendo configuración de gastos diarios del backend:', error);
        console.error('URL utilizada:', url);
        
        // Manejar error según contrato estándar
        this.errorHandler.handleError(error);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error cargando configuración de gastos diarios: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Actualiza el presupuesto de gastos diarios
   * PUT /api/daily-expenses/config/{month}
   */
  updateDailyBudget(month: string, request: UpdateDailyBudgetRequest): Observable<DailyExpensesConfig> {
    const url = `${environment.dailyExpensesConfigUrl}/${month}`;
    console.log('Actualizando presupuesto diario en:', url, 'con datos:', request);
    
    return this.http.put<DailyExpensesConfig>(url, request, this.httpOptions).pipe(
      map(response => {
        console.log('Presupuesto diario actualizado exitosamente:', response);
        
        // Asegurar que la respuesta tenga la estructura correcta
        const updatedConfig: DailyExpensesConfig = {
          ...response,
          month: response.month || month,
          monthly_budget: response.monthly_budget || request.monthly_budget
        };
        
        return updatedConfig;
      }),
      catchError(error => {
        console.error('Error actualizando presupuesto diario en el backend:', error);
        console.error('URL utilizada:', url);
        console.error('Datos enviados:', request);
        
        // Manejar error según contrato estándar
        this.errorHandler.handleError(error);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error actualizando presupuesto diario: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Crea un nuevo gasto fijo en el backend
   * POST /api/fixed-expenses
   */
  createFixedExpense(month: string, request: CreateFixedExpenseRequest): Observable<FixedExpense> {
    const url = environment.fixedExpensesUrl;
    const requestWithMonth: CreateFixedExpenseBackendRequest = { ...request, month };
    console.log('Creando gasto fijo en:', url, 'con datos:', requestWithMonth);
    
    return this.http.post<FixedExpense>(url, requestWithMonth, this.httpOptions).pipe(
      map(response => {
        console.log('Gasto fijo creado exitosamente:', response);
        
        // Asegurar que la respuesta tenga la estructura correcta
        const newExpense: FixedExpense = {
          id: response.id,
          pocket_id: response.pocket_id || request.pocket_id,
          pocket_name: response.pocket_name, // Viene del backend para mostrar en UI
          concept_name: response.concept_name || request.concept_name,
          amount: response.amount || request.amount,
          payment_day: response.payment_day || request.payment_day,
          month: response.month || month,
          is_paid: response.is_paid || false,
          paid_date: response.paid_date || undefined,
          expense_type: response.expense_type || request.expense_type || 'fixed',
          budget_limit: response.budget_limit || request.budget_limit,
          current_spent: response.current_spent || 0,
          transactions: response.transactions || [],
          created_at: response.created_at || new Date().toISOString()
        };
        
        return newExpense;
      }),
      catchError(error => {
        console.error('Error creando gasto fijo en el backend:', error);
        console.error('URL utilizada:', url);
        console.error('Datos enviados:', requestWithMonth);
        
        // Manejar error según contrato estándar
        this.errorHandler.handleError(error);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error creando gasto fijo: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Actualiza un gasto fijo existente en el backend
   * PUT /api/config/fixed-expenses/{id}
   */
  updateFixedExpense(expense: FixedExpense): Observable<FixedExpense> {
    const url = `${environment.fixedExpensesUrl}/${expense.id}`;
    console.log('Actualizando gasto fijo en:', url, 'con datos:', expense);
    
    return this.http.put<FixedExpense>(url, expense, this.httpOptions).pipe(
      map(response => {
        console.log('Gasto fijo actualizado exitosamente:', response);
        
        // Asegurar que la respuesta tenga la estructura correcta
        const updatedExpense: FixedExpense = {
          ...response,
          is_paid: response.is_paid || false,
          created_at: response.created_at || expense.created_at || new Date().toISOString()
        };
        
        return updatedExpense;
      }),
      catchError(error => {
        console.error('Error actualizando gasto fijo en el backend:', error);
        console.error('URL utilizada:', url);
        console.error('Datos enviados:', expense);
        
        // Manejar error según contrato estándar
        this.errorHandler.handleError(error);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error actualizando gasto fijo: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Elimina un gasto fijo del backend
   * DELETE /api/config/fixed-expenses/{id}
   */
  deleteFixedExpense(expenseId: number): Observable<boolean> {
    const url = `${environment.fixedExpensesUrl}/${expenseId}`;
    console.log('Eliminando gasto fijo en:', url);
    
    return this.http.delete<void>(url, this.httpOptions).pipe(
      map(() => {
        console.log('Gasto fijo eliminado exitosamente');
        return true;
      }),
      catchError(error => {
        console.error('Error eliminando gasto fijo en el backend:', error);
        console.error('URL utilizada:', url);
        
        // Manejar error según contrato estándar
        this.errorHandler.handleError(error);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error eliminando gasto fijo: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Crea un nuevo bolsillo en el backend
   * POST /api/config/pockets
   */
  createPocket(name: string, description?: string): Observable<Pocket> {
    const url = environment.pocketsApiUrl;
    const request = { name, description };
    console.log('Creando bolsillo en:', url, 'con datos:', request);
    
    return this.http.post<Pocket>(url, request, this.httpOptions).pipe(
      map(response => {
        console.log('Bolsillo creado exitosamente:', response);
        
        // Asegurar que la respuesta tenga la estructura correcta
        const newPocket: Pocket = {
          ...response,
          created_at: response.created_at || new Date().toISOString()
        };
        
        return newPocket;
      }),
      catchError(error => {
        console.error('Error creando bolsillo en el backend:', error);
        console.error('URL utilizada:', url);
        console.error('Datos enviados:', request);
        
        // Manejar error según contrato estándar
        this.errorHandler.handleError(error);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error creando bolsillo: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Actualiza un bolsillo existente en el backend
   * PUT /api/config/pockets/{id}
   */
  updatePocket(pocket: Pocket): Observable<Pocket> {
    const url = `${environment.pocketsApiUrl}/${pocket.id}`;
    console.log('Actualizando bolsillo en:', url, 'con datos:', pocket);
    
    return this.http.put<Pocket>(url, pocket, this.httpOptions).pipe(
      map(response => {
        console.log('Bolsillo actualizado exitosamente:', response);
        
        // Asegurar que la respuesta tenga la estructura correcta
        const updatedPocket: Pocket = {
          ...response,
          created_at: response.created_at || pocket.created_at || new Date().toISOString()
        };
        
        return updatedPocket;
      }),
      catchError(error => {
        console.error('Error actualizando bolsillo en el backend:', error);
        console.error('URL utilizada:', url);
        console.error('Datos enviados:', pocket);
        
        // Manejar error según contrato estándar
        this.errorHandler.handleError(error);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error actualizando bolsillo: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Elimina un bolsillo del backend
   * DELETE /api/config/pockets/{id}
   */
  deletePocket(pocketId: number): Observable<boolean> {
    const url = `${environment.pocketsApiUrl}/${pocketId}`;
    console.log('Eliminando bolsillo en:', url);
    
    return this.http.delete<void>(url, this.httpOptions).pipe(
      map(() => {
        console.log('Bolsillo eliminado exitosamente');
        return true;
      }),
      catchError(error => {
        console.error('Error eliminando bolsillo en el backend:', error);
        console.error('URL utilizada:', url);
        
        // Manejar error según contrato estándar
        this.errorHandler.handleError(error);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error eliminando bolsillo: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Extrae bolsillos únicos de los gastos fijos
   */
  private extractPocketsFromExpenses(expenses: FixedExpense[]): Pocket[] {
    const pocketMap = new Map<number, string>();
    expenses.forEach(e => {
      if (e.pocket_name) {
        pocketMap.set(e.pocket_id, e.pocket_name);
      }
    });
    
    return Array.from(pocketMap.entries()).map(([id, name]) => ({
      id: id,
      name: name,
      description: `Bolsillo para gastos de ${name.toLowerCase()}`
    }));
  }

  /**
   * Obtiene los bolsillos disponibles desde el backend
   * GET /api/config/pockets
   */
  getAvailablePockets(): Observable<Pocket[]> {
    const url = environment.pocketsApiUrl;
    console.log('Obteniendo bolsillos disponibles desde:', url);
    
    return this.http.get<Pocket[]>(url).pipe(
      map(response => {
        console.log('Bolsillos obtenidos exitosamente:', response);
        
        // Validar que la respuesta sea un array
        if (Array.isArray(response)) {
          // Asegurar que cada bolsillo tenga la estructura correcta
          return response.map(pocket => ({
            ...pocket,
            created_at: pocket.created_at || new Date().toISOString()
          }));
        } else {
          console.log('Respuesta no es array, retornando array vacío');
          return [];
        }
      }),
      catchError(error => {
        console.error('Error obteniendo bolsillos del backend:', error);
        console.error('URL utilizada:', url);
        
        // Manejar error según contrato estándar
        this.errorHandler.handleError(error);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error cargando bolsillos: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Prueba la conectividad específicamente con el endpoint de fixed-expenses
   * GET /api/fixed-expenses/test
   */
  testFixedExpensesEndpoint(): Observable<{status: string, message: string}> {
    const url = `${environment.fixedExpensesUrl}/test`;
    console.log('Probando endpoint de fixed-expenses:', url);
    
    return this.http.get<{status: string, message: string}>(url).pipe(
      map(response => {
        console.log('Endpoint de fixed-expenses disponible:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error probando endpoint de fixed-expenses:', error);
        console.error('URL utilizada:', url);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error probando endpoint fixed-expenses: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Prueba la conectividad con el backend
   * GET /api/config/health
   */
  testBackendConnectivity(): Observable<{status: string, timestamp: string}> {
    const url = `${environment.pocketsApiUrl.replace('/pockets', '/health')}`;
    console.log('Probando conectividad del backend:', url);
    
    return this.http.get<{status: string, timestamp: string}>(url).pipe(
      map(response => {
        console.log('Backend conectado exitosamente:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error conectando con el backend:', error);
        console.error('URL utilizada:', url);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error probando conectividad del backend: ${error.message || 'Error de conexión'}`));
      })
    );
  }

  /**
   * Marca un gasto fijo como pagado/no pagado
   * PATCH /api/config/fixed-expenses/{id}/payment-status
   */
  toggleFixedExpensePaymentStatus(expenseId: number, isPaid: boolean, paidDate?: string): Observable<FixedExpense> {
    const url = `${environment.fixedExpensesUrl}/${expenseId}/payment-status`;
    const request = { is_paid: isPaid, paid_date: paidDate };
    console.log('Actualizando estado de pago en:', url, 'con datos:', request);
    
    return this.http.patch<FixedExpense>(url, request, this.httpOptions).pipe(
      map(response => {
        console.log('Estado de pago actualizado exitosamente:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error actualizando estado de pago:', error);
        console.error('URL utilizada:', url);
        console.error('Datos enviados:', request);
        
        // Manejar error según contrato estándar
        this.errorHandler.handleError(error);
        
        // Propagar el error sin fallback
        return throwError(() => new Error(`Error cambiando estado de pago: ${error.message || 'Error de conexión'}`));
      })
    );
  }
}