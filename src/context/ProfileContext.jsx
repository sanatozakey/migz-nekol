import React, { createContext, useContext, useState } from 'react';

const ProfileContext = createContext();

const STORAGE_KEY = 'lablab_active_profile_v1';

export function ProfileProvider({ children }) {
  // Default to Nekol if not set, but remember whoever was selected on this phone
  const [activeProfile, setActiveProfileState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return (saved === 'Migz' || saved === 'Nekol') ? saved : 'Nekol';
    } catch {
      return 'Nekol';
    }
  });

  const setActiveProfile = (profile) => {
    const valid = profile === 'Migz' ? 'Migz' : 'Nekol';
    setActiveProfileState(valid);
    try {
      localStorage.setItem(STORAGE_KEY, valid);
    } catch (e) {
      console.warn('Profile save notice:', e);
    }
  };

  const toggleProfile = () => {
    setActiveProfile(activeProfile === 'Migz' ? 'Nekol' : 'Migz');
  };

  const isMigz = activeProfile === 'Migz';
  const isNekol = activeProfile === 'Nekol';
  const partnerName = isMigz ? 'Nekol' : 'Migz';
  const myEmoji = isMigz ? '🐧' : '🖤';
  const partnerEmoji = isMigz ? '🖤' : '🐧';

  return (
    <ProfileContext.Provider value={{
      activeProfile,
      setActiveProfile,
      toggleProfile,
      isMigz,
      isNekol,
      partnerName,
      myEmoji,
      partnerEmoji
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
