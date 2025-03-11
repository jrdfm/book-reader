import React from 'react';
import { useBookReader } from '../context/BookReaderContext';
import type { UserPreferences } from '../types';

const Settings: React.FC = () => {
  const { state, dispatch } = useBookReader();

  const handlePreferenceChange = (
    key: keyof UserPreferences,
    value: string | number
  ) => {
    dispatch({
      type: 'UPDATE_PREFERENCES',
      payload: { [key]: value },
    });
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-4">Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Font Size
          </label>
          <input
            type="range"
            min="12"
            max="32"
            step="1"
            value={state.preferences.fontSize}
            onChange={(e) =>
              handlePreferenceChange('fontSize', Number(e.target.value))
            }
            className="w-full"
          />
          <span className="text-sm text-gray-500">
            {state.preferences.fontSize}px
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Line Spacing
          </label>
          <input
            type="range"
            min="1"
            max="2"
            step="0.1"
            value={state.preferences.lineSpacing}
            onChange={(e) =>
              handlePreferenceChange('lineSpacing', Number(e.target.value))
            }
            className="w-full"
          />
          <span className="text-sm text-gray-500">
            {state.preferences.lineSpacing}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Font Family
          </label>
          <select
            value={state.preferences.fontFamily}
            onChange={(e) => handlePreferenceChange('fontFamily', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="system-ui">System Default</option>
            <option value="serif">Serif</option>
            <option value="sans-serif">Sans Serif</option>
            <option value="monospace">Monospace</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Paragraph Background
          </label>
          <input
            type="color"
            value={state.preferences.paragraphBackground}
            onChange={(e) =>
              handlePreferenceChange('paragraphBackground', e.target.value)
            }
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sentence Highlight
          </label>
          <input
            type="color"
            value={state.preferences.sentenceHighlight}
            onChange={(e) =>
              handlePreferenceChange('sentenceHighlight', e.target.value)
            }
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Word Highlight
          </label>
          <input
            type="color"
            value={state.preferences.wordHighlight}
            onChange={(e) =>
              handlePreferenceChange('wordHighlight', e.target.value)
            }
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Auto-scroll Speed (words per minute)
          </label>
          <input
            type="range"
            min="100"
            max="500"
            step="10"
            value={state.preferences.autoScrollSpeed}
            onChange={(e) =>
              handlePreferenceChange('autoScrollSpeed', Number(e.target.value))
            }
            className="w-full"
          />
          <span className="text-sm text-gray-500">
            {state.preferences.autoScrollSpeed} wpm
          </span>
        </div>
      </div>
    </div>
  );
};

export default Settings; 