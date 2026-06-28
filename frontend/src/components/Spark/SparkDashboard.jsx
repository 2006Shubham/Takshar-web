import { useState } from 'react';

// Import our new modular components
import { CreateSpark } from './CreateSpark';
import { ReceivedSparks } from './ReceivedSparks';
import { SentSparks } from './SentSparks';

export const SparkDashboard = () => {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 min-h-screen">
      <div className="mb-8 flex flex-col items-center sm:flex-row sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Spark Center</h1>
          <p className="text-sm text-gray-500 mt-1">Spark peers and track your progress.</p>
        </div>

        <div className="flex space-x-1 rounded-xl bg-gray-100 p-1">
          {[
            { id: 'create', label: 'Create Spark' },
            { id: 'received', label: 'Received' },
            { id: 'sent', label: 'Sent' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 ${activeTab === tab.id
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8 transition-all">
        {/* Conditional Rendering of our new modular components */}
        {activeTab === 'create' && <CreateSpark />}

        {activeTab === 'received' && (
          <ReceivedSparks
          />
        )}

        {activeTab === 'sent' && <SentSparks />}
      </div>
    </div>
  );
};