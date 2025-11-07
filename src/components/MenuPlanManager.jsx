import { useState, useEffect } from 'react';
import MenuItemManager from './MenuItemManager';
import PlanLimitManager from './PlanLimitManager';
import DashboardLoader from '../DashboardLoader';

const MenuPlanManager = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (pageLoading) {
    return <DashboardLoader pageName="Menu & Plans" />;
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
      <div className="p-3 xs:p-4 sm:p-6">
        <h1 className="text-lg xs:text-xl sm:text-2xl font-bold mb-3 xs:mb-4 sm:mb-6 px-1" style={{color: 'hsl(45, 100%, 20%)'}}>Menu & Plans Management</h1>
        
        <div className="mb-4 xs:mb-6">
          <div className="flex border-b overflow-x-auto" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 xs:px-6 py-2.5 xs:py-3 font-medium transition-colors whitespace-nowrap touch-manipulation text-sm xs:text-base ${
                activeTab === 'menu'
                  ? 'border-b-2 text-white'
                  : 'text-gray-600 hover:text-gray-800 active:text-gray-900'
              }`}
              style={{
                borderBottomColor: activeTab === 'menu' ? 'hsl(45, 43%, 58%)' : 'transparent',
                backgroundColor: activeTab === 'menu' ? 'hsl(45, 43%, 58%)' : 'transparent',
                color: activeTab === 'menu' ? 'white' : 'hsl(45, 100%, 20%)'
              }}
            >
              Menu Items
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 xs:px-6 py-2.5 xs:py-3 font-medium transition-colors whitespace-nowrap touch-manipulation text-sm xs:text-base ${
                activeTab === 'plans'
                  ? 'border-b-2 text-white'
                  : 'text-gray-600 hover:text-gray-800 active:text-gray-900'
              }`}
              style={{
                borderBottomColor: activeTab === 'plans' ? 'hsl(45, 43%, 58%)' : 'transparent',
                backgroundColor: activeTab === 'plans' ? 'hsl(45, 43%, 58%)' : 'transparent',
                color: activeTab === 'plans' ? 'white' : 'hsl(45, 100%, 20%)'
              }}
            >
              Plan Limits
            </button>
          </div>
        </div>

        <div>
          {activeTab === 'menu' && <MenuItemManager />}
          {activeTab === 'plans' && <PlanLimitManager />}
        </div>
      </div>
    </div>
  );
};

export default MenuPlanManager;
