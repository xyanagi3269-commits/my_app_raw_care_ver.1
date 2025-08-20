
import React, { useState } from 'react';
import { HomeIcon, CalendarIcon, CameraIcon, ArchiveBoxIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';
import { LawnCareProvider } from './context/LawnCareContext';
import HomeView from './components/views/HomeView';
import CalendarView from './components/views/CalendarView';
import InventoryView from './components/views/InventoryView';
import SettingsView from './components/views/SettingsView';
import MediaLogView from './components/views/MediaLogView';

type View = 'home' | 'calendar' | 'medialog' | 'inventory' | 'settings';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('home');

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'calendar':
        return <CalendarView />;
      case 'medialog':
        return <MediaLogView />;
      case 'inventory':
        return <InventoryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  const NavItem: React.FC<{ view: View; label: string; icon: React.ReactNode }> = ({ view, label, icon }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
        activeView === view ? 'text-green-600' : 'text-gray-500 hover:text-green-500'
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );

  return (
    <LawnCareProvider>
      <div className="min-h-screen bg-green-50/50 flex flex-col">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold text-green-800 text-center">芝生ケアコーチ</h1>
          </div>
        </header>

        <main className="flex-grow max-w-md mx-auto w-full p-4 pb-24">
          {renderView()}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 shadow-t-md">
          <div className="flex justify-around">
            <NavItem view="home" label="ホーム" icon={<HomeIcon className="h-6 w-6" />} />
            <NavItem view="calendar" label="カレンダー" icon={<CalendarIcon className="h-6 w-6" />} />
            <NavItem view="medialog" label="メディア" icon={<CameraIcon className="h-6 w-6" />} />
            <NavItem view="inventory" label="在庫・費用" icon={<ArchiveBoxIcon className="h-6 w-6" />} />
            <NavItem view="settings" label="設定" icon={<Cog6ToothIcon className="h-6 w-6" />} />
          </div>
        </nav>
      </div>
    </LawnCareProvider>
  );
};

export default App;
