/**
 * Dental 2x2 Hanging Protocol
 *
 * Layout:
 *   Top-left:     Current image
 *   Top-right:    Prior exam (same modality)
 *   Bottom-left:  Bitewing placeholder (left)
 *   Bottom-right: Bitewing placeholder (right)
 */
const currentDisplaySetSelector = {
  studyMatchingRules: [
    {
      attribute: 'studyInstanceUIDsIndex',
      from: 'options',
      required: true,
      constraint: {
        equals: { value: 0 },
      },
    },
  ],
  seriesMatchingRules: [
    {
      attribute: 'numImageFrames',
      constraint: {
        greaterThan: { value: 0 },
      },
    },
    {
      attribute: 'isDisplaySetFromUrl',
      weight: 20,
      constraint: {
        equals: true,
      },
    },
  ],
};

const priorDisplaySetSelector = {
  studyMatchingRules: [
    {
      attribute: 'studyInstanceUIDsIndex',
      from: 'options',
      required: true,
      constraint: {
        equals: { value: 1 },
      },
    },
  ],
  seriesMatchingRules: [
    {
      attribute: 'numImageFrames',
      constraint: {
        greaterThan: { value: 0 },
      },
    },
  ],
};

const bitewingDisplaySetSelector = {
  studyMatchingRules: [
    {
      attribute: 'studyInstanceUIDsIndex',
      from: 'options',
      required: false,
      constraint: {
        equals: { value: 0 },
      },
    },
  ],
  seriesMatchingRules: [
    {
      attribute: 'numImageFrames',
      constraint: {
        greaterThan: { value: 0 },
      },
    },
    {
      attribute: 'SeriesDescription',
      weight: 100,
      constraint: {
        containsI: 'bitewing',
      },
    },
  ],
};

const currentViewport = {
  viewportOptions: {
    toolGroupId: 'default',
    allowUnmatchedView: true,
    customViewportProps: {
      label: 'Current',
    },
  },
  displaySets: [
    {
      id: 'currentDisplaySetId',
    },
  ],
};

const priorViewport = {
  viewportOptions: {
    toolGroupId: 'default',
    allowUnmatchedView: true,
    customViewportProps: {
      label: 'Prior',
    },
  },
  displaySets: [
    {
      id: 'priorDisplaySetId',
    },
  ],
};

const bitewingLeftViewport = {
  viewportOptions: {
    toolGroupId: 'default',
    allowUnmatchedView: true,
    customViewportProps: {
      label: 'BW Left',
    },
  },
  displaySets: [
    {
      id: 'bitewingDisplaySetId',
      matchedDisplaySetsIndex: 0,
    },
  ],
};

const bitewingRightViewport = {
  viewportOptions: {
    toolGroupId: 'default',
    allowUnmatchedView: true,
    customViewportProps: {
      label: 'BW Right',
    },
  },
  displaySets: [
    {
      id: 'bitewingDisplaySetId',
      matchedDisplaySetsIndex: 1,
    },
  ],
};

const hpDental2x2 = {
  id: '@ohif/hpDental2x2',
  description: 'Dental 2x2: Current, Prior, and Bitewing placeholders',
  name: 'Dental 2x2',
  numberOfPriorsReferenced: 1,
  protocolMatchingRules: [],
  toolGroupIds: ['default'],
  displaySetSelectors: {
    currentDisplaySetId: currentDisplaySetSelector,
    priorDisplaySetId: priorDisplaySetSelector,
    bitewingDisplaySetId: bitewingDisplaySetSelector,
  },
  defaultViewport: {
    viewportOptions: {
      viewportType: 'stack',
      toolGroupId: 'default',
      allowUnmatchedView: true,
    },
    displaySets: [
      {
        id: 'currentDisplaySetId',
        matchedDisplaySetsIndex: -1,
      },
    ],
  },
  stages: [
    {
      name: 'dental2x2',
      stageActivation: {
        enabled: {
          minViewportsMatched: 1,
        },
      },
      viewportStructure: {
        layoutType: 'grid',
        properties: {
          rows: 2,
          columns: 2,
          layoutOptions: [
            {
              x: 0,
              y: 0,
              width: 1 / 2,
              height: 1 / 2,
            },
            {
              x: 1 / 2,
              y: 0,
              width: 1 / 2,
              height: 1 / 2,
            },
            {
              x: 0,
              y: 1 / 2,
              width: 1 / 2,
              height: 1 / 2,
            },
            {
              x: 1 / 2,
              y: 1 / 2,
              width: 1 / 2,
              height: 1 / 2,
            },
          ],
        },
      },
      viewports: [currentViewport, priorViewport, bitewingLeftViewport, bitewingRightViewport],
    },
  ],
};

export default hpDental2x2;
