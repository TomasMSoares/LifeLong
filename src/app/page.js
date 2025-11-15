'use client';

import { useState, useEffect } from 'react';
import RoadCanvas from '@/components/RoadCanvas';
import CreateEntryModal from '@/components/CreateEntryModal';
import EntryDetailModal from '@/components/EntryDetailModal';
import { Button } from '@/components/ui/button';
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
    <div className="h-screen bg-gradient-to-b from-white to-warmBeige flex-col">
      <AppHeader/>
      <InitialPage/>
      {/* <MainContent/> */}
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </div>
    </div>
  );
}
