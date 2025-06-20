import React from 'react';

// Simple Layout component that wraps children and can include shared UI (e.g., navbar)
export default function Layout({ children, isPublic }) {
  return (
    <div>
      {/* You can add a Navbar or Sidebar here if needed */}
      {children}
    </div>
  );
}
