import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

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
import { ConfigurationService, FinancialConfiguration, CreateFixedExpenseRequest, UpdateSalaryRequest, UpdateDailyBudgetRequest } from '../services/configuration.service';
import { NotificationService } from '../../services/notification/notification.service';

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
  styleUrl: './financial-config.component.css'
})
export class FinancialConfigComponent implements OnInit, OnDestroy {
  
  // Current month
  currentMonth: string = this.getCurrentMonth();
  
  // Configuration data
  configuration: FinancialConfiguration | null = null;
  availablePockets: Pocket[] = [];
  
  // Loading states
  isLoading: boolean = true;
  hasError: boolean = false;
  
  // Edit modes
  isEditingSalary: boolean = false;
  isEditingDailyBudget: boolean = false;
  isAddingFixedExpense: boolean = false;
  editingFixedExpenseId: number | null = null;
  
  // Form data
  salaryForm = { monthly_amount: 0 };
  dailyBudgetForm = { monthly_budget: 0 };
  fixedExpenseForm: CreateFixedExpenseRequest = {
    pocket_name: '',
    concept_name: '',
    amount: 0,
    payment_day: 1
  };
  
  private destroy$ = new Subject<void>();

  constructor(
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router,
    private configurationService: ConfigurationService,
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
          this.currentMonth = this.getCurrentMonth();
          this.updateUrlWithMonth(this.currentMonth);
        }
        this.loadConfiguration();
      });
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
    
    this.configurationService.getFinancialConfiguration(this.currentMonth)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config) => {
          this.configuration = config;
          this.salaryForm.monthly_amount = config.salary.monthly_amount;
          this.dailyBudgetForm.monthly_budget = config.dailyExpensesConfig.monthly_budget;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading configuration:', error);
          this.hasError = true;
          this.isLoading = false;
          this.notificationService.openSnackBar('Error cargando configuración');
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
    this.updateUrlWithMonth(newMonth);
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
    if (!this.fixedExpenseForm.pocket_name || !this.fixedExpenseForm.concept_name || 
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
      pocket_name: this.fixedExpenseForm.pocket_name,
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
      pocket_name: '',
      concept_name: '',
      amount: 0,
      payment_day: 1
    };
  }

  // Utility methods
  getFixedExpensesByPocket(): { [key: string]: FixedExpense[] } {
    if (!this.configuration) return {};
    
    return this.configuration.fixedExpenses.reduce((groups, expense) => {
      const pocket = expense.pocket_name;
      if (!groups[pocket]) {
        groups[pocket] = [];
      }
      groups[pocket].push(expense);
      return groups;
    }, {} as { [key: string]: FixedExpense[] });
  }

  getPocketKeys(): string[] {
    return Object.keys(this.getFixedExpensesByPocket());
  }

  getTotalAmountForPocket(pocketName: string): number {
    const expenses = this.getFixedExpensesByPocket()[pocketName] || [];
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  private extractPocketsFromExpenses(expenses: FixedExpense[]): Pocket[] {
    const pocketNames = [...new Set(expenses.map(e => e.pocket_name))];
    return pocketNames.map((name, index) => ({
      id: index + 1,
      name: name,
      description: `Bolsillo para gastos de ${name.toLowerCase()}`
    }));
  }

  private getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  private isValidMonth(month: string): boolean {
    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(month)) return false;
    
    const [year, monthNum] = month.split('-').map(Number);
    return year >= 2020 && year <= 2030 && monthNum >= 1 && monthNum <= 12;
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
          // Update existing expense
          const updatedExpense: FixedExpense = {
            ...expense,
            pocket_name: result.pocket_name,
            concept_name: result.concept_name,
            amount: result.amount,
            payment_day: result.payment_day
          };
          this.updateFixedExpenseFromModal(updatedExpense);
        } else {
          // Create new expense
          const newExpenseRequest: CreateFixedExpenseRequest = {
            pocket_name: result.pocket_name,
            concept_name: result.concept_name,
            amount: result.amount,
            payment_day: result.payment_day
          };
          this.createFixedExpenseFromModal(newExpenseRequest);
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

  private createFixedExpenseFromModal(request: CreateFixedExpenseRequest): void {
    this.configurationService.createFixedExpense(this.currentMonth, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newExpense) => {
          if (this.configuration) {
            this.configuration.fixedExpenses.push(newExpense);
            // Update pockets list
            this.configuration.pockets = this.extractPocketsFromExpenses(this.configuration.fixedExpenses);
          }
          this.notificationService.openSnackBar('Gasto fijo agregado correctamente');
        },
        error: (error) => {
          console.error('Error creating fixed expense:', error);
          this.notificationService.openSnackBar('Error agregando gasto fijo');
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
          this.notificationService.openSnackBar('Error actualizando gasto fijo');
        }
      });
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
    const hasExpenses = this.configuration?.fixedExpenses.some(e => e.pocket_name === pocketName);
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
}