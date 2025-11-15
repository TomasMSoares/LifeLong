'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { handleImageUpload } from '@/lib/imageHandler';

export default function ImageUpload({ onImagesChange }) {
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const imageData = await handleImageUpload(files);
    onImagesChange(imageData);
  };

  return (
    <Card className="p-6 bg-cream border-sage">
      <h3 className="text-lg font-semibold text-softBrown mb-4">Add photos</h3>

      <Button asChild className="w-full bg-goldenrod hover:bg-goldenrod/90">
        <label className="cursor-pointer">
          📸 Choose Photos
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </Button>
    </Card>
  );
}
