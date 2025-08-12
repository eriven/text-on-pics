'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Type, 
  X,
  Check,
  Trash2
} from 'lucide-react';

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  opacity: number;
  letterSpacing: number;
  strokeWidth: number;
  strokeColor: string;
}

interface TextEditingToolbarProps {
  selectedText: TextElement;
  onUpdateText: (id: string, updates: Partial<TextElement>) => void;
  onDeleteText: (id: string) => void;
  onClose: () => void;
}

const fontFamilies = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times, serif', label: 'Times' },
  { value: 'Courier, monospace', label: 'Courier' },
  { value: 'Impact, sans-serif', label: 'Impact' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
];

const colorPresets = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
  '#ffc0cb', '#a52a2a', '#808080', '#008000', '#000080'
];

const fontWeights = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Normal' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
  { value: '900', label: 'Black' },
];

export default function TextEditingToolbar({ 
  selectedText, 
  onUpdateText, 
  onDeleteText,
  onClose 
}: TextEditingToolbarProps) {
  const [activeTab, setActiveTab] = useState<'font' | 'color' | 'effects'>('font');
  const [customColor, setCustomColor] = useState(selectedText.color);
  const [customStrokeColor, setCustomStrokeColor] = useState(selectedText.strokeColor);
  const [textInput, setTextInput] = useState(selectedText.text);

  const handleUpdate = (updates: Partial<TextElement>) => {
    onUpdateText(selectedText.id, updates);
  };

  const handleTextSubmit = () => {
    handleUpdate({ text: textInput });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const handleDeleteText = () => {
    onDeleteText(selectedText.id);
    onClose();
  };

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-4xl w-full mx-4 z-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Type size={16} className="text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Text Editor
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteText}
            className="h-8 px-3"
          >
            <Trash2 size={14} className="mr-1" />
            Delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Text Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Text Content
        </label>
        <div className="flex flex-col gap-2">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={4}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter your text... (Press Ctrl+Enter to submit)"
          />
          <div className="flex justify-end">
            <Button onClick={handleTextSubmit} size="sm">
              <Check size={16} className="mr-1" />
              Apply
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('font')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'font'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Font & Size
        </button>
        <button
          onClick={() => setActiveTab('color')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'color'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Color & Opacity
        </button>
        <button
          onClick={() => setActiveTab('effects')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'effects'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Effects & Stroke
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Font & Size Tab */}
        {activeTab === 'font' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Family
                </label>
                <Select
                  value={selectedText.fontFamily}
                  onValueChange={(value) => handleUpdate({ fontFamily: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Font Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Weight
                </label>
                <Select
                  value={selectedText.fontWeight}
                  onValueChange={(value) => handleUpdate({ fontWeight: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select weight" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontWeights.map((weight) => (
                      <SelectItem key={weight.value} value={weight.value}>
                        {weight.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Size: {selectedText.fontSize}px
              </label>
              <Slider
                value={[selectedText.fontSize]}
                onValueChange={([value]) => handleUpdate({ fontSize: value })}
                min={12}
                max={120}
                step={1}
                className="w-full"
              />
            </div>

            {/* Letter Spacing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Letter Spacing: {selectedText.letterSpacing}px
              </label>
              <Slider
                value={[selectedText.letterSpacing]}
                onValueChange={([value]) => handleUpdate({ letterSpacing: value })}
                min={-5}
                max={20}
                step={0.5}
                className="w-full"
              />
            </div>
          </>
        )}

        {/* Color & Opacity Tab */}
        {activeTab === 'color' && (
          <>
            {/* Color Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color Presets
              </label>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleUpdate({ color })}
                    className={`w-12 h-12 rounded-lg border-2 ${
                      selectedText.color === color
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Custom Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-16 h-10 rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <Button
                  onClick={() => handleUpdate({ color: customColor })}
                  variant="outline"
                  size="sm"
                >
                  Apply
                </Button>
              </div>
            </div>

            {/* Opacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Opacity: {Math.round(selectedText.opacity * 100)}%
              </label>
              <Slider
                value={[selectedText.opacity]}
                onValueChange={([value]) => handleUpdate({ opacity: value })}
                min={0.1}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </>
        )}

        {/* Effects & Stroke Tab */}
        {activeTab === 'effects' && (
          <>
            {/* Stroke Width */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stroke Width: {selectedText.strokeWidth}px
              </label>
              <Slider
                value={[selectedText.strokeWidth]}
                onValueChange={([value]) => handleUpdate({ strokeWidth: value })}
                min={0}
                max={10}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Stroke Color */}
            {selectedText.strokeWidth > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stroke Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={customStrokeColor}
                    onChange={(e) => setCustomStrokeColor(e.target.value)}
                    className="w-16 h-10 rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <Button
                    onClick={() => handleUpdate({ strokeColor: customStrokeColor })}
                    variant="outline"
                    size="sm"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}