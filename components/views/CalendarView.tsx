
import React, { useState } from 'react';
import { useLawnCare } from '../../context/LawnCareContext';
import Card from '../ui/Card';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { TaskType } from '../../types';

const CalendarView: React.FC = () => {
  const { tasks } = useLawnCare();
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const days = Array.from({ length: startDay }, (_, i) => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const changeMonth = (amount: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
  };
  
  const getTasksForDay = (day: number | null) => {
    if (!day) return [];
    return tasks.filter(task => {
        const taskDate = task.date;
        return taskDate.getFullYear() === currentDate.getFullYear() &&
               taskDate.getMonth() === currentDate.getMonth() &&
               taskDate.getDate() === day;
    });
  };

  const TaskDot: React.FC<{type: TaskType}> = ({ type }) => {
    let color = '';
    switch(type) {
        case TaskType.Mowing: color = 'bg-blue-500'; break;
        case TaskType.Watering: color = 'bg-cyan-500'; break;
        case TaskType.Fertilizing: color = 'bg-amber-500'; break;
        default: color = 'bg-gray-400';
    }
    return <div className={`w-2 h-2 rounded-full ${color}`}></div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <h2 className="text-lg font-bold text-gray-800">
            {currentDate.toLocaleString('ja-JP', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronRightIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map(day => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
                const isToday = day && new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                const dayTasks = getTasksForDay(day);

                return (
                    <div key={index} className="flex flex-col items-center justify-start h-16 p-1 border border-gray-100 rounded-md">
                        <span className={`flex items-center justify-center w-7 h-7 rounded-full ${isToday ? 'bg-green-600 text-white' : 'text-gray-700'}`}>
                            {day}
                        </span>
                        <div className="flex space-x-1 mt-1">
                            {dayTasks.map(task => <TaskDot key={task.id} type={task.type} />)}
                        </div>
                    </div>
                );
            })}
        </div>
      </Card>
      <p className="text-center text-gray-500 text-sm">これは簡易的なカレンダー表示です。完全な機能は近日公開予定です。</p>
    </div>
  );
};

export default CalendarView;
