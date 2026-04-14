/** @type {AppTypes.Config} */

window.config = {
  name: 'config/dental.js',
  routerBasename: null,
  extensions: [],
  modes: [],
  customizationService: {},
  showStudyList: true,
  maxNumberOfWebWorkers: 3,
  showWarningMessageForCrossOrigin: true,
  showCPUFallbackMessage: true,
  showLoadingIndicator: true,
  strictZSpacingForVolumeViewport: true,
  groupEnabledModesFirst: true,
  showPatientInfo: 'visible',
  maxNumRequests: {
    interaction: 100,
    thumbnail: 75,
    prefetch: 25,
  },
  showErrorDetails: 'always',
  whiteLabeling: {
    createLogoComponentFn: function (React) {
      return React.createElement(
        'a',
        {
          target: '_self',
          rel: 'noopener noreferrer',
          className: 'text-cyan-400 font-bold flex items-center gap-2',
          href: '/',
        },
        React.createElement(
          'span',
          { className: 'text-sm tracking-wide' },
          'DentalView Pro'
        )
      );
    },
  },
  defaultDataSourceName: 'ohif',
  dataSources: [
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'ohif',
      configuration: {
        friendlyName: 'AWS S3 Static wado server',
        name: 'aws',
        wadoUriRoot: 'https://d14fa38qiwhyfd.cloudfront.net/dicomweb',
        qidoRoot: 'https://d14fa38qiwhyfd.cloudfront.net/dicomweb',
        wadoRoot: 'https://d14fa38qiwhyfd.cloudfront.net/dicomweb',
        qidoSupportsIncludeField: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: true,
        supportsWildcard: false,
        staticWado: true,
        singlepart: 'bulkdata,video',
        bulkDataURI: {
          enabled: true,
          relativeResolution: 'studies',
          transform: function (url) {
            return url.replace('/pixeldata.mp4', '/rendered');
          },
        },
        omitQuotationForMultipartRequest: true,
      },
    },
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomlocal',
      sourceName: 'dicomlocal',
      configuration: {
        friendlyName: 'Local DICOM Files',
      },
    },
  ],
  httpErrorHandler: function (error) {
    console.warn(error.status);
  },
};
