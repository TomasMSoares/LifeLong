'use client';

import { useState, useEffect } from 'react';
import RoadCanvas from '@/components/RoadCanvas';
import CreateEntryModal from '@/components/CreateEntryModal';
import EntryDetailModal from '@/components/EntryDetailModal';
import { Button } from '@/components/ui/button';
import { loadEntries, saveEntry } from '@/lib/storage';
import AppHeader from '@/components/AppHeader';

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
    <div className="h-screen bg-gradient-to-b from-white to-warmBeige flex-col">
      <AppHeader/>
    </div>
  );
}
