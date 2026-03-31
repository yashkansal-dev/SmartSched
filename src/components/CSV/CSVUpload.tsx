import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, X } from 'lucide-react';
import api from '../../services/api';

interface CSVUploadProps {
  uploadType: 'faculty' | 'subject' | 'section';
  onSuccess?: (data: any) => void;
}

const CSVUploadComponent: React.FC<CSVUploadProps> = ({ uploadType, onSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setStatus('error');
      setMessage('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    setStatus('idle');
    setFileName(file.name);

    try {
      const response = await api.uploadCSV(file, uploadType);
      setStatus('success');
      setMessage(`Successfully imported ${response.data.imported} ${uploadType} records`);
      
      if (onSuccess) {
        onSuccess(response.data);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Failed to upload CSV');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload {uploadType.toUpperCase()} CSV</h3>
      
      {status === 'success' && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-green-800 font-medium">{message}</p>
            <p className="text-green-700 text-sm">File: {fileName}</p>
          </div>
          <button
            onClick={() => setStatus('idle')}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{message}</p>
          <button
            onClick={() => setStatus('idle')}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">
            <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
              Click to select
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />
            </label>
            {' '}or drag and drop
          </p>
          <p className="text-xs text-gray-500">CSV format only (Max 10MB)</p>
        </div>
      </div>

      <div className="mt-4 bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
        <p className="font-medium mb-2">Expected columns for {uploadType}:</p>
        <ul className="list-disc list-inside space-y-1">
          {uploadType === 'faculty' && (
            <>
              <li>name</li>
              <li>email</li>
              <li>department</li>
              <li>max_hours_per_week</li>
            </>
          )}
          {uploadType === 'subject' && (
            <>
              <li>name</li>
              <li>code</li>
              <li>subject_type (theory/lab)</li>
              <li>hours_per_week</li>
              <li>faculty_email</li>
            </>
          )}
          {uploadType === 'section' && (
            <>
              <li>name</li>
              <li>semester</li>
              <li>total_students</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CSVUploadComponent;
