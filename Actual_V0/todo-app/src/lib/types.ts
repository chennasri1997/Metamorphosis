export interface Step {
  id: number;
  taskId: number;
  text: string;
  completed: boolean;
  order: number;
}

export const REPEAT_VALUES = ['never', 'daily', 'weekly', 'biweekly', 'monthly', 'yearly'] as const;
export type Repeat = (typeof REPEAT_VALUES)[number];

export const REPEAT_LABELS: Record<Repeat, string> = {
  never: 'Never',
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export interface Task {
  id: number;
  repeat: Repeat;
  title: string;
  deadline: string;
  completed: boolean;
  createdAt: string;
  steps: Step[];
}
