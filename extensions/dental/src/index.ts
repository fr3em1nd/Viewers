import { id } from './id';
import React from 'react';

import PracticeHeader from './components/PracticeHeader';
import DentalMeasurementsPanel from './panels/DentalMeasurementsPanel';
import hpDental2x2 from './hangingprotocols/hpDental2x2';

const dentalExtension = {
  id,

  getPanelModule({ servicesManager, commandsManager, extensionManager }) {
    return [
      {
        name: 'dentalMeasurements',
        iconName: 'tab-linear',
        iconLabel: 'Measurements',
        label: 'Dental Measurements',
        component: props =>
          React.createElement(DentalMeasurementsPanel, {
            ...props,
            servicesManager,
            commandsManager,
            extensionManager,
          }),
      },
    ];
  },

  getHangingProtocolModule() {
    return [
      {
        name: hpDental2x2.id,
        protocol: hpDental2x2,
      },
    ];
  },

  getViewportModule() {
    return [];
  },

  getCustomizationModule() {
    return [
      {
        name: 'dentalPracticeHeader',
        value: {
          id: 'dental.practiceHeader',
          component: PracticeHeader,
        },
      },
    ];
  },

  getCommandsModule({ servicesManager, commandsManager }) {
    return {
      definitions: {
        exportDentalMeasurementsJSON: {
          commandFn: () => {
            const { measurementService } = servicesManager.services;
            const measurements = measurementService.getMeasurements();

            const exportData = {
              exportDate: new Date().toISOString(),
              measurementCount: measurements.length,
              measurements: measurements.map(m => ({
                uid: m.uid,
                label: m.label || m.toolName,
                toolName: m.toolName,
                displayText: m.displayText,
                referenceSeriesUID: m.referenceSeriesUID,
                SOPInstanceUID: m.SOPInstanceUID,
              })),
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
              type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `dental-measurements-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          },
        },
      },
      defaultContext: 'VIEWER',
    };
  },
};

export default dentalExtension;
