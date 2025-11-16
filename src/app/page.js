'use client';

import { useState, useEffect } from 'react';
import RoadCanvas from '@/components/RoadCanvas';
import CreateEntryModal from '@/components/CreateEntryModal';
import EntryDetailModal from '@/components/EntryDetailModal';
import Logo from '@/components/Logo';
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
  
  // Load username from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('lifelongUsername');
    if (savedUsername) {
      setUser(savedUsername);
    }
  }, []);
  
  // Save username to localStorage when it changes
  const handleUserSubmit = (username) => {
    localStorage.setItem('lifelongUsername', username);
    setUser(username);
  };
  
  // Function to refresh entries from database
  const refreshEntries = async () => {
    try {
      const allEntries = await getAllDiaryEntries();
      setEntries(allEntries);
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  };
  
  // Load entries on mount
  useEffect(() => {
    async function fetchEntries() {
      try {
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
      console.log('Creating entry with:', {
        transcript: transcript.substring(0, 50) + '...',
        imageIds: imageIds,
        imageCount: imageIds?.length || 0
      });
      
      // Prepare image data for LLM
      const imageData = imageIds?.length > 0
        ? await Promise.all(
            imageIds.map(async (id) => {
              const base64 = await getImageAsBase64(id);
              if (!base64) {
                console.warn(`Failed to get base64 for image ${id}`);
              }
              return {
                id,
                base64
              };
            })
          ).then(imgs => imgs.filter(img => img.base64)) // Filter out failed images
        : [];
      
      console.log(`Prepared ${imageData.length} images for LLM`);

      // Generate diary entry with LLM
      const llmResponse = await generateDiaryEntry(transcript, user, imageData);
      
      console.log('LLM Response:', {
        paragraphs: llmResponse.paragraphs?.length,
        imageMappings: Object.keys(llmResponse.imageParagraphMapping || {}).length,
        imageDescriptions: Object.keys(llmResponse.imageDescriptions || {}).length
      });

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

      console.log('Saving entry data:', {
        paragraphs: entryData.paragraphs.length,
        imageIds: entryData.imageIds.length,
        imageMappings: Object.keys(entryData.imageParagraphMapping).length,
        imageDescriptions: Object.keys(entryData.imageDescriptions).length
      });

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
    <div className="h-full min-h-screen">
      <InitialPage onSubmit={handleUserSubmit} existingUser={user} />

      {/* Logo Header - only show after user has entered their name */}
      {user && <Logo userName={user} />}

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
        onEntryDeleted={() => {
          setSelectedEntry(null);
          refreshEntries();
        }}
      />
    </div>
  );
}
