import { useState } from 'react';
import { CreateSpark } from './CreateSpark';
import { ReceivedSparks } from './ReceivedSparks';
import { SentSparks } from './SentSparks';

const tabs = [
  { id: 'create', label: 'Create Spark', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'received', label: 'Received', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' },
  { id: 'sent', label: 'Sent', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
];

export const SparkDashboard = () => {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 min-h-screen">

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
            <svg className="h-4 w-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Spark Center</h1>
        </div>
        <p className="text-sm text-gray-500 pl-10">Challenge peers and track your learning journey.</p>
      </div>

      {/* Tab Bar */}
      <div className="mb-6 flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 focus:outline-none ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Card */}
      <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-gray-200/80 sm:p-8">
        {activeTab === 'create' && <CreateSpark />}
        {activeTab === 'received' && <ReceivedSparks />}
        {activeTab === 'sent' && <SentSparks />}
      </div>

    </div>
  );
};