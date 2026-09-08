import 'react-native-gesture-handler';
import { Slot } from 'expo-router';
import React from 'react';
import { DashboardShell } from '../components/DashboardShell';
import { AppProviders } from '../providers/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <DashboardShell>
        <Slot />
      </DashboardShell>
    </AppProviders>
  );
}
