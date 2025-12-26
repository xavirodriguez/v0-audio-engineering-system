"use client"

import { createContext, useContext, useState, useMemo } from 'react';

interface UIStateContextType {
  isSettingsPanelVisible: boolean;
  toggleSettingsPanel: () => void;
  activeModal: string | null;
  openModal: (modalId: string | null) => void;
  closeModal: () => void;
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

export function UIStateProvider({ children }: { children: React.ReactNode }) {
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const toggleSettingsPanel = () => {
    setIsSettingsPanelVisible((prev) => !prev);
  };

  const openModal = (modalId: string | null) => {
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const value = useMemo(() => ({
    isSettingsPanelVisible,
    toggleSettingsPanel,
    activeModal,
    openModal,
    closeModal,
  }), [isSettingsPanelVisible, activeModal]);

  return (
    <UIStateContext.Provider value={value}>
      {children}
    </UIStateContext.Provider>
  );
}

export function useUIStateContext() {
  const context = useContext(UIStateContext);
  if (context === undefined) {
    throw new Error('useUIStateContext must be used within a UIStateProvider');
  }
  return context;
}
