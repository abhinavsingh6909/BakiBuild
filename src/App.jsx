import React, { useState, useEffect } from 'react';
import { loadAppData, saveAppData } from './utils/storage';
import { FirstLaunchSetup } from './components/FirstLaunchSetup';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { TodayTab } from './components/TodayTab';
import { StepsTab } from './components/StepsTab';
import { HistoryTab } from './components/HistoryTab';
import { RestTimer } from './components/RestTimer';

export function App() {
  const [data, setData] = useState(() => loadAppData());
  const [activeTab, setActiveTab] = useState('today');

  // Auto save to localStorage whenever data changes
  useEffect(() => {
    saveAppData(data);
  }, [data]);

  const handleCompleteSetup = (newSetup) => {
    setData(prev => ({
      ...prev,
      setup: newSetup
    }));
  };

  const handleSaveWorkouts = (updatedWorkouts) => {
    setData(prev => ({
      ...prev,
      workouts: updatedWorkouts
    }));
  };

  const handleUpdateSteps = (dateStr, stepsCount) => {
    setData(prev => ({
      ...prev,
      steps: {
        ...prev.steps,
        [dateStr]: stepsCount
      }
    }));
  };

  // Show onboarding setup screen if setup.done is false
  if (!data.setup || !data.setup.done) {
    return <FirstLaunchSetup onComplete={handleCompleteSetup} />;
  }

  return (
    <>
      <TopBar userName={data.setup.name} workouts={data.workouts} />

      <main className="main-content">
        {activeTab === 'today' && (
          <TodayTab
            workouts={data.workouts}
            onSaveWorkouts={handleSaveWorkouts}
          />
        )}

        {activeTab === 'steps' && (
          <StepsTab
            stepsData={data.steps}
            onUpdateSteps={handleUpdateSteps}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            workouts={data.workouts}
            stepsData={data.steps}
          />
        )}
      </main>

      {/* Floating Rest Timer on Today tab */}
      {activeTab === 'today' && (
        <RestTimer defaultRestSeconds={data.setup.restSeconds || 90} />
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  );
}

export default App;
