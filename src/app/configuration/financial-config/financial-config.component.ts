import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

// Components and Services
import { MonthSelectorComponent } from '../../shared/components/month-selector/month-selector.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { ExpenseFormModalComponent, ExpenseFormData, ExpenseFormResult } from '../components/expense-form-modal/expense-form-modal.component';
import { PocketFormModalComponent, PocketFormData, PocketFormResult } from '../components/pocket-form-modal/pocket-form-modal.component';
import { HybridTransactionsModalComponent, HybridTransactionsData, HybridTransactionsResult } from '../components/hybrid-transactions-modal/hybrid-transactions-modal.component';
import { ConfigurationService, FinancialConfiguration, CreateFixedExpenseRequest, UpdateSalaryRequest, UpdateDailyBudgetRequest } from '../services/configuration.service';
import { HybridTransactionsService } from '../services/hybrid-transactions.service';
import { NotificationService } from '../../services/notification/notification.service';

// Utilities
import { DateUtils } from '../../shared/utils/date.utils';

// Domain Models
import { Salary } from '../../domain/salary';
import { FixedExpense } from '../../domain/fixed-expense';
import { DailyExpensesConfig } from '../../domain/daily-expenses-config';
import { Pocket } from '../../domain/pocket';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-financial-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MonthSelectorComponent,
    CurrencyPipe
  ],
  templateUrl: './financial-config.component.html',
  styleUrl: './financial-config.component.css',
  animations: [
    trigger('slideInOut', [
      state('in', style({
        height: '*',
        opacity: 1,
        overflow: 'visible'
      })),
      state('out', style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden'
      })),
      transition('in => out', [
        animate('300ms ease-in-out')
      ]),
      transition('out => in', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class FinancialConfigComponent implements OnInit, OnDestroy {
  
  // Current month
  currentMonth: string = DateUtils.getCurrentMonth();
  
  // Configuration data
  configuration: FinancialConfiguration | null = null;
  availablePockets: Pocket[] = [];
  
  // Loading states
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';
  
  // Edit modes
  isEditingSalary: boolean = false;
  isEditingDailyBudget: boolean = false;
  isAddingFixedExpense: boolean = false;
  editingFixedExpenseId: number | null = null;
  
  // Form data
  salaryForm = { monthly_amount: 0 };
  dailyBudgetForm = { monthly_budget: 0 };
  fixedExpenseForm: CreateFixedExpenseRequest = {
    pocket_id: 0,
    concept_name: '',
    amount: 0,
    payment_day: 1
  };
  
  // UI state for collapsible pockets
  collapsedPockets: Set<string> = new Set();
  
  private destroy$ = new Subject<void>();

  constructor(
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router,
    private configurationService: ConfigurationService,
    private hybridTransactionsService: HybridTransactionsService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(environment.titleWebSite + ' - Configuración Financiera');
    
    // Listen to query parameter changes for month
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const monthParam = params['month'];
        if (monthParam && this.isValidMonth(monthParam)) {
          this.currentMonth = monthParam;
        } else {
          this.currentMonth = DateUtils.getCurrentMonth();
          this.updateUrlWithMonth(this.currentMonth);
        }
        this.loadConfiguration();
      });
  }

  /**
   * Abre el modal de transacciones híbridas
   */
  openHybridTransactionsModal(expense: FixedExpense): void {
    if (expense.expense_type !== 'hybrid') {
      this.notificationService.openSnackBar('Este gasto no es híbrido');
      return;
    }

    const dialogData: HybridTransactionsData = {
      expense: expense
    };

    const dialogRef = this.dialog.open(HybridTransactionsModalComponent, {
      width: '700px',
      maxHeight: '80vh',
      data: dialogData,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result: HybridTransactionsResult | undefined) => {
      if (result) {
        this.handleHybridTransactionResult(expense, result);
      }
    });
  }

  /**
   * Maneja el resultado del modal de transacciones híbridas
   */
  private handleHybridTransactionResult(expense: FixedExpense, result: HybridTransactionsResult): void {
    switch (result.action) {
      case 'add':
        if (result.transactionRequest) {
          this.addHybridTransaction(expense, result.transactionRequest);
        }
        break;
      case 'delete':
        if (result.transactionId) {
          this.deleteHybridTransaction(expense, result.transactionId);
        }
        break;
    }
  }

  /**
   * Agrega una nueva transacción híbrida
   */
  private addHybridTransaction(expense: FixedExpense, request: any): void {
    if (!expense.id) {
      console.error('No se puede crear transacción: expense.id es undefined');
      return;
    }
    
    this.hybridTransactionsService.createTransaction(expense.id, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newTransaction) => {
          // Actualizar el gasto con la nueva transacción
          if (expense.transactions) {
            expense.transactions.push(newTransaction);
          } else {
            expense.transactions = [newTransaction];
          }
          
          // Recalcular el gasto actual
          expense.current_spent = this.hybridTransactionsService.calculateTotalSpent(expense.transactions);
          
          this.notificationService.openSnackBar('Transacción agregada correctamente');
          
          // Recargar la configuración para obtener datos actualizados
          this.loadConfiguration();
        },
        error: (error) => {
          console.error('Error adding hybrid transaction:', error);
          this.notificationService.openSnackBar('Error agregando transacción');
        }
      });
  }

  /**
   * Elimina una transacción híbrida
   */
  private deleteHybridTransaction(expense: FixedExpense, transactionId: number): void {
    if (!expense.id) {
      console.error('No se puede eliminar transacción: expense.id es undefined');
      return;
    }
    
    this.hybridTransactionsService.deleteTransaction(expense.id, transactionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Remover la transacción de la lista local
          if (expense.transactions) {
            expense.transactions = expense.transactions.filter(t => t.id !== transactionId);
            
            // Recalcular el gasto actual
            expense.current_spent = this.hybridTransactionsService.calculateTotalSpent(expense.transactions);
          }
          
          this.notificationService.openSnackBar('Transacción eliminada correctamente');
          
          // Recargar la configuración para obtener datos actualizados
          this.loadConfiguration();
        },
        error: (error) => {
          console.error('Error deleting hybrid transaction:', error);
          this.notificationService.openSnackBar('Error eliminando transacción');
        }
      });
  }

  /**
   * Calcula el porcentaje de progreso para un gasto híbrido
   */
  getHybridProgressPercentage(expense: FixedExpense): number {
    if (!expense.budget_limit || expense.budget_limit === 0) return 0;
    const currentSpent = expense.current_spent || 0;
    return Math.min((currentSpent / expense.budget_limit) * 100, 100);
  }

  /**
   * Obtiene el color del progreso para un gasto híbrido
   */
  getHybridProgressColor(expense: FixedExpense): 'primary' | 'accent' | 'warn' {
    const percentage = this.getHybridProgressPercentage(expense);
    if (percentage >= 100) return 'warn';
    if (percentage >= 80) return 'accent';
    return 'primary';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load financial configuration for current month
   */
  loadConfiguration(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    
    this.configurationService.getFinancialConfiguration(this.currentMonth)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config) => {
          this.configuration = config;
          this.salaryForm.monthly_amount = config.salary.monthly_amount;
          this.dailyBudgetForm.monthly_budget = config.dailyExpensesConfig.monthly_budget;
          this.initializeCollapsedPockets();
          this.isLoading = false;
          
          // Detectar si es configuración heredada (gastos fijos sin ID)
          const hasInheritedData = config.fixedExpenses.some(expense => !expense.id);
          if (hasInheritedData) {
            this.notificationService.openSnackBar(
              `📋 Configuración heredada del mes anterior. Edita solo lo que necesites cambiar.`
            );
          }
        },
        error: (error) => {
          console.error('Error loading configuration:', error);
          this.hasError = true;
          this.isLoading = false;
          this.errorMessage = error.message || 'Error cargando configuración financiera';
          this.notificationService.openSnackBar(this.errorMessage);
        }
      });

    // Load available pockets
    this.configurationService.getAvailablePockets()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pockets) => {
          this.availablePockets = pockets;
        },
        error: (error) => {
          console.error('Error loading pockets:', error);
        }
      });
  }


  /**
   * Handle month change from MonthSelector
   */
  onMonthChanged(newMonth: string): void {
    // Cancelar cualquier edición en progreso
    this.cancelAllEditing();
    
    // Actualizar URL y cargar nueva configuración
    this.updateUrlWithMonth(newMonth);
  }

  /**
   * Cancel all editing modes
   */
  private cancelAllEditing(): void {
    this.isEditingSalary = false;
    this.isEditingDailyBudget = false;
    this.isAddingFixedExpense = false;
    this.editingFixedExpenseId = null;
  }

  // Salary Management
  startEditingSalary(): void {
    this.isEditingSalary = true;
    this.salaryForm.monthly_amount = this.configuration?.salary.monthly_amount || 0;
  }

  saveSalary(): void {
    if (this.salaryForm.monthly_amount <= 0) {
      this.notificationService.openSnackBar('El salario debe ser mayor a 0');
      return;
    }

    const request: UpdateSalaryRequest = {
      monthly_amount: this.salaryForm.monthly_amount
    };

    this.configurationService.updateSalary(this.currentMonth, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedSalary) => {
          if (this.configuration) {
            this.configuration.salary = updatedSalary;
          }
          this.isEditingSalary = false;
          this.notificationService.openSnackBar('Salario actualizado correctamente');
        },
        error: (error) => {
          console.error('Error updating salary:', error);
          this.notificationService.openSnackBar('Error actualizando salario');
        }
      });
  }

  cancelEditingSalary(): void {
    this.isEditingSalary = false;
    this.salaryForm.monthly_amount = this.configuration?.salary.monthly_amount || 0;
  }

  // Daily Budget Management
  startEditingDailyBudget(): void {
    this.isEditingDailyBudget = true;
    this.dailyBudgetForm.monthly_budget = this.configuration?.dailyExpensesConfig.monthly_budget || 0;
  }

  saveDailyBudget(): void {
    if (this.dailyBudgetForm.monthly_budget <= 0) {
      this.notificationService.openSnackBar('El presupuesto debe ser mayor a 0');
      return;
    }

    const request: UpdateDailyBudgetRequest = {
      monthly_budget: this.dailyBudgetForm.monthly_budget
    };

    this.configurationService.updateDailyBudget(this.currentMonth, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedConfig) => {
          if (this.configuration) {
            this.configuration.dailyExpensesConfig = updatedConfig;
          }
          this.isEditingDailyBudget = false;
          this.notificationService.openSnackBar('Presupuesto actualizado correctamente');
        },
        error: (error) => {
          console.error('Error updating daily budget:', error);
          this.notificationService.openSnackBar('Error actualizando presupuesto');
        }
      });
  }

  cancelEditingDailyBudget(): void {
    this.isEditingDailyBudget = false;
    this.dailyBudgetForm.monthly_budget = this.configuration?.dailyExpensesConfig.monthly_budget || 0;
  }

  // Fixed Expenses Management
  startAddingFixedExpense(): void {
    this.openExpenseFormModal();
  }

  saveFixedExpense(): void {
    if (!this.fixedExpenseForm.pocket_id || !this.fixedExpenseForm.concept_name || 
        this.fixedExpenseForm.amount <= 0 || this.fixedExpenseForm.payment_day < 1 || 
        this.fixedExpenseForm.payment_day > 31) {
      this.notificationService.openSnackBar('Por favor completa todos los campos correctamente');
      return;
    }

    if (this.editingFixedExpenseId) {
      this.updateFixedExpense();
    } else {
      this.createFixedExpense();
    }
  }

  private createFixedExpense(): void {
    this.configurationService.createFixedExpense(this.currentMonth, this.fixedExpenseForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newExpense) => {
          if (this.configuration) {
            this.configuration.fixedExpenses.push(newExpense);
            // Update pockets list
            this.configuration.pockets = this.extractPocketsFromExpenses(this.configuration.fixedExpenses);
          }
          this.cancelAddingFixedExpense();
          this.notificationService.openSnackBar('Gasto fijo agregado correctamente');
        },
        error: (error) => {
          console.error('Error creating fixed expense:', error);
          this.notificationService.openSnackBar('Error agregando gasto fijo');
        }
      });
  }

  private updateFixedExpense(): void {
    if (!this.editingFixedExpenseId || !this.configuration) return;

    const expenseToUpdate = this.configuration.fixedExpenses.find(e => e.id === this.editingFixedExpenseId);
    if (!expenseToUpdate) return;

    const updatedExpense: FixedExpense = {
      ...expenseToUpdate,
      pocket_id: this.fixedExpenseForm.pocket_id,
      concept_name: this.fixedExpenseForm.concept_name,
      amount: this.fixedExpenseForm.amount,
      payment_day: this.fixedExpenseForm.payment_day
    };

    this.configurationService.updateFixedExpense(updatedExpense)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          if (this.configuration) {
            const index = this.configuration.fixedExpenses.findIndex(e => e.id === this.editingFixedExpenseId);
            if (index !== -1) {
              this.configuration.fixedExpenses[index] = updated;
            }
          }
          this.cancelAddingFixedExpense();
          this.notificationService.openSnackBar('Gasto fijo actualizado correctamente');
        },
        error: (error) => {
          console.error('Error updating fixed expense:', error);
          this.notificationService.openSnackBar('Error actualizando gasto fijo');
        }
      });
  }

  editFixedExpense(expense: FixedExpense): void {
    this.openExpenseFormModal(expense);
  }

  deleteFixedExpense(expense: FixedExpense): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `¿Estás seguro de que quieres eliminar el gasto "${expense.concept_name}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.configurationService.deleteFixedExpense(expense.id!)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              if (this.configuration) {
                this.configuration.fixedExpenses = this.configuration.fixedExpenses.filter(e => e.id !== expense.id);
                // Update pockets list
                this.configuration.pockets = this.extractPocketsFromExpenses(this.configuration.fixedExpenses);
              }
              this.notificationService.openSnackBar('Gasto fijo eliminado correctamente');
            },
            error: (error) => {
              console.error('Error deleting fixed expense:', error);
              this.notificationService.openSnackBar('Error eliminando gasto fijo');
            }
          });
      }
    });
  }

  cancelAddingFixedExpense(): void {
    this.isAddingFixedExpense = false;
    this.editingFixedExpenseId = null;
    this.clearFixedExpenseForm();
  }

  private clearFixedExpenseForm(): void {
    this.fixedExpenseForm = {
      pocket_id: 0,
      concept_name: '',
      amount: 0,
      payment_day: 1
    };
  }

  // Utility methods
  getFixedExpensesByPocket(): { [key: string]: FixedExpense[] } {
    if (!this.configuration) return {};
    
    const groups = this.configuration.fixedExpenses.reduce((groups, expense) => {
      const pocket = expense.pocket_name || `Bolsillo ${expense.pocket_id}`;
      if (!groups[pocket]) {
        groups[pocket] = [];
      }
      groups[pocket].push(expense);
      return groups;
    }, {} as { [key: string]: FixedExpense[] });

    // Ordenar gastos dentro de cada bolsillo por monto (mayor a menor)
    Object.keys(groups).forEach(pocketName => {
      groups[pocketName].sort((a, b) => b.amount - a.amount);
    });

    return groups;
  }

  getPocketKeys(): string[] {
    return this.getPocketKeysOrderedByBudget();
  }

  /**
   * Obtiene las claves de bolsillos ordenadas por budget total (mayor a menor)
   */
  getPocketKeysOrderedByBudget(): string[] {
    const pocketTotals = this.getPocketTotals();
    return Object.keys(pocketTotals)
      .sort((a, b) => pocketTotals[b] - pocketTotals[a]);
  }

  /**
   * Calcula el total de cada bolsillo
   */
  getPocketTotals(): { [key: string]: number } {
    const expensesByPocket = this.getFixedExpensesByPocket();
    const totals: { [key: string]: number } = {};
    
    Object.keys(expensesByPocket).forEach(pocketName => {
      totals[pocketName] = expensesByPocket[pocketName]
        .reduce((sum, expense) => sum + expense.amount, 0);
    });
    
    return totals;
  }

  getTotalAmountForPocket(pocketName: string): number {
    const expenses = this.getFixedExpensesByPocket()[pocketName] || [];
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

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

  // Método getCurrentMonth() movido a DateUtils para evitar duplicación

  // Método para calcular resumen local (sin backend adicional)
  getLocalMonthlySummary(): any {
    if (!this.configuration) return null;

    const totalFixedExpenses = this.configuration.fixedExpenses
      .reduce((total, expense) => total + expense.amount, 0);

    const availableAfterFixed = this.configuration.salary.monthly_amount - totalFixedExpenses;
    const availableOverall = availableAfterFixed - this.configuration.dailyExpensesConfig.monthly_budget;

    return {
      salary: this.configuration.salary,
      totalFixedExpenses: totalFixedExpenses,
      dailyExpensesBudget: this.configuration.dailyExpensesConfig,
      availableOverall: availableOverall,
      fixedExpensesPercentage: this.configuration.salary.monthly_amount > 0 
        ? (totalFixedExpenses / this.configuration.salary.monthly_amount) * 100 
        : 0,
      dailyBudgetPercentage: this.configuration.salary.monthly_amount > 0 
        ? (this.configuration.dailyExpensesConfig.monthly_budget / this.configuration.salary.monthly_amount) * 100 
        : 0,
      overallBalanceStatus: availableOverall > 0 ? 'surplus' : (availableOverall < 0 ? 'deficit' : 'balanced')
    };
  }

  getMonthName(month: string): string {
    return DateUtils.getMonthName(month);
  }

  private isValidMonth(month: string): boolean {
    return DateUtils.isValidMonth(month);
  }

  private updateUrlWithMonth(month: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { month },
      queryParamsHandling: 'merge'
    });
  }

  // Modal Methods
  openExpenseFormModal(expense?: FixedExpense): void {
    const dialogData: ExpenseFormData = {
      expense: expense,
      availablePockets: this.availablePockets,
      isEditing: !!expense
    };

    const dialogRef = this.dialog.open(ExpenseFormModalComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: ExpenseFormResult) => {
      if (result) {
        if (expense) {
          // Update existing expense - detectar si es conversión
          const isConversion = expense.expense_type !== result.expense_type;
          const isDestructiveConversion = isConversion && 
                                        expense.expense_type === 'hybrid' && 
                                        result.expense_type === 'fixed' && 
                                        (expense.transactions?.length || 0) > 0;

          if (isDestructiveConversion) {
            // Mostrar confirmación para conversiones destructivas
            this.showConversionConfirmation(result, expense);
          } else {
            // Proceder con actualización normal
            this.performExpenseUpdate(result, expense);
          }
        } else {
          // Create new expense
          this.createFixedExpenseFromModal(result);
        }
      }
    });
  }

  openPocketFormModal(pocket?: Pocket): void {
    const dialogData: PocketFormData = {
      pocket: pocket,
      isEditing: !!pocket
    };

    const dialogRef = this.dialog.open(PocketFormModalComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: PocketFormResult) => {
      if (result) {
        if (pocket) {
          // Update existing pocket
          const updatedPocket: Pocket = {
            ...pocket,
            name: result.name,
            description: result.description
          };
          this.updatePocketFromModal(updatedPocket);
        } else {
          // Create new pocket
          this.createPocketFromModal(result.name, result.description);
        }
      }
    });
  }

  private createFixedExpenseFromModal(result: ExpenseFormResult): void {
    // Construir request según el tipo de gasto
    const request: CreateFixedExpenseRequest = this.buildCreateRequest(result);
    console.log('Iniciando creación de gasto fijo:', request, 'para el mes:', this.currentMonth);
    
    this.configurationService.createFixedExpense(this.currentMonth, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newExpense) => {
          console.log('Gasto fijo creado exitosamente en el componente:', newExpense);
          
          if (this.configuration) {
            this.configuration.fixedExpenses.push(newExpense);
            // Update pockets list
            this.configuration.pockets = this.extractPocketsFromExpenses(this.configuration.fixedExpenses);
            console.log('Configuración actualizada con nuevo gasto fijo');
          }
          
          const expenseType = newExpense.expense_type === 'hybrid' ? 'híbrido' : 'fijo';
          this.notificationService.openSnackBar(`Gasto ${expenseType} "${newExpense.concept_name}" agregado correctamente`);
        },
        error: (error) => {
          console.error('Error creating fixed expense en el componente:', error);
          
          // Mostrar mensaje de error más específico
          let errorMessage = 'Error agregando gasto fijo';
          if (error.status === 0) {
            errorMessage = 'Error de conexión con el servidor';
          } else if (error.status >= 400 && error.status < 500) {
            errorMessage = 'Error en los datos enviados';
          } else if (error.status >= 500) {
            errorMessage = 'Error interno del servidor';
          }
          
          this.notificationService.openSnackBar(errorMessage);
        }
      });
  }

  private updateFixedExpenseFromModal(updatedExpense: FixedExpense): void {
    this.configurationService.updateFixedExpense(updatedExpense)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          if (this.configuration) {
            const index = this.configuration.fixedExpenses.findIndex(e => e.id === updatedExpense.id);
            if (index !== -1) {
              this.configuration.fixedExpenses[index] = updated;
            }
          }
          this.notificationService.openSnackBar('Gasto fijo actualizado correctamente');
        },
        error: (error) => {
          console.error('Error updating fixed expense:', error);
          this.handleUpdateError(error);
        }
      });
  }

  /**
   * Construye el request para crear un nuevo gasto
   */
  private buildCreateRequest(result: ExpenseFormResult): CreateFixedExpenseRequest {
    const baseRequest = {
      pocket_id: result.pocket_id,
      concept_name: result.concept_name
    };

    if (result.expense_type === 'fixed') {
      return {
        ...baseRequest,
        amount: result.amount!,
        payment_day: result.payment_day!
      };
    } else {
      // Para gastos híbridos en creación, usar amount = 0 y payment_day = 0
      return {
        ...baseRequest,
        amount: 0,
        payment_day: 0
      };
    }
  }

  /**
   * Construye el request para actualizar un gasto existente
   */
  private buildUpdateRequest(result: ExpenseFormResult, originalExpense: FixedExpense): any {
    const baseRequest = {
      concept_name: result.concept_name,
      month: result.month,
      pocket_id: result.pocket_id,
      expense_type: result.expense_type
    };

    if (result.expense_type === 'fixed') {
      return {
        ...baseRequest,
        amount: result.amount,
        payment_day: result.payment_day
      };
    } else {
      return {
        ...baseRequest,
        budget_limit: result.budget_limit
      };
    }
  }

  /**
   * Procesa la actualización de un gasto (con o sin conversión)
   */
  private performExpenseUpdate(result: ExpenseFormResult, originalExpense: FixedExpense): void {
    const updateRequest = this.buildUpdateRequest(result, originalExpense);
    
    // Crear objeto FixedExpense para el servicio (mantener compatibilidad)
    const updatedExpense: FixedExpense = {
      ...originalExpense,
      ...updateRequest
    };

    this.updateFixedExpenseFromModal(updatedExpense);
  }

  /**
   * Muestra confirmación para conversiones destructivas
   */
  private showConversionConfirmation(result: ExpenseFormResult, originalExpense: FixedExpense): void {
    const transactionCount = originalExpense.transactions?.length || 0;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        message: `⚠️ Al convertir "${originalExpense.concept_name}" de gasto híbrido a fijo se eliminarán permanentemente ${transactionCount} transacciones. ¿Estás seguro?`,
        confirmText: 'Convertir y Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed === true) {
        this.performExpenseUpdate(result, originalExpense);
      }
    });
  }

  /**
   * Maneja errores específicos de actualización
   */
  private handleUpdateError(error: any): void {
    if (error.status === 400) {
      const details = error.error?.details || '';
      
      if (details.includes('cannot convert to hybrid')) {
        this.notificationService.openSnackBar('Error: No se puede convertir a híbrido. Verifica el presupuesto.');
      } else if (details.includes('cannot convert to fixed')) {
        this.notificationService.openSnackBar('Error: No se puede convertir a fijo. Verifica el día de pago.');
      } else if (details.includes('payment_day must be between 1 and 31')) {
        this.notificationService.openSnackBar('Error: El día de pago debe estar entre 1 y 31.');
      } else if (details.includes('invalid month format')) {
        this.notificationService.openSnackBar('Error: Formato de mes inválido. Debe ser YYYY-MM.');
      } else {
        this.notificationService.openSnackBar(`Error de validación: ${details}`);
      }
    } else if (error.status === 404) {
      this.notificationService.openSnackBar('Error: Gasto no encontrado.');
    } else {
      this.notificationService.openSnackBar('Error actualizando gasto fijo');
    }
  }

  private createPocketFromModal(name: string, description?: string): void {
    this.configurationService.createPocket(name, description)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newPocket) => {
          this.availablePockets.push(newPocket);
          this.notificationService.openSnackBar('Bolsillo creado correctamente');
        },
        error: (error) => {
          console.error('Error creating pocket:', error);
          this.notificationService.openSnackBar('Error creando bolsillo');
        }
      });
  }

  private updatePocketFromModal(updatedPocket: Pocket): void {
    this.configurationService.updatePocket(updatedPocket)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          const index = this.availablePockets.findIndex(p => p.id === updatedPocket.id);
          if (index !== -1) {
            this.availablePockets[index] = updated;
          }
          this.notificationService.openSnackBar('Bolsillo actualizado correctamente');
        },
        error: (error) => {
          console.error('Error updating pocket:', error);
          this.notificationService.openSnackBar('Error actualizando bolsillo');
        }
      });
  }

  editPocket(pocketName: string): void {
    const pocket = this.availablePockets.find(p => p.name === pocketName);
    if (pocket) {
      this.openPocketFormModal(pocket);
    }
  }

  deletePocket(pocketName: string): void {
    const pocket = this.availablePockets.find(p => p.name === pocketName);
    if (!pocket) return;

    // Check if pocket has expenses
    const hasExpenses = this.configuration?.fixedExpenses.some(e => 
      (e.pocket_name || `Bolsillo ${e.pocket_id}`) === pocketName
    );
    if (hasExpenses) {
      this.notificationService.openSnackBar('No puedes eliminar un bolsillo que tiene gastos asociados');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `¿Estás seguro de que quieres eliminar el bolsillo "${pocketName}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.configurationService.deletePocket(pocket.id!)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.availablePockets = this.availablePockets.filter(p => p.id !== pocket.id);
              this.notificationService.openSnackBar('Bolsillo eliminado correctamente');
            },
            error: (error) => {
              console.error('Error deleting pocket:', error);
              this.notificationService.openSnackBar('Error eliminando bolsillo');
            }
          });
      }
    });
  }

  // Collapsible Pockets Methods
  initializeCollapsedPockets(): void {
    if (this.configuration) {
      // Initialize all pockets as collapsed by default
      const pocketNames = this.getPocketKeys();
      pocketNames.forEach(pocketName => {
        this.collapsedPockets.add(pocketName);
      });
    }
  }

  togglePocketCollapse(pocketName: string): void {
    if (this.collapsedPockets.has(pocketName)) {
      this.collapsedPockets.delete(pocketName);
    } else {
      this.collapsedPockets.add(pocketName);
    }
  }

  isPocketCollapsed(pocketName: string): boolean {
    return this.collapsedPockets.has(pocketName);
  }

  getPocketExpenseCount(pocketName: string): number {
    return this.getFixedExpensesByPocket()[pocketName]?.length || 0;
  }
}