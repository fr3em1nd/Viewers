import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface DentalMeasurement {
  uid: string;
  label: string;
  type: 'distance' | 'angle';
  toolName: string;
  value: number | null;
  unit: string;
  toothNumber?: string;
  timestamp: number;
  seriesInstanceUID?: string;
  sopInstanceUID?: string;
}

interface MeasurementPreset {
  id: string;
  label: string;
  type: 'distance' | 'angle';
  toolName: string;
  unit: string;
  icon: string;
  color: string;
}

const MEASUREMENT_PRESETS: MeasurementPreset[] = [
  {
    id: 'pa-length',
    label: 'PA Length',
    type: 'distance',
    toolName: 'Length',
    unit: 'mm',
    icon: '📏',
    color: '#06B6D4',
  },
  {
    id: 'canal-angle',
    label: 'Canal Angle',
    type: 'angle',
    toolName: 'Angle',
    unit: '°',
    icon: '📐',
    color: '#F59E0B',
  },
  {
    id: 'crown-width',
    label: 'Crown Width',
    type: 'distance',
    toolName: 'Length',
    unit: 'mm',
    icon: '↔',
    color: '#10B981',
  },
  {
    id: 'root-length',
    label: 'Root Length',
    type: 'distance',
    toolName: 'Length',
    unit: 'mm',
    icon: '↕',
    color: '#8B5CF6',
  },
  {
    id: 'bone-level',
    label: 'Bone Level',
    type: 'distance',
    toolName: 'Length',
    unit: 'mm',
    icon: '🦴',
    color: '#EF4444',
  },
  {
    id: 'implant-length',
    label: 'Implant Length',
    type: 'distance',
    toolName: 'Length',
    unit: 'mm',
    icon: '🔩',
    color: '#EC4899',
  },
];

type SortField = 'label' | 'value' | 'timestamp' | 'type';
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | 'distance' | 'angle';

interface DentalMeasurementsPanelProps {
  servicesManager: AppTypes.ServicesManager;
  commandsManager: AppTypes.CommandsManager;
  extensionManager: AppTypes.ExtensionManager;
}

