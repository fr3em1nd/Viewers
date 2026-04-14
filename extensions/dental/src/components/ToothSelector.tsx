import React, { useState, useCallback } from 'react';
import {
  getAllTeeth,
  getTeethByQuadrant,
  getToothLabel,
  type NumberingSystem,
  type ToothInfo,
} from '../utils/toothNumbering';

interface ToothSelectorProps {
  onToothSelect?: (tooth: ToothInfo | null) => void;
  selectedTooth?: ToothInfo | null;
}

const QUADRANT_LABELS = {
  'upper-right': 'UR',
  'upper-left': 'UL',
  'lower-left': 'LL',
  'lower-right': 'LR',
};

export default function ToothSelector({ onToothSelect, selectedTooth }: ToothSelectorProps) {
  const [numberingSystem, setNumberingSystem] = useState<NumberingSystem>('FDI');
  const [isOpen, setIsOpen] = useState(false);

  const handleToothClick = useCallback(
    (tooth: ToothInfo) => {
      const newSelection = selectedTooth?.fdi === tooth.fdi ? null : tooth;
      onToothSelect?.(newSelection);
    },
    [selectedTooth, onToothSelect]
  );

  const upperRight = getTeethByQuadrant('upper-right');
  const upperLeft = getTeethByQuadrant('upper-left');
  const lowerLeft = getTeethByQuadrant('lower-left');
  const lowerRight = getTeethByQuadrant('lower-right');

  const renderToothButton = (tooth: ToothInfo) => {
    const isSelected = selectedTooth?.fdi === tooth.fdi;
    const label = getToothLabel(tooth, numberingSystem);

    return (
      <button
        key={tooth.fdi}
        className="flex h-7 w-7 items-center justify-center rounded text-[10px] font-medium transition-all"
        style={{
          background: isSelected
            ? 'var(--dental-accent, #06B6D4)'
            : 'var(--dental-surface, #1E293B)',
          color: isSelected ? '#FFFFFF' : 'var(--dental-text-muted, #94A3B8)',
          border: `1px solid ${isSelected ? 'var(--dental-accent, #06B6D4)' : 'var(--dental-border, #334155)'}`,
        }}
        onClick={() => handleToothClick(tooth)}
        title={`${tooth.name} (FDI: ${tooth.fdi}, Universal: ${tooth.universal})`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors"
        style={{
          background: selectedTooth
            ? 'var(--dental-accent, #06B6D4)'
            : 'var(--dental-surface, #1E293B)',
          color: selectedTooth ? '#FFFFFF' : 'var(--dental-text-muted, #94A3B8)',
          border: '1px solid var(--dental-border, #334155)',
        }}
        onClick={() => setIsOpen(!isOpen)}
        title="Select tooth"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C9.5 2 7.5 3.5 7 5.5C6.5 7.5 5 9 4 10.5C3 12 2.5 14 3 16C3.5 18 5 19.5 7 20C8.5 20.4 9.5 19.5 10 18C10.5 16.5 11 15 12 15C13 15 13.5 16.5 14 18C14.5 19.5 15.5 20.4 17 20C19 19.5 20.5 18 21 16C21.5 14 21 12 20 10.5C19 9 17.5 7.5 17 5.5C16.5 3.5 14.5 2 12 2Z" />
        </svg>
        {selectedTooth
          ? `#${getToothLabel(selectedTooth, numberingSystem)} ${selectedTooth.name}`
          : 'Tooth'}
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full z-50 mt-1 rounded-lg p-3 shadow-xl"
          style={{
            background: 'var(--dental-bg, #0F172A)',
            border: '1px solid var(--dental-border, #334155)',
            minWidth: '320px',
          }}
        >
          {/* Numbering system toggle */}
          <div className="mb-2 flex items-center justify-between">
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--dental-text-muted, #94A3B8)' }}
            >
              Numbering:
            </span>
            <div className="flex gap-1">
              {(['FDI', 'Universal'] as NumberingSystem[]).map(sys => (
                <button
                  key={sys}
                  className="rounded px-2 py-0.5 text-[10px] font-medium transition-colors"
                  style={{
                    background:
                      numberingSystem === sys
                        ? 'var(--dental-accent, #06B6D4)'
                        : 'var(--dental-surface, #1E293B)',
                    color: numberingSystem === sys ? '#FFFFFF' : 'var(--dental-text-muted, #94A3B8)',
                  }}
                  onClick={() => setNumberingSystem(sys)}
                >
                  {sys}
                </button>
              ))}
            </div>
          </div>

          {/* Dental chart grid */}
          <div className="space-y-1">
            {/* Upper jaw */}
            <div className="flex gap-px">
              <div className="flex flex-row-reverse gap-px">
                {upperRight.map(renderToothButton)}
              </div>
              <div
                className="mx-1 w-px self-stretch"
                style={{ background: 'var(--dental-border, #334155)' }}
              />
              <div className="flex gap-px">{upperLeft.map(renderToothButton)}</div>
            </div>

            {/* Midline */}
            <div className="h-px" style={{ background: 'var(--dental-border, #334155)' }} />

            {/* Lower jaw */}
            <div className="flex gap-px">
              <div className="flex flex-row-reverse gap-px">
                {lowerRight.map(renderToothButton)}
              </div>
              <div
                className="mx-1 w-px self-stretch"
                style={{ background: 'var(--dental-border, #334155)' }}
              />
              <div className="flex gap-px">{lowerLeft.map(renderToothButton)}</div>
            </div>
          </div>

          {/* Selected tooth info */}
          {selectedTooth && (
            <div
              className="mt-2 rounded p-1.5 text-xs"
              style={{
                background: 'var(--dental-surface, #1E293B)',
                color: 'var(--dental-text, #F1F5F9)',
              }}
            >
              <strong>{selectedTooth.name}</strong> — FDI: {selectedTooth.fdi} | Universal:{' '}
              {selectedTooth.universal}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
