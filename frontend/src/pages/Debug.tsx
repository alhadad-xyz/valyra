import React, { useEffect, useState } from 'react';
import { listingService } from '../services/listingService';

export const Debug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    const info = {
      VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT,
      VITE_LISTING_REGISTRY_CANISTER_ID: import.meta.env.VITE_LISTING_REGISTRY_CANISTER_ID,
      VITE_IC_HOST: import.meta.env.VITE_IC_HOST,
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
    };
    setDebugInfo(info);
  }, []);

  const testCanisterConnection = async () => {
    try {
      setTestResult('Testing canister connection...');
      await listingService.initialize();
      const result = await listingService.getAllListingIds();
      if (result.success) {
        setTestResult(`✅ Success! Found ${result.data.length} listings: ${result.data.join(', ')}`);
      } else {
        setTestResult(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
        <pre className="text-sm">{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>

      <div className="mb-4">
        <button
          onClick={testCanisterConnection}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Canister Connection
        </button>
      </div>

      {testResult && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Test Result</h2>
          <pre className="text-sm">{testResult}</pre>
        </div>
      )}
    </div>
  );
};