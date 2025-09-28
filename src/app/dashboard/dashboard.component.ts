import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

// Components
import { MonthlySummaryComponent } from './components/monthly-summary/monthly-summary.component';
import { FixedExpensesComponent } from './components/fixed-expenses/fixed-expenses.component';
import { DailyExpensesComponent } from './components/daily-expenses/daily-expenses.component';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MonthlySummaryComponent,
    FixedExpensesComponent,
    DailyExpensesComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  
  // Current month for all components
  currentMonth: string = '2024-01';

  constructor(private titleService: Title) {}

  ngOnInit(): void {
    this.titleService.setTitle(environment.titleWebSite + ' - Dashboard Financiero');
  }

  /**
   * Handle events from child components to refresh summary when needed
   */
  onFixedExpenseStatusChanged(): void {
    // The monthly summary component will automatically refresh
    // when fixed expenses change since it uses its own service
    console.log('Fixed expense status changed - summary will auto-refresh');
  }

  onDailyExpenseAdded(): void {
    // The monthly summary component will automatically refresh
    // when daily expenses change since it uses its own service
    console.log('Daily expense added - summary will auto-refresh');
  }

  onDailyExpenseUpdated(): void {
    console.log('Daily expense updated - summary will auto-refresh');
  }

  onDailyExpenseDeleted(): void {
    console.log('Daily expense deleted - summary will auto-refresh');
  }
}