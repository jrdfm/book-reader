import React, { useEffect, useRef } from 'react';
import { useBookReader } from '../context/BookReaderContext';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useBookReader();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  const fonts = [
    { name: 'Bookerly', value: 'Bookerly' },
    { name: 'Georgia', value: 'Georgia' },
    { name: 'Times New Roman', value: 'Times New Roman' },
    { name: 'Arial', value: 'Arial' },
    { name: 'Helvetica', value: 'Helvetica' }
  ];

  return (
    <div ref={overlayRef} className="absolute right-0 top-12 w-72 bg-[#FAF4E8] border border-[#e5decf] rounded-lg shadow-lg p-4 z-50">
      <div className="space-y-4">
        {/* Font Selection */}
        <div>
          <label className="block text-sm font-medium text-[#2B2B2B] mb-1">Font:</label>
          <select
            value={state.preferences.fontFamily}
            onChange={(e) => dispatch({
              type: 'UPDATE_PREFERENCES',
              payload: { fontFamily: e.target.value }
            })}
            className="w-full p-2 bg-white border border-[#e5decf] rounded text-[#2B2B2B]"
          >
            {fonts.map(font => (
              <option key={font.value} value={font.value}>{font.name}</option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-4">
          <label className="w-32">Font Size:</label>
          <input
            type="range"
            min="14"
            max="28"
            step="1"
            value={state.preferences.fontSize}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_PREFERENCES',
                payload: { fontSize: Number(e.target.value) },
              })
            }
            className="w-48"
          />
          <span>{state.preferences.fontSize}px</span>
        </div>

        {/* Alignment */}
        <div>
          <label className="block text-sm font-medium text-[#2B2B2B] mb-1">Alignment:</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="alignment"
                value="justify"
                checked={state.preferences.textAlign === 'justify'}
                onChange={() => dispatch({
                  type: 'UPDATE_PREFERENCES',
                  payload: { textAlign: 'justify' }
                })}
                className="mr-2"
              />
              Justified
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="alignment"
                value="left"
                checked={state.preferences.textAlign === 'left'}
                onChange={() => dispatch({
                  type: 'UPDATE_PREFERENCES',
                  payload: { textAlign: 'left' }
                })}
                className="mr-2"
              />
              Left-Aligned
            </label>
          </div>
        </div>

        {/* Line Spacing */}
        <div>
          <label className="block text-sm font-medium text-[#2B2B2B] mb-1">Line spacing:</label>
          <div className="flex gap-4">
            {['1.5', '1.8', '2'].map((spacing) => (
              <label key={spacing} className="flex items-center">
                <input
                  type="radio"
                  name="lineSpacing"
                  value={spacing}
                  checked={state.preferences.lineSpacing === spacing}
                  onChange={() => dispatch({
                    type: 'UPDATE_PREFERENCES',
                    payload: { lineSpacing: spacing }
                  })}
                  className="mr-2"
                />
                {spacing === '1.5' ? 'Small' : spacing === '1.8' ? 'Medium' : 'Large'}
              </label>
            ))}
          </div>
        </div>

        {/* Color Mode */}
        <div>
          <label className="block text-sm font-medium text-[#2B2B2B] mb-1">Color mode:</label>
          <div className="flex gap-4">
            <button
              onClick={() => dispatch({
                type: 'UPDATE_PREFERENCES',
                payload: { theme: 'white' }
              })}
              className={`px-4 py-2 rounded ${
                state.preferences.theme === 'white'
                  ? 'bg-white border-2 border-[#2B2B2B]'
                  : 'bg-white border border-[#e5decf]'
              }`}
            >
              White
            </button>
            <button
              onClick={() => dispatch({
                type: 'UPDATE_PREFERENCES',
                payload: { theme: 'sepia' }
              })}
              className={`px-4 py-2 rounded ${
                state.preferences.theme === 'sepia'
                  ? 'bg-[#F4ECD8] border-2 border-[#2B2B2B]'
                  : 'bg-[#F4ECD8] border border-[#e5decf]'
              }`}
            >
              Sepia
            </button>
          </div>
        </div>

        {/* Page Width */}
        <div className="flex items-center gap-4">
          <label className="w-32">Page Width:</label>
          <input
            type="range"
            min="65"
            max="100"
            step="5"
            value={state.preferences.pageWidth}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_PREFERENCES',
                payload: { pageWidth: Number(e.target.value) },
              })
            }
            className="w-48"
          />
          <span>{state.preferences.pageWidth}%</span>
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay; 