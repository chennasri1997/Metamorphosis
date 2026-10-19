export interface Step {
  id: number;
  taskId: number;
  text: string;
  completed: boolean;
  order: number;
}

export interface Task {
  id: number;
  title: string;
  deadline: string;
  completed: boolean;
  createdAt: string;
  steps: Step[];
}
