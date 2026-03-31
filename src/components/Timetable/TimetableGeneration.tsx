import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, BookOpen, Zap, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { TimeSlot } from '../../types';
import api from '../../services/api';

interface Section {
  id: number;
  name: string;
  semester: number;
}

interface ApiTimeSlot {
  id: number;
  section_name: string;
  subject_name: string;
  day: string;
  time_slot: string;
  faculty_name?: string;
  room: string;
}

const TimetableGeneration: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedTimetable, setGeneratedTimetable] = useState<ApiTimeSlot[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);

  const timeSlots = ['09:00-10:00', '10:00-11:00', '11:30-12:30', '12:30-13:30', '14:30-15:30', '15:30-16:30'];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayLabels = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday' };

  useEffect(() => {
    // Fetch sections on mount
    const fetchSections = async () => {
      try {
        const response = await api.getSections();
        setSections(response.data.results || response.data);
        if (response.data.results?.[0]) {
          setSelectedSection(response.data.results[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch sections:', err);
        setError('Failed to load sections');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSections();
  }, []);

  const generateTimetable = async () => {
    if (!selectedSection) {
      setError('Please select a section');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await api.generateTimetable(selectedSection);
      setGeneratedTimetable(response.data.timetable);
      setConflicts(response.data.conflicts || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate timetable');
      console.error('Timetable generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!selectedSection) {
      setError('Please select a section');
      return;
    }

    try {
      const response = await api.exportTimetable(selectedSection);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `timetable_${selectedSection}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);
    } catch (err) {
      setError('Failed to export timetable');
      console.error('Export failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Timetable Generation</h1>
          <p className="text-gray-600">AI-powered scheduling with conflict resolution</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleExport}
            disabled={generatedTimetable.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={generateTimetable}
            disabled={isGenerating || !selectedSection}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Generate AI Timetable</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Section</label>
              <select 
                value={selectedSection || ''}
                onChange={(e) => setSelectedSection(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select --</option>
                {sections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.name} (Sem {section.semester})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Parameters</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Faculty Preference Weight
              </label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                defaultValue="70"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Constraints</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm text-gray-700">No back-to-back labs</span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm text-gray-700">Faculty lunch break</span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm text-gray-700">Room capacity check</span>
            </div>
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900">AI is generating your timetable...</h3>
              <div className="mt-2">
                <div className="text-sm text-blue-700 mb-2">Processing constraints and optimizing schedule</div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {conflicts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Scheduling Conflicts:</h4>
          <ul className="space-y-1">
            {conflicts.map((conflict, idx) => (
              <li key={idx} className="text-sm text-yellow-700">• {conflict}</li>
            ))}
          </ul>
        </div>
      )}

      {generatedTimetable.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">Generated Timetable</h3>
            </div>
            <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-lg">
              ✓ {generatedTimetable.length} slots scheduled
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Time</th>
                  {days.map(day => (
                    <th key={day} className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">
                      {dayLabels[day as keyof typeof dayLabels]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot, index) => (
                  <tr key={slot} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b">
                      {slot}
                    </td>
                    {days.map(day => {
                      const timeSlotEntry = generatedTimetable.find(
                        ts => ts.day === day && ts.time_slot === slot
                      );
                      
                      return (
                        <td key={`${day}-${slot}`} className="px-4 py-3 border-b">
                          {timeSlotEntry ? (
                            <div className="p-2 rounded-lg text-xs bg-blue-100 text-blue-800 border border-blue-200">
                              <div className="font-semibold">{timeSlotEntry.subject_name}</div>
                              <div className="opacity-75">{timeSlotEntry.faculty_name || 'TBD'}</div>
                              <div className="opacity-75">{timeSlotEntry.room}</div>
                            </div>
                          ) : (
                            <div className="text-center text-gray-400 text-xs">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {generatedTimetable.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{generatedTimetable.length}</p>
                <p className="text-sm text-gray-600">Total Slots</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{new Set(generatedTimetable.map(t => t.subject_name)).size}</p>
                <p className="text-sm text-gray-600">Subjects</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{new Set(generatedTimetable.map(t => t.faculty_name)).size}</p>
                <p className="text-sm text-gray-600">Faculty</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{conflicts.length}</p>
                <p className="text-sm text-gray-600">Conflicts</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableGeneration;