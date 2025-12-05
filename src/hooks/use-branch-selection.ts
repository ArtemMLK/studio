'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

// Define the shape of the context
interface BranchSelectionContextType {
  selectedBranchId: string;
  setSelectedBranchId: (branchId: string) => void;
}

// Create the context with a default undefined value
const BranchSelectionContext = createContext<BranchSelectionContextType | undefined>(undefined);

// Define the props for the provider component
interface BranchSelectionProviderProps {
  children: ReactNode;
}

// Create the provider component
export function BranchSelectionProvider({ children }: BranchSelectionProviderProps) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');

  const value = useMemo(() => ({
    selectedBranchId,
    setSelectedBranchId,
  }), [selectedBranchId]);

  return (
    <BranchSelectionContext.Provider value={value}>
      {children}
    </BranchSelectionContext.Provider>
  );
}

// Create the custom hook to use the context
export function useBranchSelection() {
  const context = useContext(BranchSelectionContext);
  if (context === undefined) {
    throw new Error('useBranchSelection must be used within a BranchSelectionProvider');
  }
  return context;
}