export default function DentalMeasurementsPanel({
  servicesManager,
  commandsManager,
}: DentalMeasurementsPanelProps) {
  const [measurements, setMeasurements] = useState<DentalMeasurement[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const { measurementService } = servicesManager.services;

  // Sync measurements from OHIF MeasurementService
  const syncMeasurements = useCallback(() => {
    const ohifMeasurements = measurementService.getMeasurements();
    const dentalMeasurements: DentalMeasurement[] = ohifMeasurements.map(m => {
      const existingDental = measurements.find(dm => dm.uid === m.uid);
      const label = m.label || existingDental?.label || m.toolName || 'Measurement';

      let value: number | null = null;
      if (m.displayText && m.displayText.length > 0) {
        const firstText = Array.isArray(m.displayText[0])
          ? m.displayText[0][0]?.value
          : m.displayText[0];
        if (typeof firstText === 'string') {
          const numMatch = firstText.match(/([\d.]+)/);
          if (numMatch) {
            value = parseFloat(numMatch[1]);
          }
        }
      }

      return {
        uid: m.uid,
        label,
        type:
          m.toolName === 'Angle' || m.toolName === 'CobbAngle'
            ? ('angle' as const)
            : ('distance' as const),
        toolName: m.toolName || 'Length',
        value,
        unit:
          m.toolName === 'Angle' || m.toolName === 'CobbAngle'
            ? '°'
            : existingDental?.unit || 'mm',
        toothNumber: existingDental?.toothNumber,
        timestamp: existingDental?.timestamp || Date.now(),
        seriesInstanceUID: m.referenceSeriesUID,
        sopInstanceUID: m.SOPInstanceUID,
      };
    });

    setMeasurements(dentalMeasurements);
  }, [measurementService]);

  useEffect(() => {
    syncMeasurements();

    const subscriptions = [
      measurementService.subscribe(measurementService.EVENTS.MEASUREMENT_ADDED, syncMeasurements),
      measurementService.subscribe(
        measurementService.EVENTS.MEASUREMENT_UPDATED,
        syncMeasurements
      ),
      measurementService.subscribe(
        measurementService.EVENTS.MEASUREMENT_REMOVED,
        syncMeasurements
      ),
      measurementService.subscribe(
        measurementService.EVENTS.MEASUREMENTS_CLEARED,
        syncMeasurements
      ),
      measurementService.subscribe(
        measurementService.EVENTS.RAW_MEASUREMENT_ADDED,
        syncMeasurements
      ),
    ];

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [measurementService, syncMeasurements]);

  // Activate a measurement preset tool
  const activatePreset = useCallback(
    (preset: MeasurementPreset) => {
      setActivePreset(preset.id);

      // Activate the appropriate cornerstone tool
      commandsManager.run('setToolActiveToolbar', {
        toolName: preset.toolName,
        toolGroupIds: ['default', 'mpr', 'SRToolGroup'],
      });
    },
    [commandsManager]
  );

  // Sort & filter measurements
  const filteredAndSorted = useMemo(() => {
    let result = [...measurements];

    if (filterType !== 'all') {
      result = result.filter(m => m.type === filterType);
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'label':
          comparison = a.label.localeCompare(b.label);
          break;
        case 'value':
          comparison = (a.value ?? 0) - (b.value ?? 0);
          break;
        case 'timestamp':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [measurements, filterType, sortField, sortDirection]);

  // Export measurements as JSON
  const exportJSON = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      patientId: measurements[0]?.sopInstanceUID ? 'from-study' : 'unknown',
      measurementCount: measurements.length,
      measurements: measurements.map(m => ({
        label: m.label,
        type: m.type,
        value: m.value,
        unit: m.unit,
        toothNumber: m.toothNumber || null,
        toolName: m.toolName,
        timestamp: new Date(m.timestamp).toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dental-measurements-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [measurements]);

  // Delete a measurement
  const deleteMeasurement = useCallback(
    (uid: string) => {
      measurementService.remove(uid);
    },
    [measurementService]
  );

  // Jump to measurement
  const jumpToMeasurement = useCallback(
    (uid: string) => {
      commandsManager.run('jumpToMeasurement', { uid });
    },
    [commandsManager]
  );

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div
      className="flex h-full flex-col"
      style={{
        background: 'var(--dental-bg, #0F172A)',
        color: 'var(--dental-text, #F1F5F9)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-3 py-2"
        style={{ borderColor: 'var(--dental-border, #334155)' }}
      >
        <h3 className="text-sm font-bold">Dental Measurements</h3>
        <div className="flex gap-1">
          <button
            className="rounded p-1 text-xs transition-colors hover:opacity-80"
            style={{
              background: paletteOpen
                ? 'var(--dental-accent, #06B6D4)'
                : 'var(--dental-surface, #1E293B)',
              color: paletteOpen ? '#FFFFFF' : 'var(--dental-text-muted, #94A3B8)',
            }}
            onClick={() => setPaletteOpen(!paletteOpen)}
            title="Toggle measurement palette"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4H6v-2h4V7h2v4h4v2h-4v4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Measurement Presets Palette */}
      {paletteOpen && (
        <div
          className="border-b px-3 py-2"
          style={{ borderColor: 'var(--dental-border, #334155)' }}
        >
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--dental-text-muted, #94A3B8)' }}>
            One-Click Presets
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {MEASUREMENT_PRESETS.map(preset => (
              <button
                key={preset.id}
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs font-medium transition-all hover:opacity-90"
                style={{
                  background:
                    activePreset === preset.id
                      ? preset.color
                      : 'var(--dental-surface, #1E293B)',
                  color: activePreset === preset.id ? '#FFFFFF' : 'var(--dental-text, #F1F5F9)',
                  border: `1px solid ${activePreset === preset.id ? preset.color : 'var(--dental-border, #334155)'}`,
                }}
                onClick={() => activatePreset(preset)}
              >
                <span>{preset.icon}</span>
                <div>
                  <div className="leading-tight">{preset.label}</div>
                  <div
                    className="text-[9px] opacity-70"
                    style={{
                      color:
                        activePreset === preset.id
                          ? '#FFFFFF'
                          : 'var(--dental-text-muted, #94A3B8)',
                    }}
                  >
                    {preset.type === 'distance' ? 'Distance' : 'Angle'} ({preset.unit})
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Sort Controls */}
      <div
        className="flex items-center justify-between border-b px-3 py-1.5"
        style={{ borderColor: 'var(--dental-border, #334155)' }}
      >
        <div className="flex gap-1">
          {(['all', 'distance', 'angle'] as FilterType[]).map(type => (
            <button
              key={type}
              className="rounded px-2 py-0.5 text-[10px] font-medium transition-colors"
              style={{
                background:
                  filterType === type
                    ? 'var(--dental-accent, #06B6D4)'
                    : 'var(--dental-surface, #1E293B)',
                color: filterType === type ? '#FFFFFF' : 'var(--dental-text-muted, #94A3B8)',
              }}
              onClick={() => setFilterType(type)}
            >
              {type === 'all' ? 'All' : type === 'distance' ? 'Length' : 'Angle'}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          {(['label', 'value', 'timestamp'] as SortField[]).map(field => (
            <button
              key={field}
              className="rounded px-1.5 py-0.5 text-[10px] transition-colors"
              style={{
                background:
                  sortField === field
                    ? 'var(--dental-accent, #06B6D4)'
                    : 'var(--dental-surface, #1E293B)',
                color: sortField === field ? '#FFFFFF' : 'var(--dental-text-muted, #94A3B8)',
              }}
              onClick={() => toggleSort(field)}
              title={`Sort by ${field}`}
            >
              {field === 'label' ? 'A-Z' : field === 'value' ? '#' : '🕐'}
              {sortField === field && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </button>
          ))}
        </div>
      </div>

      {/* Measurements List */}
      <div className="flex-1 overflow-y-auto">
        {filteredAndSorted.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center p-6 text-center"
            style={{ color: 'var(--dental-text-muted, #94A3B8)' }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4H6v-2h4V7h2v4h4v2h-4v4z" />
            </svg>
            <p className="mt-2 text-xs">No measurements yet</p>
            <p className="text-[10px]">Use the presets above to start measuring</p>
          </div>
        ) : (
          <div className="space-y-px p-1">
            {filteredAndSorted.map(measurement => {
              const preset = MEASUREMENT_PRESETS.find(p => p.label === measurement.label);
              const color = preset?.color || '#06B6D4';

              return (
                <div
                  key={measurement.uid}
                  className="group flex items-center justify-between rounded-md px-2 py-1.5 transition-colors"
                  style={{
                    background: 'var(--dental-surface, #1E293B)',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = color;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                  }}
                >
                  <div
                    className="flex cursor-pointer items-center gap-2"
                    onClick={() => jumpToMeasurement(measurement.uid)}
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ background: color }}
                    />
                    <div>
                      <div className="text-xs font-medium" style={{ color: 'var(--dental-text, #F1F5F9)' }}>
                        {measurement.label}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--dental-text-muted, #94A3B8)' }}>
                        {measurement.type === 'distance' ? 'Distance' : 'Angle'}
                        {measurement.toothNumber && ` • Tooth #${measurement.toothNumber}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="rounded px-1.5 py-0.5 text-xs font-bold tabular-nums"
                      style={{
                        background: `${color}20`,
                        color: color,
                      }}
                    >
                      {measurement.value !== null
                        ? `${measurement.value.toFixed(1)} ${measurement.unit}`
                        : '—'}
                    </span>
                    <button
                      className="rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ color: '#EF4444' }}
                      onClick={() => deleteMeasurement(measurement.uid)}
                      title="Delete measurement"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer: Export & Count */}
      <div
        className="flex items-center justify-between border-t px-3 py-2"
        style={{ borderColor: 'var(--dental-border, #334155)' }}
      >
        <span className="text-[10px]" style={{ color: 'var(--dental-text-muted, #94A3B8)' }}>
          {filteredAndSorted.length} measurement{filteredAndSorted.length !== 1 ? 's' : ''}
        </span>
        <button
          className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors hover:opacity-90 disabled:opacity-40"
          style={{
            background: 'var(--dental-success, #10B981)',
            color: '#FFFFFF',
          }}
          onClick={exportJSON}
          disabled={measurements.length === 0}
          title="Export all measurements as JSON"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
          Export JSON
        </button>
      </div>
    </div>
  );
}
