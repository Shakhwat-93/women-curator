import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { track } from './tracker';

export const RouteTracker: React.FC = () => {
  const location = useLocation();
  const isFirstMount = useRef(true);
  const lastPath = useRef('');

  useEffect(() => {
    // Initialize central tracker on startup
    if (isFirstMount.current) {
      track.init();
      isFirstMount.current = false;
    }

    const currentPath = location.pathname + location.search;
    if (lastPath.current !== currentPath) {
      lastPath.current = currentPath;
      // Do not track internal admin paths in customer marketing pixels
      if (!location.pathname.startsWith('/admin')) {
        track.pageView(location.pathname, document.title);
      }
    }
  }, [location]);

  return null;
};
