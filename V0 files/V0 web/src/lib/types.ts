export type Tag = 'Mental' | 'Physical' | 'General';
export type RepeatRule = 'Daily' | 'Never';

export interface Task {
  id: string;
  name: string;
  tag: Tag;
  points: number;
  repeat: RepeatRule;
  activeAt: number;
}
