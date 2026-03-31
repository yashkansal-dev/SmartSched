import React from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  BarChart3, 
  MessageSquare, 
  Download,
  Settings,
  GraduationCap,
  CalendarDays,
  UserCog,
  FileText,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    ];

    const roleSpecificItems = {
      tt_coordinator: [
        { id: 'calendar', icon: Calendar, label: 'Academic Calendar' },
        { id: 'timetable', icon: Clock, label: 'Timetable Generation' },
        { id: 'leave-management', icon: Users, label: 'Leave Management' },
        { id: 'practical-exams', icon: BookOpen, label: 'Practical Exams' },
        { id: 'analytics', icon: TrendingUp, label: 'Analytics & Reports' },
        { id: 'notifications', icon: MessageSquare, label: 'SMS Notifications' },
        { id: 'exports', icon: Download, label: 'Export Schedules' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ],
      faculty: [
        { id: 'my-schedule', icon: CalendarDays, label: 'My Schedule' },
        { id: 'leave-request', icon: UserCog, label: 'Request Leave' },
        { id: 'notifications', icon: MessageSquare, label: 'Notifications' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ],
      student: [
        { id: 'class-schedule', icon: CalendarDays, label: 'Class Schedule' },
        { id: 'exam-schedule', icon: GraduationCap, label: 'Exam Schedule' },
        { id: 'notifications', icon: MessageSquare, label: 'Updates' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ],
      exam_incharge: [
        { id: 'practical-exams', icon: BookOpen, label: 'Practical Exams' },
        { id: 'exam-analytics', icon: TrendingUp, label: 'Exam Reports' },
        { id: 'notifications', icon: MessageSquare, label: 'Notifications' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ],
      hod: [
        { id: 'department-analytics', icon: TrendingUp, label: 'Department Reports' },
        { id: 'faculty-workload', icon: Users, label: 'Faculty Workload' },
        { id: 'exports', icon: Download, label: 'Export Reports' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ],
      principal: [
        { id: 'overview', icon: TrendingUp, label: 'Institution Overview' },
        { id: 'analytics', icon: BarChart3, label: 'Analytics' },
        { id: 'exports', icon: Download, label: 'Export Reports' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ],
    };

    return [...baseItems, ...(roleSpecificItems[user?.role || 'faculty'] || [])];
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="SmartSched logo"
            className="w-10 h-10 rounded-lg object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">SmartSched</h1>
            <p className="text-sm text-gray-500">AI Scheduler</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-600">
              {user?.name?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;