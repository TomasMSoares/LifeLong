'use client';

import { useState, useEffect } from 'react';
import RoadCanvas from '@/components/RoadCanvas';
import CreateEntryModal from '@/components/CreateEntryModal';
import EntryDetailModal from '@/components/EntryDetailModal';
import { Button } from '@/components/ui/button';
import { loadEntries, saveEntry } from '@/lib/storage';

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
    <div className="h-screen bg-gradient-to-br from-cream to-warmBeige">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center">
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-terracotta hover:bg-terracotta/90 text-white px-6 py-3 rounded-full"
        >
          + New Memory
        </Button>
        <h1 className="text-3xl font-serif text-softBrown">Memory Road</h1>
      </header>

      {/* Main Canvas */}
      <RoadCanvas
        entries={entries}
        onEntryClick={setSelectedEntry}
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
