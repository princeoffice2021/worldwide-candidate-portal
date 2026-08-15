import React from 'react';
import { ProfileSetup } from './ProfileSetup';

interface ProfileEditProps {
  onNavigate: (view: string, slug?: string) => void;
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({ onNavigate }) => {
  return <ProfileSetup onNavigate={onNavigate} />;
};
