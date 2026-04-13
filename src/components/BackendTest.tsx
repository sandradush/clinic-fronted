// Backend Connectivity Test Component
// Add this temporarily to test your backend connection

import React, { useState } from 'react';
import toast from 'react-hot-toast';

const BackendTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const results: any[] = [];

    // Test 1: Basic connectivity
    try {
      const response = await fetch('http://localhost:3001/api/payments');
      results.push({
        test: 'Payments API',
        status: response.status,
        ok: response.ok,
        url: 'http://localhost:3001/api/payments'
      });
    } catch (error) {
      results.push({
        test: 'Payments API',
        status: 'ERROR',
        ok: false,
        error: error.message,
        url: 'http://localhost:3001/api/payments'
      });
    }

    // Test 2: Check if server is running at all
    try {
      const response = await fetch('http://localhost:3001/');
      results.push({
        test: 'Server Root',
        status: response.status,
        ok: response.ok,
        url: 'http://localhost:3001/'
      });
    } catch (error) {
      results.push({
        test: 'Server Root',
        status: 'ERROR',
        ok: false,
        error: error.message,
        url: 'http://localhost:3001/'
      });
    }

    // Test 3: Check appointments endpoint (for comparison)
    try {
      const response = await fetch('http://localhost:3001/api/appointments');
      results.push({
        test: 'Appointments API',
        status: response.status,
        ok: response.ok,
        url: 'http://localhost:3001/api/appointments'
      });
    } catch (error) {
      results.push({
        test: 'Appointments API',
        status: 'ERROR',
        ok: false,
        error: error.message,
        url: 'http://localhost:3001/api/appointments'
      });
    }

    setTestResults(results);
    setTesting(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow border">
      <h2 className="text-lg font-semibold mb-4">Backend Connectivity Test</h2>
      
      <button
        onClick={runTests}
        disabled={testing}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {testing ? 'Testing...' : 'Run Tests'}
      </button>

      {testResults.length > 0 && (
        <div className="mt-4 space-y-2">
          {testResults.map((result, index) => (
            <div key={index} className={`p-3 rounded border ${result.ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">{result.test}</span>
                <span className={`px-2 py-1 rounded text-xs ${result.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {result.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">{result.url}</div>
              {result.error && (
                <div className="text-sm text-red-600 mt-1">Error: {result.error}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Common Issues:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Backend server not running (start with: npm start or node server.js)</li>
          <li>Wrong port (check if backend is on port 3001)</li>
          <li>CORS issues (backend needs to allow frontend origin)</li>
          <li>API endpoint doesn't exist (/api/payments not implemented)</li>
          <li>Database connection issues</li>
        </ul>
      </div>
    </div>
  );
};

export default BackendTest;