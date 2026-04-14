import React, { useState, useEffect } from 'react';
import DentalThemeToggle from './DentalThemeToggle';
import ToothSelector from './ToothSelector';
import type { ToothInfo } from '../utils/toothNumbering';

interface PracticeHeaderProps {
  servicesManager: AppTypes.ServicesManager;
}

export default function PracticeHeader({ servicesManager }: PracticeHeaderProps) {
  const [patientInfo, setPatientInfo] = useState({
    patientName: '',
    patientId: '',
    studyDate: '',
    modality: '',
  });
  const [selectedTooth, setSelectedTooth] = useState<ToothInfo | null>(null);

  useEffect(() => {
    const { displaySetService } = servicesManager.services;

    const updatePatientInfo = () => {
      const displaySets = displaySetService.getActiveDisplaySets();
      if (displaySets.length > 0) {
        const ds = displaySets[0];
        setPatientInfo({
          patientName: ds.PatientName
            ? typeof ds.PatientName === 'object'
              ? ds.PatientName.Alphabetic || ''
              : ds.PatientName
            : '',
          patientId: ds.PatientID || '',
          studyDate: ds.StudyDate || '',
          modality: ds.Modality || '',
        });
      }
    };

    updatePatientInfo();

    const { unsubscribe } = displaySetService.subscribe(
      displaySetService.EVENTS.DISPLAY_SETS_CHANGED,
      updatePatientInfo
    );

    return () => unsubscribe();
  }, [servicesManager]);

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  };

  return (
    <div
      className="flex w-full items-center justify-between px-3 py-1.5"
      style={{
        background:
          'linear-gradient(135deg, var(--dental-bg, #0F172A) 0%, var(--dental-surface, #1E293B) 100%)',
        borderBottom: '1px solid var(--dental-border, #334155)',
      }}
    >
      {/* Left: Practice Name & Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: 'var(--dental-accent, #06B6D4)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF">
              <path d="M12 2C9.5 2 7.5 3.5 7 5.5C6.5 7.5 5 9 4 10.5C3 12 2.5 14 3 16C3.5 18 5 19.5 7 20C8.5 20.4 9.5 19.5 10 18C10.5 16.5 11 15 12 15C13 15 13.5 16.5 14 18C14.5 19.5 15.5 20.4 17 20C19 19.5 20.5 18 21 16C21.5 14 21 12 20 10.5C19 9 17.5 7.5 17 5.5C16.5 3.5 14.5 2 12 2Z" />
            </svg>
          </div>
          <div>
            <div
              className="text-sm font-bold tracking-wide"
              style={{ color: 'var(--dental-text, #F1F5F9)' }}
            >
              DentalView Pro
            </div>
            <div className="text-[10px]" style={{ color: 'var(--dental-text-muted, #94A3B8)' }}>
              Dental Imaging Platform
            </div>
          </div>
        </div>
      </div>

      {/* Center: Patient Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--dental-text-muted, #94A3B8)"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-xs font-medium" style={{ color: 'var(--dental-text, #F1F5F9)' }}>
              {patientInfo.patientName || 'No Patient'}
            </span>
          </div>

          {patientInfo.patientId && (
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                background: 'var(--dental-surface, #1E293B)',
                color: 'var(--dental-text-muted, #94A3B8)',
                border: '1px solid var(--dental-border, #334155)',
              }}
            >
              ID: {patientInfo.patientId}
            </span>
          )}

          {patientInfo.studyDate && (
            <span className="text-[10px]" style={{ color: 'var(--dental-text-muted, #94A3B8)' }}>
              {formatDate(patientInfo.studyDate)}
            </span>
          )}

          {patientInfo.modality && (
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold"
              style={{
                background: 'var(--dental-accent, #06B6D4)',
                color: '#FFFFFF',
              }}
            >
              {patientInfo.modality}
            </span>
          )}
        </div>

        {/* Tooth Selector */}
        <ToothSelector selectedTooth={selectedTooth} onToothSelect={setSelectedTooth} />
      </div>

      {/* Right: Theme Toggle */}
      <div className="flex items-center gap-2">
        <DentalThemeToggle />
      </div>
    </div>
  );
}
