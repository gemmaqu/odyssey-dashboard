import { NavItem, Text, useTheme } from '@odyssey/ui';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

interface NavLink {
  label: string;
  href: string;
  glyph: string;
}

const LINKS: NavLink[] = [
  { label: 'Home', href: '/', glyph: '◱' },
  { label: 'Orders', href: '/orders', glyph: '🧾' },
  { label: 'CRM', href: '/customers', glyph: '👥' },
  { label: 'Menu', href: '/menu', glyph: '🍽' },
  { label: 'Settings', href: '/settings', glyph: '⚙' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BrandMark() {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: theme.radii.md,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text variant="title" style={{ color: theme.colors.onPrimary }}>
          O
        </Text>
      </View>
      <View>
        <Text variant="title">Odyssey</Text>
        <Text variant="caption" color="textSubtle">
          Restaurant OS
        </Text>
      </View>
    </View>
  );
}

function NavIcon({ glyph }: { glyph: string }) {
  return <Text variant="body">{glyph}</Text>;
}

export function ThemeToggle() {
  const { theme, mode, toggleMode } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Toggle color theme"
      onPress={toggleMode}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
      }}
    >
      <Text variant="label" color="textMuted">
        {mode === 'light' ? '☀  Light' : '☾  Dark'}
      </Text>
      <Text variant="caption" color="textSubtle">
        Toggle
      </Text>
    </Pressable>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={{ gap: 2 }}>
      {LINKS.map((link) => (
        <NavItem
          key={link.href}
          label={link.label}
          icon={<NavIcon glyph={link.glyph} />}
          active={isActive(pathname, link.href)}
          onPress={() => {
            router.push(link.href as never);
            onNavigate?.();
          }}
        />
      ))}
      <View style={{ height: 12 }} />
      <NavItem
        label="UI Kit"
        icon={<NavIcon glyph="✦" />}
        active={isActive(pathname, '/ui')}
        onPress={() => {
          router.push('/ui' as never);
          onNavigate?.();
        }}
      />
    </View>
  );
}
