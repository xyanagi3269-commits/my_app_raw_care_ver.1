import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { LawnProfile, Fertilizer, InventoryItem, Task, TaskType, Expense, MediaLog, Wages } from '../types';

// Helper to get Japanese task type name
const getTaskTypeName = (type: TaskType): string => {
    switch(type) {
        case TaskType.Mowing: return '芝刈り';
        case TaskType.Watering: return '水やり';
        case TaskType.Fertilizing: return '施肥';
        case TaskType.Aeration: return 'エアレーション';
        case TaskType.Topdressing: return '目土';
        default: return type;
    }
};

interface LawnCareContextType {
  profile: LawnProfile;
  fertilizers: Fertilizer[];
  inventory: InventoryItem[];
  tasks: Task[];
  expenses: Expense[];
  mediaLogs: MediaLog[];
  wages: Wages;
  updateProfile: (newProfile: Partial<LawnProfile>) => void;
  updateFertilizer: (fertilizer: Fertilizer) => void;
  getTaskDetails: (task: Task) => { amount: string; description: string };
  toggleTaskCompletion: (taskId: string) => void;
  addMediaLog: (log: Omit<MediaLog, 'id' | 'date' | 'liked'>) => void;
  updateMediaLog: (log: MediaLog) => void;
  deleteMediaLog: (logId: string) => void;
  toggleMediaLogLike: (logId: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'expenseId'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (itemId: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => string;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  updateWages: (newWages: Wages) => void;
}

const LawnCareContext = createContext<LawnCareContextType | undefined>(undefined);

const DEFAULT_PROFILE: LawnProfile = {
  area: 50,
  grassType: 'Bermuda',
  targetHeight: 25,
  mowerType: 'Rotary',
  irrigationRate: 15,
};

const DEFAULT_FERTILIZER: Fertilizer = {
  id: 'fert1',
  name: '標準的な芝生用肥料',
  nitrogenPercentage: 10,
};

const DEFAULT_WAGES: Wages = {
    father: 1500,
    mother: 1200,
    child: 500,
};

const MOCK_INVENTORY: InventoryItem[] = [
    { id: 'inv1', name: '標準的な芝生用肥料', category: 'Fertilizer', stockQty: 5, unit: 'kg', costPerUnit: 400, expenseId: 'exp3' },
    { id: 'inv2', name: '芝生の種ミックス', category: 'Seed', stockQty: 1, unit: 'kg', costPerUnit: 1500, expenseId: 'exp2' },
];

const MOCK_EXPENSES: Expense[] = [
    { id: 'exp1', date: new Date(2023, 6, 1), amount: 5000, description: '芝刈り機の刃の研磨', type: 'other' },
    { id: 'exp2', date: new Date(2023, 5, 20), amount: 1500, description: '芝生の種ミックス', type: 'inventory' },
    { id: 'exp3', date: new Date(2023, 4, 15), amount: 2000, description: '標準的な芝生用肥料', type: 'inventory' },
];

const MOCK_MEDIA_LOGS: MediaLog[] = [
    {
        id: 'pl1',
        date: new Date(new Date().setDate(new Date().getDate() - 5)),
        mediaUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCAyMCI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMmFmMDJjIj48L3JlY3Q+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjZweCIgZmlsbD0id2hpdGUiPkhlYWx0aHk8L3RleHQ+PC9zdmc+',
        mediaType: 'image',
        note: '施肥後、芝生は青々として健康的に見えます。',
        tags: ['健康', '成長記録'],
        liked: false,
    },
    {
        id: 'pl2',
        date: new Date(new Date().setDate(new Date().getDate() - 1)),
        mediaUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCAyMCI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjYjM5ZTdhIj48L3JlY3Q+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjZweCIgZmlsbD0id2hpdGUiPkRyeSBTcG90PC90ZXh0Pjwvc3ZnPg==',
        mediaType: 'image',
        note: 'オークの木の近くに乾燥した茶色の斑点を見つけました。このあたりはもっと水が必要かもしれません。',
        tags: ['問題', '乾燥', '水やり'],
        liked: false,
    }
];


export const LawnCareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<LawnProfile>(DEFAULT_PROFILE);
  const [fertilizers, setFertilizers] = useState<Fertilizer[]>([DEFAULT_FERTILIZER]);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [mediaLogs, setMediaLogs] = useState<MediaLog[]>(MOCK_MEDIA_LOGS);
  const [wages, setWages] = useState<Wages>(DEFAULT_WAGES);

  const updateProfile = (newProfile: Partial<LawnProfile>) => {
    setProfile(prev => ({ ...prev, ...newProfile }));
  };

  const updateFertilizer = (fertilizer: Fertilizer) => {
    setFertilizers(prev => prev.map(f => f.id === fertilizer.id ? fertilizer : f));
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'date'>): string => {
    const newExpense: Expense = {
        id: `exp${Date.now()}`,
        date: new Date(),
        ...expenseData,
    };
    setExpenses(prev => [newExpense, ...prev].sort((a,b) => b.date.getTime() - a.date.getTime()));
    return newExpense.id;
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp).sort((a,b) => b.date.getTime() - a.date.getTime()));
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
  }
  
  const toggleTaskCompletion = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const isCompleting = !task.completed;

    setTasks(prevTasks => prevTasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));

    if (isCompleting) {
        // Add labor cost expense, assuming father does the task
        const laborCost = Math.round((task.duration / 60) * wages.father);
        if (laborCost > 0) {
            addExpense({
                amount: laborCost,
                description: `人件費: ${getTaskTypeName(task.type)} (${task.duration}分)`,
                type: 'labor',
            });
        }
    } 
    // Note: un-completing a task does not remove the expense for simplicity.
  };
  
  const addMediaLog = (log: Omit<MediaLog, 'id' | 'date' | 'liked'>) => {
    const newLog: MediaLog = {
        id: `ml${Date.now()}`,
        date: new Date(),
        liked: false,
        ...log
    };
    setMediaLogs(prev => [newLog, ...prev]);
  };

  const updateMediaLog = (updatedLog: MediaLog) => {
    setMediaLogs(prev => prev.map(log => log.id === updatedLog.id ? updatedLog : log));
  };

  const deleteMediaLog = (logId: string) => {
    setMediaLogs(prev => prev.filter(log => log.id !== logId));
  };

  const toggleMediaLogLike = (logId: string) => {
    setMediaLogs(prev => prev.map(log => 
      log.id === logId ? { ...log, liked: !log.liked } : log
    ));
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'expenseId'>) => {
    const totalCost = item.costPerUnit * item.stockQty;
    const expenseId = addExpense({
        amount: totalCost,
        description: item.name,
        type: 'inventory',
    });
    
    const newItem = { ...item, id: `inv${Date.now()}`, expenseId };
    setInventory(prev => [newItem, ...prev]);
  };
  
  const updateInventoryItem = (updatedItem: InventoryItem) => {
    setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    // Also update associated expense
    if (updatedItem.expenseId) {
        const newTotalCost = updatedItem.costPerUnit * updatedItem.stockQty;
        const associatedExpense = expenses.find(exp => exp.id === updatedItem.expenseId);
        if (associatedExpense && (associatedExpense.amount !== newTotalCost || associatedExpense.description !== updatedItem.name)) {
            updateExpense({
                ...associatedExpense,
                amount: newTotalCost,
                description: updatedItem.name,
            });
        }
    }
  };

  const deleteInventoryItem = (itemId: string) => {
    const itemToDelete = inventory.find(item => item.id === itemId);
    if (itemToDelete && itemToDelete.expenseId) {
        deleteExpense(itemToDelete.expenseId);
    }
    setInventory(prev => prev.filter(item => item.id !== itemId));
  };


  const updateWages = (newWages: Wages) => {
    setWages(newWages);
  };

  const getTaskDetails = useCallback((task: Task): { amount: string; description: string } => {
    switch (task.type) {
      case TaskType.Mowing:
        return {
          amount: `${profile.targetHeight}mm`,
          description: `目標の刈り高`,
        };
      case TaskType.Watering:
        // Logic: 10mm of water is 10L per m². Time = Total Liters / L per min
        const requiredWaterL = 10 * profile.area;
        const wateringTimeMin = Math.round(requiredWaterL / profile.irrigationRate);
        return {
          amount: `${wateringTimeMin}分`,
          description: `約${requiredWaterL}Lの水`,
        };
      case TaskType.Fertilizing:
        // Logic: Recommended 2g of Nitrogen per m². Amount = (Area * N Rec) / N%
        const activeFertilizer = fertilizers[0];
        if (!activeFertilizer) return { amount: 'N/A', description: '肥料が設定されていません' };
        const recommendedNitrogenG = 2 * profile.area;
        const fertilizerAmountG = Math.round((recommendedNitrogenG / (activeFertilizer.nitrogenPercentage / 100)));
        return {
          amount: `${fertilizerAmountG}g`,
          description: `${activeFertilizer.name}を使用`,
        };
      default:
        return { amount: '', description: '' };
    }
  }, [profile, fertilizers]);


  useEffect(() => {
    // Generate mock tasks based on profile
    const now = new Date();
    const generatedTasks: Task[] = [
      { id: '1', type: TaskType.Mowing, date: now, duration: 30, completed: false },
      { id: '2', type: TaskType.Watering, date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), duration: 15, completed: false },
      { id: '3', type: TaskType.Fertilizing, date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), duration: 10, completed: false },
    ];
    setTasks(generatedTasks);
  }, [profile]); // Rerun when profile changes

  const value = {
    profile,
    fertilizers,
    inventory,
    tasks,
    expenses,
    mediaLogs,
    wages,
    updateProfile,
    updateFertilizer,
    getTaskDetails,
    toggleTaskCompletion,
    addMediaLog,
    updateMediaLog,
    deleteMediaLog,
    toggleMediaLogLike,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addExpense,
    updateExpense,
    deleteExpense,
    updateWages,
  };

  return <LawnCareContext.Provider value={value}>{children}</LawnCareContext.Provider>;
};

export const useLawnCare = (): LawnCareContextType => {
  const context = useContext(LawnCareContext);
  if (context === undefined) {
    throw new Error('useLawnCare must be used within a LawnCareProvider');
  }
  return context;
};