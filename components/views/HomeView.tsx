
import React from 'react';
import { useLawnCare } from '../../context/LawnCareContext';
import Card from '../ui/Card';
import { SunIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon as CheckCircleIconOutline } from '@heroicons/react/24/outline';
import { Task, TaskType } from '../../types';

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

const TaskIcon: React.FC<{ type: TaskType }> = ({ type }) => {
    const iconStyles = "h-8 w-8 text-white";
    const bgStyles = "rounded-full p-2 mr-4";

    switch(type) {
        case TaskType.Mowing: return <div className={`bg-blue-500 ${bgStyles}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconStyles}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m-3-1-3-1m3 1v5.25c0 .621-.504 1.125-1.125 1.125h-2.25c-.621 0-1.125-.504-1.125-1.125V12m-3 1-3-1" /></svg>
        </div>;
        case TaskType.Watering: return <div className={`bg-cyan-500 ${bgStyles}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconStyles}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582" /></svg>
        </div>;
        case TaskType.Fertilizing: return <div className={`bg-amber-500 ${bgStyles}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconStyles}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" /></svg>
        </div>;
        default: return null;
    }
}

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const { getTaskDetails, toggleTaskCompletion } = useLawnCare();
  const { amount, description } = getTaskDetails(task);

  const formattedDate = task.date.toLocaleDateString('ja-JP', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className={`p-4 bg-white rounded-lg shadow-sm border-l-4 ${task.completed ? 'border-green-400 bg-gray-50' : 'border-gray-300'}`}>
      <div className="flex items-center">
        <TaskIcon type={task.type} />
        <div className="flex-grow">
          <p className={`font-bold ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{getTaskTypeName(task.type)}</p>
          <p className="text-sm text-gray-500">{formattedDate}</p>
          <div className="mt-1">
            <span className={`font-semibold text-lg ${task.completed ? 'text-gray-500' : 'text-green-600'}`}>{amount}</span>
            <span className="text-sm text-gray-600 ml-2">{description}</span>
          </div>
        </div>
        <button onClick={() => toggleTaskCompletion(task.id)} className="ml-4">
          {task.completed ? 
           <CheckCircleIcon className="h-10 w-10 text-green-500" /> : 
           <CheckCircleIconOutline className="h-10 w-10 text-gray-300 hover:text-green-400" />
          }
        </button>
      </div>
    </div>
  );
};


const HomeView: React.FC = () => {
  const { tasks } = useLawnCare();

  const today = new Date();
  const upcomingTasks = tasks.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-lg">おはようございます！</p>
                <p className="text-3xl font-bold">24°C, 晴れ</p>
                <p className="text-sm opacity-90">{today.toLocaleDateString('ja-JP', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            <SunIcon className="h-16 w-16 text-yellow-300" />
        </div>
      </Card>

      <div>
        <h2 className="text-xl font-bold text-gray-700 mb-3">今週のタスク</h2>
        <div className="space-y-4">
          {upcomingTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeView;
