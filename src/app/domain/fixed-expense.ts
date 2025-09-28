export interface FixedExpense {
    id?: number;
    pocket_name: string;
    concept_name: string;
    amount: number;
    payment_day: number; // día del mes (1-31)
    is_paid: boolean;
    month: string; // "2024-01"
    paid_date?: string;
    created_at?: string;
}
