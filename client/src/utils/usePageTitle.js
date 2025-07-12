import { useEffect } from 'react';

/**
 * Hook to set the page title
 * @param {string} title - The page title to set
 * @param {boolean} includeAppName - Whether to include "MetaMeal | " before the title
 */
export const usePageTitle = (title, includeAppName = true) => {
  useEffect(() => {
    // Previous title
    const prevTitle = document.title;
    
    // Set the new title
    document.title = includeAppName ? `MetaMeal | ${title}` : title;
    
    // Cleanup function to restore previous title if needed
    return () => {
      document.title = prevTitle;
    };
  }, [title, includeAppName]);
};

export default usePageTitle;
