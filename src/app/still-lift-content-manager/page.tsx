'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useContent, useAllMessages } from '@/hooks/useStillLiftContent';
import { type Mood, type Context, type ContentMessage, MOODS, CONTEXTS } from '@/lib/still-lift-content';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Background from '@/components/Background';

export default function ContentManagerPage() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<Mood>('good');
  const [selectedContext, setContext] = useState<Context>('still');
  const [newMessage, setNewMessage] = useState<ContentMessage>({
    actionType: 'ACTION',
    message: '',
    displayTime: 10,
    audioIndex: 1
  });
  const [isAdding, setIsAdding] = useState(false);

  const {
    isDarkMode,
    audioEnabled,
    screenlessMode,
    toggleTheme,
    toggleReadAloud,
    toggleScreenless,
  } = useUserPreferences();

  const { messages } = useContent({
    mood: selectedMood,
    context: selectedContext,
    count: 100, // Get all messages
    shuffle: false
  });

  const handleAddMessage = () => {
    if (!newMessage.message.trim()) {
      alert('Please fill in the message');
      return;
    }

    // In a real implementation, you would save this to your content library
    // For now, we'll just show a success message
    alert(`Message added for ${selectedMood} - ${selectedContext}:\n\nAction Type: ${newMessage.actionType}\nMessage: ${newMessage.message}\nDisplay Time: ${newMessage.displayTime}s`);
    
    // Reset form
    setNewMessage({
      actionType: 'ACTION',
      message: '',
      displayTime: 10,
      audioIndex: 1
    });
  };

  const handleExportContent = () => {
    // This would export the current content structure
    const contentStructure = {
      [selectedMood]: {
        [selectedContext]: messages
      }
    };
    
    const blob = new Blob([JSON.stringify(contentStructure, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-${selectedMood}-${selectedContext}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Background />
      
      <Header
        isDarkMode={isDarkMode}
        audioEnabled={audioEnabled}
        screenlessMode={screenlessMode}
        onToggleTheme={toggleTheme}
        onToggleReadAloud={toggleReadAloud}
        onToggleScreenless={toggleScreenless}
      />

      <main className="flex-1 flex flex-col">
        <section className="screen active">
          <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Content Manager
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Manage your content library for different mood and context combinations.
              </p>
            </div>

            {/* Mood and Context Selection */}
            <div className="glass-card p-6 mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Select Mood & Context
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Mood
                  </label>
                  <select
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(e.target.value as Mood)}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {MOODS.map(mood => (
                      <option key={mood} value={mood}>
                        {mood.charAt(0).toUpperCase() + mood.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Context
                  </label>
                  <select
                    value={selectedContext}
                    onChange={(e) => setContext(e.target.value as Context)}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {CONTEXTS.map(context => (
                      <option key={context} value={context}>
                        {context.charAt(0).toUpperCase() + context.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Current Messages */}
            <div className="glass-card p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Current Messages ({messages.length})
                </h2>
                <button
                  onClick={handleExportContent}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Export JSON
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((message, index) => (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded font-medium">
                          {message.actionType}
                        </span>
                        <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                          {message.displayTime}s
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      {message.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Message */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Add New Message
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Action Type *
                    </label>
                    <select
                      value={newMessage.actionType}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, actionType: e.target.value as 'VISUALIZE' | 'ACTION' | 'REPEAT' | 'BREATHE' | 'LISTEN' }))}
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="VISUALIZE">VISUALIZE</option>
                      <option value="ACTION">ACTION</option>
                      <option value="REPEAT">REPEAT</option>
                      <option value="BREATHE">BREATHE</option>
                      <option value="LISTEN">LISTEN</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Display Time (seconds) *
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={newMessage.displayTime}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, displayTime: parseInt(e.target.value) || 10 }))}
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      placeholder="10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={newMessage.message}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Enter message content..."
                  />
                </div>


                <div className="flex gap-4">
                  <button
                    onClick={handleAddMessage}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add Message
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Back to App
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
