import React, { useRef, useState, useEffect } from 'react';
import PracticeHeader from '../components/PracticeHeader';

/**
 * Dental Viewer Layout
 *
 * Wraps the default OHIF ViewerLayout and injects the PracticeHeader
 * (with practice name, patient info, tooth selector, theme toggle)
 * above it. Adjusts the viewport height to account for the extra header.
 */
function DentalViewerLayout({
  extensionManager,
  servicesManager,
  hotkeysManager,
  commandsManager,
  ...layoutProps
}) {
  const practiceHeaderRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(38);

  // Measure the PracticeHeader height so we can offset the inner layout
  useEffect(() => {
    if (practiceHeaderRef.current) {
      const height = practiceHeaderRef.current.getBoundingClientRect().height;
      setHeaderHeight(height);
    }
  }, []);

  // Get the default ViewerLayout component
  const defaultLayoutEntry = extensionManager.getModuleEntry(
    '@ohif/extension-default.layoutTemplateModule.viewerLayout'
  );

  if (!defaultLayoutEntry || !defaultLayoutEntry.component) {
    return React.createElement('div', null, 'Error: Default layout template not found');
  }

  const DefaultViewerLayout = defaultLayoutEntry.component;

  return React.createElement(
    'div',
    { style: { width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' } },

    // PracticeHeader at the very top
    React.createElement(
      'div',
      { ref: practiceHeaderRef },
      React.createElement(PracticeHeader, { servicesManager })
    ),

    // Default OHIF layout below, with adjusted height
    React.createElement(
      'div',
      {
        style: {
          flex: 1,
          overflow: 'hidden',
          // Override the default layout's inner 100vh - 52px calc
          // by using CSS custom property that child can't override
        },
        className: 'dental-layout-inner',
      },
      React.createElement(DefaultViewerLayout, {
        extensionManager,
        servicesManager,
        hotkeysManager,
        commandsManager,
        ...layoutProps,
      })
    ),

    // Inject a <style> to override the default layout's hardcoded height
    React.createElement('style', null, `
      .dental-layout-inner > div > div[style*="calc(100vh"] {
        height: calc(100vh - 52px - ${headerHeight}px) !important;
      }
    `)
  );
}

export default DentalViewerLayout;
