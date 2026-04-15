import { ToolbarService, utils } from '@ohif/core';

import initToolGroups from './initToolGroups';
import toolbarButtons from './toolbarButtons';
import { id } from './id';

const { TOOLBAR_SECTIONS } = ToolbarService;
const { structuredCloneWithFunctions } = utils;

const NON_IMAGE_MODALITIES = ['SEG', 'RTSTRUCT', 'RTPLAN', 'PR', 'SR'];

const ohif = {
  layout: '@ohif/extension-dental.layoutTemplateModule.dentalLayout',
  sopClassHandler: '@ohif/extension-default.sopClassHandlerModule.stack',
  thumbnailList: '@ohif/extension-default.panelModule.seriesList',
};

const cornerstone = {
  measurements: '@ohif/extension-cornerstone.panelModule.panelMeasurement',
  viewport: '@ohif/extension-cornerstone.viewportModule.cornerstone',
};

const dental = {
  dentalMeasurements: '@ohif/extension-dental.panelModule.dentalMeasurements',
};

const dicomsr = {
  sopClassHandler: '@ohif/extension-cornerstone-dicom-sr.sopClassHandlerModule.dicom-sr',
  sopClassHandler3D: '@ohif/extension-cornerstone-dicom-sr.sopClassHandlerModule.dicom-sr-3d',
  viewport: '@ohif/extension-cornerstone-dicom-sr.viewportModule.dicom-sr',
};

const dicomvideo = {
  sopClassHandler: '@ohif/extension-dicom-video.sopClassHandlerModule.dicom-video',
  viewport: '@ohif/extension-dicom-video.viewportModule.dicom-video',
};

const dicomecg = {
  sopClassHandler: '@ohif/extension-cornerstone.sopClassHandlerModule.DicomEcgSopClassHandler',
};

const dicompdf = {
  sopClassHandler: '@ohif/extension-dicom-pdf.sopClassHandlerModule.dicom-pdf',
  viewport: '@ohif/extension-dicom-pdf.viewportModule.dicom-pdf',
};

const dicomSeg = {
  sopClassHandler: '@ohif/extension-cornerstone-dicom-seg.sopClassHandlerModule.dicom-seg',
  viewport: '@ohif/extension-cornerstone-dicom-seg.viewportModule.dicom-seg',
};

const dicomPmap = {
  sopClassHandler: '@ohif/extension-cornerstone-dicom-pmap.sopClassHandlerModule.dicom-pmap',
  viewport: '@ohif/extension-cornerstone-dicom-pmap.viewportModule.dicom-pmap',
};

const dicomRT = {
  viewport: '@ohif/extension-cornerstone-dicom-rt.viewportModule.dicom-rt',
  sopClassHandler: '@ohif/extension-cornerstone-dicom-rt.sopClassHandlerModule.dicom-rt',
};

const extensionDependencies = {
  '@ohif/extension-default': '^3.0.0',
  '@ohif/extension-cornerstone': '^3.0.0',
  '@ohif/extension-cornerstone-dicom-sr': '^3.0.0',
  '@ohif/extension-cornerstone-dicom-seg': '^3.0.0',
  '@ohif/extension-cornerstone-dicom-pmap': '^3.0.0',
  '@ohif/extension-cornerstone-dicom-rt': '^3.0.0',
  '@ohif/extension-dicom-pdf': '^3.0.1',
  '@ohif/extension-dicom-video': '^3.0.1',
  '@ohif/extension-dental': '^3.0.0',
};

const sopClassHandlers = [
  dicomvideo.sopClassHandler,
  dicomecg.sopClassHandler,
  dicomSeg.sopClassHandler,
  dicomPmap.sopClassHandler,
  ohif.sopClassHandler,
  dicompdf.sopClassHandler,
  dicomsr.sopClassHandler3D,
  dicomsr.sopClassHandler,
  dicomRT.sopClassHandler,
];

function isValidMode({ modalities }) {
  const modalities_list = modalities.split('\\');
  return {
    valid: !!modalities_list.find(modality => NON_IMAGE_MODALITIES.indexOf(modality) === -1),
    description: `Dental Mode supports imaging modalities`,
  };
}

