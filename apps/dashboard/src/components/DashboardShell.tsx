import { Divider, useTheme } from '@odyssey/ui';
import React from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { BrandMark, SidebarNav, ThemeToggle } from './Sidebar';

const SIDEBAR_WIDTH = 264;
const BREAKPOINT = 900;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= BREAKPOINT;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, flexDirection: wide ? 'row' : 'column' }}>
      {wide ? (
        <View
          style={{
            width: SIDEBAR_WIDTH,
            backgroundColor: theme.colors.surface,
            borderRightWidth: 1,
            borderRightColor: theme.colors.border,
            padding: theme.spacing.lg,
            justifyContent: 'space-between',
          }}
        >
          <View style={{ gap: theme.spacing.xl }}>
            <BrandMark />
            <SidebarNav />
          </View>
          <ThemeToggle />
        </View>
      ) : (
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            gap: theme.spacing.md,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <BrandMark />
            <ThemeToggle />
          </View>
          <Divider />
          <SidebarNav />
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: wide ? theme.spacing.xl : theme.spacing.lg,
          maxWidth: 1200,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        {children}
      </ScrollView>
    </View>
  );
}
