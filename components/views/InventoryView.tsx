import React, { useState, FormEvent, useMemo, useEffect } from 'react';
import { useLawnCare } from '../../context/LawnCareContext';
import Card from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InventoryItem, Expense } from '../../types';
import { PlusIcon, XMarkIcon, ShoppingBagIcon, UserGroupIcon, WrenchScrewdriverIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

const Modal: React.FC<{ children: React.ReactNode, onClose: () => void, title: string }> = ({ children, onClose, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-full overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                    <XMarkIcon className="h-6 w-6 text-gray-600" />
                </button>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    </div>
);


const InventoryItemCard: React.FC<{ item: InventoryItem; onEdit: () => void; onDelete: () => void }> = ({ item, onEdit, onDelete }) => {
    const getMaxValue = (unit: string) => {
        switch(unit) {
            case 'kg': return 10;
            case 'g': return 1000;
            case 'L': return 5;
            case 'ml': return 1000;
            case '個': return 20;
            default: return 10;
        }
    }
    const maxValue = getMaxValue(item.unit);
    const stockPercentage = (item.stockQty / maxValue) * 100;

    return (
        <div className="p-4 bg-gray-50 rounded-lg group">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-gray-600 font-medium">{item.stockQty}{item.unit}</p>
                </div>
                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-200"><PencilIcon className="h-5 w-5" /></button>
                    <button onClick={onDelete} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-200"><TrashIcon className="h-5 w-5" /></button>
                </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${stockPercentage > 100 ? 100 : stockPercentage}%` }}
                ></div>
            </div>
        </div>
    );
}

const ExpenseIcon: React.FC<{type: Expense['type']}> = ({ type }) => {
    const commonClass = "h-6 w-6 text-white";
    switch(type) {
        case 'inventory':
            return <div className="p-2 bg-blue-500 rounded-full"><ShoppingBagIcon className={commonClass} /></div>;
        case 'labor':
            return <div className="p-2 bg-purple-500 rounded-full"><UserGroupIcon className={commonClass} /></div>;
        case 'other':
            return <div className="p-2 bg-gray-500 rounded-full"><WrenchScrewdriverIcon className={commonClass} /></div>;
    }
}

const InventoryView: React.FC = () => {
    const { inventory, expenses, addInventoryItem, addExpense, wages, updateInventoryItem, deleteInventoryItem, updateExpense, deleteExpense } = useLawnCare();
    const [showInventoryForm, setShowInventoryForm] = useState(false);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    
    // Form state
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [unit, setUnit] = useState<'kg' | 'g' | 'L' | 'ml' | '個'>('kg');
    const [totalCost, setTotalCost] = useState(0);
    const [expenseType, setExpenseType] = useState<'labor' | 'other'>('labor');
    const [laborPerson, setLaborPerson] = useState<'father' | 'mother' | 'child'>('father');
    const [laborMinutes, setLaborMinutes] = useState(0);
    const [otherDescription, setOtherDescription] = useState('');
    const [otherAmount, setOtherAmount] = useState(0);
    
    // Editing State
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [editExpenseDesc, setEditExpenseDesc] = useState('');
    const [editExpenseAmount, setEditExpenseAmount] = useState(0);

    useEffect(() => {
        if(editingItem) {
            setItemName(editingItem.name);
            setQuantity(editingItem.stockQty);
            setUnit(editingItem.unit);
            setTotalCost(editingItem.costPerUnit * editingItem.stockQty);
        }
    }, [editingItem]);

    useEffect(() => {
        if(editingExpense) {
            setEditExpenseDesc(editingExpense.description);
            setEditExpenseAmount(editingExpense.amount);
        }
    }, [editingExpense]);
    
    const calculatedLaborCost = useMemo(() => {
        if (expenseType !== 'labor' || laborMinutes <= 0) return 0;
        const hourlyWage = wages[laborPerson];
        return Math.round((hourlyWage / 60) * laborMinutes);
    }, [wages, laborPerson, laborMinutes, expenseType]);

    const resetInventoryForm = () => {
        setItemName('');
        setQuantity(1);
        setUnit('kg');
        setTotalCost(0);
        setEditingItem(null);
    }
    
    const handleInventorySubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!itemName || quantity <= 0 || totalCost <= 0) {
            alert('すべての項目を正しく入力してください。');
            return;
        }
        
        const itemData = {
            name: itemName,
            stockQty: quantity,
            unit,
            costPerUnit: totalCost / quantity,
            category: 'Other' as const, // Simplified
        };

        if (editingItem) {
            updateInventoryItem({ ...editingItem, ...itemData });
        } else {
            addInventoryItem(itemData);
        }

        setShowInventoryForm(false);
        resetInventoryForm();
    }
    
    const handleDeleteItem = (itemId: string) => {
        if (window.confirm('この在庫アイテムを削除しますか？購入時の費用も削除されます。')) {
            deleteInventoryItem(itemId);
        }
    };

    const handleExpenseSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (expenseType === 'labor') {
            if (calculatedLaborCost <= 0) {
                alert('作業時間を入力してください。');
                return;
            }
            const personJapanese = {father: '父', mother: '母', child: '子'};
            addExpense({
                type: 'labor',
                description: `人件費: ${personJapanese[laborPerson]} (${laborMinutes}分)`,
                amount: calculatedLaborCost,
            });
        } else {
            if (!otherDescription || otherAmount <= 0) {
                alert('内容と金額を正しく入力してください。');
                return;
            }
            addExpense({
                type: 'other',
                description: otherDescription,
                amount: otherAmount,
            });
        }
        setShowExpenseForm(false);
        setLaborMinutes(0);
        setOtherDescription('');
        setOtherAmount(0);
    };
    
    const handleUpdateExpenseSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingExpense || !editExpenseDesc || editExpenseAmount <= 0) {
             alert('内容と金額を正しく入力してください。');
            return;
        }
        updateExpense({
            ...editingExpense,
            description: editExpenseDesc,
            amount: editExpenseAmount
        });
        setEditingExpense(null);
    };
    
    const handleDeleteExpense = (expenseId: string) => {
        const expenseToDelete = expenses.find(e => e.id === expenseId);
        if (expenseToDelete?.type === 'inventory') {
            alert('在庫購入による費用は、在庫リストからアイテムを削除してください。');
            return;
        }
        if (window.confirm('この費用項目を削除しますか？')) {
            deleteExpense(expenseId);
        }
    };

    const monthlyExpenses = expenses.reduce((acc, expense) => {
        const month = expense.date.toLocaleString('ja-JP', { month: 'short' });
        if (!acc[month]) {
            acc[month] = 0;
        }
        acc[month] += expense.amount;
        return acc;
    }, {} as {[key: string]: number});
    
    const chartData = Object.keys(monthlyExpenses).map(month => ({
        name: month,
        コスト: monthlyExpenses[month],
    })).reverse();

    const totalCostAll = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
       {editingItem && (
            <Modal onClose={() => { setEditingItem(null); resetInventoryForm(); }} title="在庫アイテムを編集">
                <form onSubmit={handleInventorySubmit} className="space-y-4">
                     <div>
                        <label htmlFor="itemNameEdit" className="block text-sm font-medium text-gray-700">アイテム名</label>
                        <input type="text" id="itemNameEdit" value={itemName} onChange={e => setItemName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="quantityEdit" className="block text-sm font-medium text-gray-700">数量</label>
                            <input type="number" id="quantityEdit" value={quantity} onChange={e => setQuantity(parseFloat(e.target.value) || 0)} min="0.1" step="any" className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm" required />
                        </div>
                         <div>
                            <label htmlFor="unitEdit" className="block text-sm font-medium text-gray-700">単位</label>
                            <select id="unitEdit" value={unit} onChange={e => setUnit(e.target.value as any)} className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm">
                                <option value="kg">kg</option><option value="g">g</option><option value="L">L</option><option value="ml">ml</option><option value="個">個</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="totalCostEdit" className="block text-sm font-medium text-gray-700">合計金額 (円)</label>
                        <input type="number" id="totalCostEdit" value={totalCost} onChange={e => setTotalCost(parseInt(e.target.value, 10) || 0)} min="1" className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm" required />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => { setEditingItem(null); resetInventoryForm(); }} className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300">キャンセル</button>
                        <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">保存</button>
                    </div>
                </form>
            </Modal>
       )}
       {editingExpense && (
            <Modal onClose={() => setEditingExpense(null)} title="費用を編集">
                <form onSubmit={handleUpdateExpenseSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="expenseDescEdit" className="block text-sm font-medium text-gray-700">内容</label>
                        <input type="text" id="expenseDescEdit" value={editExpenseDesc} onChange={e => setEditExpenseDesc(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm" required />
                    </div>
                    <div>
                        <label htmlFor="expenseAmountEdit" className="block text-sm font-medium text-gray-700">金額 (円)</label>
                        <input type="number" id="expenseAmountEdit" value={editExpenseAmount} onChange={e => setEditExpenseAmount(parseInt(e.target.value, 10) || 0)} min="1" className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm" required />
                    </div>
                     <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setEditingExpense(null)} className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300">キャンセル</button>
                        <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">保存</button>
                    </div>
                </form>
            </Modal>
       )}
      <div>
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-700">在庫状況</h2>
            <button
                onClick={() => setShowInventoryForm(!showInventoryForm)}
                className="flex items-center justify-center gap-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
            >
                {showInventoryForm ? <XMarkIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
                <span>{showInventoryForm ? '閉じる' : '在庫を追加'}</span>
            </button>
        </div>
        {showInventoryForm && (
            <Card className="mb-4">
                <form onSubmit={handleInventorySubmit} className="space-y-4">
                    <h3 className="font-semibold text-lg">新しい在庫アイテム</h3>
                    <div>
                        <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">アイテム名</label>
                        <input type="text" id="itemName" value={itemName} onChange={e => setItemName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">数量</label>
                            <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(parseFloat(e.target.value) || 0)} min="0.1" step="any" className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm" required />
                        </div>
                         <div>
                            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">単位</label>
                            <select id="unit" value={unit} onChange={e => setUnit(e.target.value as any)} className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm">
                                <option value="kg">kg</option><option value="g">g</option><option value="L">L</option><option value="ml">ml</option><option value="個">個</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="totalCost" className="block text-sm font-medium text-gray-700">合計金額 (円)</label>
                        <input type="number" id="totalCost" value={totalCost} onChange={e => setTotalCost(parseInt(e.target.value, 10) || 0)} min="1" className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm" required />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">保存</button>
                    </div>
                </form>
            </Card>
        )}
        <Card className="p-0">
          <div className="space-y-4 p-6">
            {inventory.map(item => <InventoryItemCard key={item.id} item={item} onEdit={() => setEditingItem(item)} onDelete={() => handleDeleteItem(item.id)} />)}
          </div>
        </Card>
      </div>
      <div>
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-700">コスト追跡</h2>
             <button
                onClick={() => setShowExpenseForm(!showExpenseForm)}
                className="flex items-center justify-center gap-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
            >
                {showExpenseForm ? <XMarkIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
                <span>{showExpenseForm ? '閉じる' : '費用を追加'}</span>
            </button>
        </div>
        {showExpenseForm && (
            <Card className="mb-4">
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                    <h3 className="font-semibold text-lg">新しい費用</h3>
                    <div>
                        <label htmlFor="expenseType" className="block text-sm font-medium text-gray-700">費用の種類</label>
                        <select id="expenseType" value={expenseType} onChange={e => setExpenseType(e.target.value as any)} className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm">
                            <option value="labor">人件費</option>
                            <option value="other">その他</option>
                        </select>
                    </div>

                    {expenseType === 'labor' && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="laborPerson" className="block text-sm font-medium text-gray-700">作業者</label>
                                    <select id="laborPerson" value={laborPerson} onChange={e => setLaborPerson(e.target.value as any)} className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm">
                                        <option value="father">父</option>
                                        <option value="mother">母</option>
                                        <option value="child">子</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="laborMinutes" className="block text-sm font-medium text-gray-700">作業時間 (分)</label>
                                    <input type="number" id="laborMinutes" value={laborMinutes} onChange={e => setLaborMinutes(parseInt(e.target.value, 10) || 0)} min="1" className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm" required />
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">計算された費用:</p>
                                <p className="text-xl font-semibold text-green-700">¥{calculatedLaborCost.toLocaleString()}</p>
                            </div>
                        </div>
                    )}

                    {expenseType === 'other' && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                            <div>
                                <label htmlFor="otherDescription" className="block text-sm font-medium text-gray-700">内容</label>
                                <input type="text" id="otherDescription" value={otherDescription} onChange={e => setOtherDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm" required />
                            </div>
                            <div>
                                <label htmlFor="otherAmount" className="block text-sm font-medium text-gray-700">金額 (円)</label>
                                <input type="number" id="otherAmount" value={otherAmount} onChange={e => setOtherAmount(parseInt(e.target.value, 10) || 0)} min="1" className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm" required />
                            </div>
                        </div>
                    )}
                    
                    <div className="flex justify-end">
                        <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">費用を保存</button>
                    </div>
                </form>
            </Card>
        )}
        <Card>
            <div className="mb-4">
                <p className="text-gray-600">年間総コスト</p>
                <p className="text-3xl font-bold text-green-700">¥{totalCostAll.toLocaleString()}</p>
            </div>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#4B5563', fontSize: 12}} />
                <YAxis tick={{fill: '#4B5563', fontSize: 12}} />
                <Tooltip
                    cursor={{fill: 'rgba(16, 185, 129, 0.1)'}}
                    contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                    }}
                />
                <Bar dataKey="コスト" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
           <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">最近の費用</h3>
              <ul className="space-y-3">
                  {expenses.slice(0, 5).map((expense) => (
                      <li key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                          <div className="flex items-center gap-4">
                              <ExpenseIcon type={expense.type} />
                              <div>
                                  <p className="font-medium text-gray-800">{expense.description}</p>
                                  <p className="text-sm text-gray-500">{expense.date.toLocaleDateString('ja-JP')}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">¥{expense.amount.toLocaleString()}</p>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingExpense(expense)} className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-200"><PencilIcon className="h-5 w-5" /></button>
                                <button onClick={() => handleDeleteExpense(expense.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-200"><TrashIcon className="h-5 w-5" /></button>
                            </div>
                          </div>
                      </li>
                  ))}
              </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InventoryView;