function onModeEnter({
  servicesManager,
  extensionManager,
  commandsManager,
}: withAppTypes) {
  const { measurementService, toolbarService, toolGroupService, panelService } =
    servicesManager.services;

  measurementService.clearMeasurements();

  initToolGroups(extensionManager, toolGroupService, commandsManager);

  toolbarService.register(this.toolbarButtons);

  for (const [key, section] of Object.entries(this.toolbarSections)) {
    toolbarService.updateSection(key, section);
  }

  // Auto-activate the dental measurements panel when a measurement is added
  this._activatePanelTriggersSubscriptions = [
    ...panelService.addActivatePanelTriggers(
      dental.dentalMeasurements,
      [
        {
          sourcePubSubService: measurementService,
          sourceEvents: [
            measurementService.EVENTS.MEASUREMENT_ADDED,
            measurementService.EVENTS.RAW_MEASUREMENT_ADDED,
          ],
        },
      ],
      true
    ),
    true,
  ];
}

function onModeExit({ servicesManager }: withAppTypes) {
  const {
    toolGroupService,
    syncGroupService,
    segmentationService,
    cornerstoneViewportService,
    uiDialogService,
    uiModalService,
  } = servicesManager.services;

  this._activatePanelTriggersSubscriptions.forEach(sub => {
    if (sub && typeof sub.unsubscribe === 'function') {
      sub.unsubscribe();
    }
  });
  this._activatePanelTriggersSubscriptions.length = 0;

  uiDialogService.hideAll();
  uiModalService.hide();
  toolGroupService.destroy();
  syncGroupService.destroy();
  segmentationService.destroy();
  cornerstoneViewportService.destroy();
}

const toolbarSections = {
  [TOOLBAR_SECTIONS.primary]: [
    'DentalMeasurementTools',
    'Zoom',
    'Pan',
    'WindowLevel',
    'Capture',
    'Layout',
    'MoreTools',
  ],

  DentalMeasurementTools: [
    'Length',
    'Angle',
    'Bidirectional',
    'ArrowAnnotate',
    'EllipticalROI',
    'RectangleROI',
    'CircleROI',
  ],

  MoreTools: [
    'Reset',
    'rotate-right',
    'flipHorizontal',
    'invert',
    'Magnify',
    'CalibrationLine',
    'CobbAngle',
    'Probe',
    'TagBrowser',
  ],
};

const dentalLayout = {
  id: ohif.layout,
  props: {
    leftPanels: [ohif.thumbnailList],
    leftPanelResizable: true,
    rightPanels: [dental.dentalMeasurements, cornerstone.measurements],
    rightPanelClosed: false,
    rightPanelResizable: true,
    viewports: [
      {
        namespace: cornerstone.viewport,
        displaySetsToDisplay: [
          ohif.sopClassHandler,
          dicomvideo.sopClassHandler,
          dicomecg.sopClassHandler,
        ],
      },
      {
        namespace: dicomsr.viewport,
        displaySetsToDisplay: [dicomsr.sopClassHandler, dicomsr.sopClassHandler3D],
      },
      {
        namespace: dicompdf.viewport,
        displaySetsToDisplay: [dicompdf.sopClassHandler],
      },
      {
        namespace: dicomSeg.viewport,
        displaySetsToDisplay: [dicomSeg.sopClassHandler],
      },
      {
        namespace: dicomPmap.viewport,
        displaySetsToDisplay: [dicomPmap.sopClassHandler],
      },
      {
        namespace: dicomRT.viewport,
        displaySetsToDisplay: [dicomRT.sopClassHandler],
      },
    ],
  },
};

function layoutTemplate() {
  return structuredCloneWithFunctions(this.layoutInstance);
}

const dentalRoute = {
  path: 'dental',
  layoutTemplate,
  layoutInstance: dentalLayout,
};

const modeInstance = {
  id,
  routeName: 'dental',
  displayName: 'Dental Mode',
  hide: false,
  _activatePanelTriggersSubscriptions: [],
  toolbarSections,

  onModeEnter,
  onModeExit,
  validationTags: {
    study: [],
    series: [],
  },

  isValidMode,
  routes: [dentalRoute],
  extensions: extensionDependencies,
  hangingProtocol: '@ohif/hpDental2x2',
  sopClassHandlers,
  toolbarButtons,
  nonModeModalities: NON_IMAGE_MODALITIES,
};

function modeFactory({ modeConfiguration }) {
  return modeInstance;
}

const mode = {
  id,
  modeFactory,
  modeInstance,
  extensionDependencies,
};

export default mode;
export { initToolGroups, toolbarButtons };
