/**
 * PixiJS road rendering utilities
 * TODO: Implement PixiJS canvas with interactive road visualization
 */

export function initRoadCanvas(container, entries, onEntryClick) {
  // TODO: Initialize PixiJS
  // const app = new PIXI.Application({ ... });
  // container.appendChild(app.view);

  // TODO: Create road path (curved line)
  // TODO: Add entry markers/points
  // TODO: Add zoom/pan with pixi-viewport
  // TODO: Add click handlers

  console.log('Road canvas initialized (placeholder)', { entries });

  // Placeholder: Just show a simple div
  const placeholder = document.createElement('div');
  placeholder.className = 'flex items-center justify-center h-full';
  placeholder.innerHTML = `
    <div class="text-center text-softBrown">
      <p class="text-2xl mb-4">🛤️ Road Canvas (PixiJS)</p>
      <p class="text-lg">${entries.length} memories on your journey</p>
      <p class="text-sm mt-2 text-gray-500">TODO: Implement PixiJS visualization</p>
    </div>
  `;
  container.appendChild(placeholder);

  // Return cleanup function
  return () => {
    container.innerHTML = '';
    // TODO: app.destroy();
  };
}
