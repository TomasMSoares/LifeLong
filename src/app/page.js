'use client';

import { useState, useEffect } from 'react';
import RoadCanvas from '@/components/RoadCanvas';
import CreateEntryModal from '@/components/CreateEntryModal';
import EntryDetailModal from '@/components/EntryDetailModal';
import { getAllDiaryEntries, populateDatabaseWithSamples, saveDiaryEntry } from '@/lib/storage';
import InitialPage from '@/components/InitialPage';
import { generateDiaryEntry } from '@/lib/gemini';
import { getImageAsBase64 } from '@/lib/imageDB';

export default function Home() {
  console.log('[Home] Component rendering');
  
  const [entries, setEntries] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Load entries on mount
  useEffect(() => {
    console.log('[Home] useEffect running - fetching entries');
    async function fetchEntries() {
      try {
        console.log('[Home] Populating database with samples...');
        await populateDatabaseWithSamples(); // For testing/demo purposes
        console.log('[Home] Getting all diary entries...');
        const allEntries = await getAllDiaryEntries();
        console.log('[Home] Fetched entries:', allEntries);
        setEntries(allEntries);
      } catch (error) {
        console.error('[Home] Error fetching entries:', error);
      }
    }
    fetchEntries();
  }, []);

  const handleCreateEntry = async (audioBlob, transcript, imageIds) => {
    console.log('[Home] handleCreateEntry called with:', { audioBlob, transcript, imageIds });
    
    try {
      // Fetch all image data as base64 with proper async handling
      console.log('[Home] Fetching image data...');
      const imageData = imageIds && imageIds.length > 0
        ? await Promise.all(
            imageIds.map(async (id) => ({
              id,
              base64: await getImageAsBase64(id)
            }))
          )
        : [];
      console.log('[Home] Image data fetched:', imageData);

      const entryData = {
        date: new Date().toISOString(),
        userName: "USER_PLACEHOLDER",
        transcript,
        imageIds: imageIds || [], // ✅ Add imageIds array
        imageData, // For LLM API
        audioBlob,
      };
      console.log('[Home] Entry data prepared:', entryData);

      console.log('[Home] Generating diary entry with LLM...');
      const llmResponse = await generateDiaryEntry(transcript, entryData.userName, entryData.imageData);
      console.log('[Home] LLM response received:', llmResponse);

      entryData.paragraphs = llmResponse.paragraphs;
      entryData.imageParagraphMapping = llmResponse.imageParagraphMapping;
      entryData.imageDescriptions = llmResponse.imageDescriptions;

      console.log('[Home] Saving diary entry...');
      const newEntryId = await saveDiaryEntry(entryData); // ✅ Returns ID string
      console.log('[Home] New entry ID:', newEntryId);

      // ✅ Fetch the full entry object from database
      const { getDiaryEntry } = await import('@/lib/storage');
      const newEntry = await getDiaryEntry(newEntryId);
      console.log('[Home] New entry fetched:', newEntry);

      setEntries([...entries, newEntry]);
      console.log('[Home] Entries state updated');

      setShowCreate(false);
      // Open the newly created entry in detail modal
      setTimeout(() => {
        console.log('[Home] Opening new entry in detail modal');
        setSelectedEntry(newEntry);
      }, 300); // Small delay for smooth transition
    } catch (error) {
      console.error('[Home] Error in handleCreateEntry:', error);
    }
  };

  console.log('[Home] Rendering with entries:', entries);
  
  return (
    <div className="h-screen">
      <InitialPage/>

      {/* Main Canvas */}
      <RoadCanvas
        entries={entries}
        onEntryClick={(entry) => {
          console.log('[Home] Entry clicked:', entry);
          if (entry === null) {
            console.log('[Home] Add memory clicked, opening create modal');
            setTimeout(() => {
              setShowCreate(true);
            }, 300);
          } else {
            console.log('[Home] Existing entry clicked, opening detail modal');
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
