export interface FixedExpense {
    id?: number;
    pocket_id: number;
    pocket_name?: string; // Solo para mostrar en UI, viene del backend
    concept_name: string;
    amount: number;
    payment_day: number; // día del mes (1-31)
    is_paid: boolean;
    month: string; // "2024-01"
    paid_date?: string;
    created_at?: string;
    
    // Campos para gastos híbridos
    expense_type?: 'fixed' | 'hybrid'; // Tipo de gasto
    budget_limit?: number; // Límite de presupuesto para gastos híbridos
    current_spent?: number; // Cantidad gastada actualmente
    transactions?: HybridTransaction[]; // Transacciones asociadas
}

export interface HybridTransaction {
    id?: number;
    fixed_expense_id: number;
    amount: number;
    description?: string;
    transaction_date: string; // ISO date string
    created_at?: string;
}

// Interfaces para formularios y requests
export interface CreateHybridTransactionRequest {
    fixed_expense_id: number;
    amount: number;
    description?: string;
    transaction_date: string;
}

// Interface para el request al backend (sin fixed_expense_id)
export interface CreateHybridTransactionBackendRequest {
    amount: number;
    description?: string;
    transaction_date: string;
}

export interface UpdateHybridTransactionRequest {
    amount?: number;
    description?: string;
    transaction_date?: string;
}
