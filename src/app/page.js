'use client';

import { useState, useEffect } from 'react';
import RoadCanvas from '@/components/RoadCanvas';
import CreateEntryModal from '@/components/CreateEntryModal';
import EntryDetailModal from '@/components/EntryDetailModal';
import { loadEntries, saveEntry } from '@/lib/storage';
import AppHeader from '@/components/AppHeader';
import InitialPage from '@/components/InitialPage';

export default function Home() {
  const [entries, setEntries] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Load entries on mount
  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const handleCreateEntry = async (voiceText, images) => {
    const newEntry = await saveEntry(voiceText, images);
    setEntries([...entries, newEntry]);
    setShowCreate(false);
  };

  return (
    <div className="h-screen">
      <InitialPage/>

      {/* Main Canvas */}
      <RoadCanvas
        entries={entries}
        onEntryClick={(entry) => {
          if (entry === null) {
            setTimeout(() => {
              setShowCreate(true);
            }, 300);
          } else {
            // Clicked an existing entry
            setSelectedEntry(entry);
          }
        }}
      />

      {/* Modals */}
      <CreateEntryModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreateEntry}
      />

      <EntryDetailModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
}
