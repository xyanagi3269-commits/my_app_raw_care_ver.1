export enum TaskType {
  Mowing = 'Mowing',
  Watering = 'Watering',
  Fertilizing = 'Fertilizing',
  Aeration = 'Aeration',
  Topdressing = 'Topdressing',
}

export interface LawnProfile {
  area: number; // in square meters
  grassType: 'Bermuda' | 'Zoysia' | 'StAugustine' | 'Fescue';
  targetHeight: number; // in mm
  mowerType: 'Rotary' | 'Reel';
  irrigationRate: number; // in L/min
}

export interface Fertilizer {
  id: string;
  name: string;
  nitrogenPercentage: number; // N%
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Fertilizer' | 'Seed' | 'Pesticide' | 'Other';
  stockQty: number;
  unit: 'kg' | 'g' | 'L' | 'ml' | '個';
  costPerUnit: number;
  expenseId?: string; // Link to the expense generated on purchase
}

export interface Task {
  id: string;
  type: TaskType;
  date: Date;
  duration: number; // in minutes
  recommendedAmount?: number;
  recommendedUnit?: 'g' | 'L' | 'min';
  completed: boolean;
}

export interface Expense {
  id: string;
  date: Date;
  amount: number;
  description: string;
  type: 'inventory' | 'labor' | 'other';
}

export interface MediaLog {
  id: string;
  date: Date;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  note: string;
  tags: string[];
  liked: boolean;
}

export interface Wages {
    father: number;
    mother: number;
    child: number;
}