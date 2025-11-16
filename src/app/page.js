'use client';

import { useState, useEffect } from 'react';
import RoadCanvas from '@/components/RoadCanvas';
import CreateEntryModal from '@/components/CreateEntryModal';
import EntryDetailModal from '@/components/EntryDetailModal';
import {
  getAllDiaryEntries,
  populateDatabaseWithSamples,
  saveDiaryEntry,
  getDiaryEntry
} from '@/lib/storage';
import InitialPage from '@/components/InitialPage';
import { generateDiaryEntry } from '@/lib/gemini';
import { getImageAsBase64 } from '@/lib/imageDB';

export default function Home() {
  const [entries, setEntries] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState("");
  // Load entries on mount
  useEffect(() => {
    async function fetchEntries() {
      try {
        await populateDatabaseWithSamples();
        const allEntries = await getAllDiaryEntries();
        setEntries(allEntries);
      } catch (error) {
        console.error('Failed to load entries:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEntries();
  }, []);

  const handleCreateEntry = async (audioBlob, transcript, imageIds) => {
    
    try {
      // Prepare image data for LLM
      const imageData = imageIds?.length > 0
        ? await Promise.all(
            imageIds.map(async (id) => ({
              id,
              base64: await getImageAsBase64(id)
            }))
          )
        : [];

      // Generate diary entry with LLM
      const llmResponse = await generateDiaryEntry(transcript, user, imageData);

      // Save complete entry to database
      const entryData = {
        date: new Date().toISOString(),
        userName: user,
        transcript,
        imageIds: imageIds || [],
        audioBlob,
        paragraphs: llmResponse.paragraphs,
        imageParagraphMapping: llmResponse.imageParagraphMapping,
        imageDescriptions: llmResponse.imageDescriptions,
      };

      const newEntryId = await saveDiaryEntry(entryData);
      const newEntry = await getDiaryEntry(newEntryId);

      setEntries([...entries, newEntry]);
      setShowCreate(false);
      
      // Open the newly created entry
      setTimeout(() => setSelectedEntry(newEntry), 300);
    } catch (error) {
      console.error('Failed to create entry:', error);
      throw error; // Let CreateEntryModal handle the error
    }
  };

  return (
    <div className="h-screen">
      <InitialPage onSubmit={setUser}/>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-softBrown text-lg">Loading your memories...</p>
          </div>
        </div>
      ) : (
        <RoadCanvas
          entries={entries}
          onEntryClick={(entry) => {
            if (entry === null) {
              setTimeout(() => setShowCreate(true), 300);
            } else {
              setSelectedEntry(entry);
            }
          }}
        />
      )}

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
