import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/Auth/AuthPage';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import AcademicCalendar from './components/Calendar/AcademicCalendar';
import TimetableGeneration from './components/Timetable/TimetableGeneration';
import LeaveManagement from './components/Leave/LeaveManagement';
import PracticalExams from './components/Exams/PracticalExams';
import Analytics from './components/Analytics/Analytics';
import SMSNotifications from './components/Notifications/SMSNotifications';
import Settings from './components/Settings/Settings';
import ExportSchedules from './components/Export/ExportSchedules';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (!user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onSectionChange={setActiveSection} />;
      case 'calendar':
        return <AcademicCalendar />;
      case 'timetable':
        return <TimetableGeneration />;
      case 'leave-management':
        return <LeaveManagement />;
      case 'practical-exams':
        return <PracticalExams />;
      case 'analytics':
        return <Analytics />;
      case 'notifications':
        return <SMSNotifications />;
      case 'settings':
        return <Settings />;
      case 'exports':
        return <ExportSchedules />;
      // Faculty-specific routes
      case 'my-schedule':
        return <Dashboard onSectionChange={setActiveSection} />;
      case 'leave-request':
        return <LeaveManagement />;
      // Student-specific routes
      case 'class-schedule':
        return <Dashboard onSectionChange={setActiveSection} />;
      case 'exam-schedule':
        return <PracticalExams />;
      // HOD-specific routes
      case 'department-analytics':
        return <Analytics />;
      case 'faculty-workload':
        return <Analytics />;
      // Principal-specific routes
      case 'overview':
        return <Analytics />;
      // Exam in-charge specific routes
      case 'exam-analytics':
        return <Analytics />;
      default:
        return <Dashboard onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;