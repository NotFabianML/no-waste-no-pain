export type BudgetMode = 'amount' | 'percent';

export interface BudgetCategory {
  name: string;
  mode: BudgetMode;
  value: number;
}

export const defaultCategories: BudgetCategory[] = [
  { name: 'University', mode: 'amount', value: 420 },
  { name: 'Home & essentials', mode: 'amount', value: 180 },
  { name: 'Fun money', mode: 'percent', value: 8 },
  { name: 'Subscriptions', mode: 'amount', value: 34 },
];

export const initialPlans = ['Paycheck 15th', 'Paycheck 30th'];
