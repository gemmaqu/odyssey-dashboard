import { ORDER_STATUSES } from '@odyssey/types';
import {
  Badge,
  Button,
  Dialog,
  EmptyState,
  Input,
  Select,
  Skeleton,
  SkeletonText,
  spacing as spacingScale,
  radii as radiiScale,
  StatusBadge,
  Surface,
  Table,
  Text,
  useTheme,
  useToast,
} from '@odyssey/ui';
import React, { useState } from 'react';
import { View } from 'react-native';
import { PageHeader } from '../../components/PageHeader';

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing['2xl'] }}>
      <View style={{ gap: 2 }}>
        <Text variant="h2">{title}</Text>
        {description ? (
          <Text variant="body" color="textMuted">
            {description}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Swatch({ color, name }: { color: string; name: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: 6, width: 120 }}>
      <View style={{ height: 56, borderRadius: theme.radii.md, backgroundColor: color, borderWidth: 1, borderColor: theme.colors.border }} />
      <Text variant="caption" color="textMuted">
        {name}
      </Text>
    </View>
  );
}

export default function UiShowcaseScreen() {
  const { theme } = useTheme();
  const toast = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectValue, setSelectValue] = useState<string | null>(null);

  const semantic: [string, string][] = [
    ['primary', theme.colors.primary],
    ['success', theme.colors.success],
    ['warning', theme.colors.warning],
    ['danger', theme.colors.danger],
    ['info', theme.colors.info],
    ['surface', theme.colors.surface],
    ['background', theme.colors.background],
    ['border', theme.colors.border],
  ];

  const typographyVariants = ['display', 'h1', 'h2', 'h3', 'title', 'body', 'bodyStrong', 'label', 'caption', 'overline'] as const;

  return (
    <View>
      <PageHeader title="UI Kit" subtitle="Design tokens, primitives and component states" />

      <Section title="Color tokens" description="Semantic roles resolve per theme (toggle light/dark in the sidebar).">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
          {semantic.map(([name, color]) => (
            <Swatch key={name} name={name} color={color} />
          ))}
        </View>
      </Section>

      <Section title="Status colors" description="Centralized order-status palette used by every StatusBadge.">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {ORDER_STATUSES.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </View>
      </Section>

      <Section title="Typography" description="A single scale drives every text variant.">
        <Surface style={{ gap: theme.spacing.sm }}>
          {typographyVariants.map((variant) => (
            <Text key={variant} variant={variant}>
              {variant} — The quick brown fox
            </Text>
          ))}
        </Surface>
      </Section>

      <Section title="Spacing scale" description="4px base scale.">
        <View style={{ gap: theme.spacing.sm }}>
          {Object.entries(spacingScale)
            .filter(([, v]) => v > 0)
            .map(([name, value]) => (
              <View key={name} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <Text variant="label" color="textMuted" style={{ width: 48 }}>
                  {name}
                </Text>
                <View style={{ height: 12, width: value, backgroundColor: theme.colors.primary, borderRadius: 3 }} />
                <Text variant="caption" color="textSubtle">
                  {value}px
                </Text>
              </View>
            ))}
        </View>
      </Section>

      <Section title="Radii & elevation">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg }}>
          {Object.entries(radiiScale).map(([name, value]) => (
            <View key={name} style={{ alignItems: 'center', gap: 6 }}>
              <View style={{ width: 64, height: 64, borderRadius: value as number, backgroundColor: theme.colors.surfaceHover, borderWidth: 1, borderColor: theme.colors.border }} />
              <Text variant="caption" color="textMuted">
                {name}
              </Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg, marginTop: theme.spacing.lg }}>
          {(['sm', 'md', 'lg'] as const).map((e) => (
            <Surface key={e} elevation={e} style={{ width: 120, alignItems: 'center' }}>
              <Text variant="label" color="textMuted">
                elevation {e}
              </Text>
            </Surface>
          ))}
        </View>
      </Section>

      <Section title="Buttons" description="Variants, sizes and states.">
        <Surface style={{ gap: theme.spacing.md }}>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
            <Button label="Primary" onPress={() => {}} />
            <Button label="Secondary" variant="secondary" onPress={() => {}} />
            <Button label="Outline" variant="outline" onPress={() => {}} />
            <Button label="Ghost" variant="ghost" onPress={() => {}} />
            <Button label="Danger" variant="danger" onPress={() => {}} />
          </View>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button label="Small" size="sm" onPress={() => {}} />
            <Button label="Medium" size="md" onPress={() => {}} />
            <Button label="Large" size="lg" onPress={() => {}} />
            <Button label="Loading" loading onPress={() => {}} />
            <Button label="Disabled" disabled onPress={() => {}} />
          </View>
        </Surface>
      </Section>

      <Section title="Form controls" description="Inputs, selects and their states.">
        <Surface style={{ gap: theme.spacing.md, maxWidth: 420 }}>
          <Input label="Default" placeholder="Type here…" />
          <Input label="With error" value="bad@" error="A valid email is required" />
          <Input label="Disabled" value="Read only" editable={false} />
          <Select
            label="Select"
            value={selectValue}
            onChange={setSelectValue}
            options={[
              { label: 'Dine-in', value: 'dinein' },
              { label: 'Takeaway', value: 'takeaway' },
              { label: 'Delivery', value: 'delivery' },
            ]}
          />
        </Surface>
      </Section>

      <Section title="Badges">
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
          <Badge label="Neutral" />
          <Badge label="Primary" tone="primary" dot />
          <Badge label="Success" tone="success" dot />
          <Badge label="Warning" tone="warning" dot />
          <Badge label="Danger" tone="danger" dot />
          <Badge label="Info" tone="info" dot />
        </View>
      </Section>

      <Section title="Table">
        <Table
          data={[
            { id: '1', name: 'Margherita', price: '$14.00', status: 'ready' as const },
            { id: '2', name: 'Diavola', price: '$16.50', status: 'preparing' as const },
          ]}
          keyExtractor={(r) => r.id}
          columns={[
            { key: 'name', header: 'Item', flex: 2 },
            { key: 'price', header: 'Price', flex: 1, align: 'right' },
            { key: 'status', header: 'Status', flex: 1, render: (r) => <StatusBadge status={r.status} /> },
          ]}
        />
      </Section>

      <Section title="Loading & empty states">
        <View style={{ flexDirection: 'row', gap: theme.spacing.lg, flexWrap: 'wrap' }}>
          <Surface style={{ flex: 1, minWidth: 240, gap: theme.spacing.md }}>
            <Skeleton height={24} width="50%" />
            <SkeletonText lines={3} />
          </Surface>
          <Surface style={{ flex: 1, minWidth: 240 }}>
            <EmptyState glyph="🍽" title="No items yet" description="Add your first menu item to get started." />
          </Surface>
        </View>
      </Section>

      <Section title="Feedback" description="Toasts and dialogs.">
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
          <Button label="Success toast" variant="secondary" onPress={() => toast.show('Saved successfully', { variant: 'success' })} />
          <Button label="Error toast" variant="secondary" onPress={() => toast.show('Something failed', { variant: 'error' })} />
          <Button label="Open dialog" onPress={() => setDialogOpen(true)} />
        </View>
      </Section>

      <Dialog
        visible={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Example dialog"
        subtitle="Dialogs are used for create and edit flows."
        footer={
          <>
            <Button label="Cancel" variant="ghost" onPress={() => setDialogOpen(false)} />
            <Button label="Confirm" onPress={() => setDialogOpen(false)} />
          </>
        }
      >
        <Text>Any content can go inside a dialog, including forms.</Text>
      </Dialog>
    </View>
  );
}
