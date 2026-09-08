import { ApiError, type OpeningHour } from '@odyssey/api-client';
import { Button, Card, Divider, Input, Skeleton, Text, useTheme, useToast } from '@odyssey/ui';
import React, { useEffect, useState } from 'react';
import { Switch, View } from 'react-native';
import { DataState } from '../../components/DataState';
import { PageHeader } from '../../components/PageHeader';
import { useSettings, useUpdateSettings } from '../../features/settings';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface FormState {
  prepTimeMinutes: string;
  autoAccept: boolean;
  serviceOpen: boolean;
  taxPercent: string;
  currency: string;
  openingHours: OpeningHour[];
}

export default function SettingsScreen() {
  const { theme } = useTheme();
  const toast = useToast();
  const query = useSettings();
  const update = useUpdateSettings();
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (query.data && !form) {
      setForm({
        prepTimeMinutes: String(query.data.prepTimeMinutes),
        autoAccept: query.data.autoAccept,
        serviceOpen: query.data.serviceOpen,
        taxPercent: (query.data.taxRateBps / 100).toString(),
        currency: query.data.currency,
        openingHours: query.data.openingHours,
      });
    }
  }, [query.data, form]);

  const patch = (partial: Partial<FormState>) => setForm((f) => (f ? { ...f, ...partial } : f));

  const setHour = (day: number, key: keyof OpeningHour, value: string | boolean) => {
    setForm((f) =>
      f
        ? { ...f, openingHours: f.openingHours.map((h) => (h.day === day ? { ...h, [key]: value } : h)) }
        : f,
    );
  };

  const save = () => {
    if (!form) return;
    const prep = Number(form.prepTimeMinutes);
    const taxPercent = Number(form.taxPercent);
    if (Number.isNaN(prep) || Number.isNaN(taxPercent)) {
      toast.show('Prep time and tax must be numbers', { variant: 'error' });
      return;
    }
    update.mutate(
      {
        data: {
          prepTimeMinutes: Math.round(prep),
          autoAccept: form.autoAccept,
          serviceOpen: form.serviceOpen,
          taxRateBps: Math.round(taxPercent * 100),
          currency: form.currency.toUpperCase(),
          openingHours: form.openingHours,
        },
      },
      {
        onSuccess: () => toast.show('Settings saved', { variant: 'success' }),
        onError: (err) => {
          const message = err instanceof ApiError ? err.body?.error?.message ?? err.message : 'Failed to save';
          toast.show(message, { variant: 'error' });
        },
      },
    );
  };

  return (
    <View>
      <PageHeader
        title="Settings"
        subtitle="Ordering rules and service availability"
        actions={form ? <Button label="Save changes" onPress={save} loading={update.isPending} /> : undefined}
      />

      <DataState
        isLoading={query.isLoading || !form}
        isError={query.isError}
        error={query.error}
        onRetry={query.refetch}
        loading={<Skeleton height={360} />}
      >
        {form ? (
          <View style={{ gap: theme.spacing.lg, maxWidth: 640 }}>
            <Card title="Service">
              <View style={{ gap: theme.spacing.md }}>
                <ToggleRow
                  label="Accepting orders"
                  hint="Turn off to pause new orders during a rush or closing."
                  value={form.serviceOpen}
                  onChange={(v) => patch({ serviceOpen: v })}
                />
                <Divider />
                <ToggleRow
                  label="Auto-accept new orders"
                  hint="New orders skip Pending and go straight to Accepted."
                  value={form.autoAccept}
                  onChange={(v) => patch({ autoAccept: v })}
                />
              </View>
            </Card>

            <Card title="Ordering">
              <View style={{ gap: theme.spacing.md }}>
                <Input
                  label="Prep time (minutes)"
                  value={form.prepTimeMinutes}
                  onChangeText={(v) => patch({ prepTimeMinutes: v })}
                  keyboardType="number-pad"
                />
                <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                  <Input
                    containerStyle={{ flex: 1 }}
                    label="Tax rate (%)"
                    value={form.taxPercent}
                    onChangeText={(v) => patch({ taxPercent: v })}
                    keyboardType="decimal-pad"
                  />
                  <Input
                    containerStyle={{ flex: 1 }}
                    label="Currency"
                    value={form.currency}
                    onChangeText={(v) => patch({ currency: v })}
                    autoCapitalize="characters"
                    maxLength={3}
                  />
                </View>
              </View>
            </Card>

            <Card title="Opening hours">
              <View style={{ gap: theme.spacing.sm }}>
                {form.openingHours.map((h) => (
                  <View key={h.day} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                    <Text variant="label" style={{ width: 40 }}>
                      {DAY_LABELS[h.day]}
                    </Text>
                    <Switch
                      value={!h.closed}
                      onValueChange={(v) => setHour(h.day, 'closed', !v)}
                      trackColor={{ true: theme.colors.primary, false: theme.colors.borderStrong }}
                    />
                    {h.closed ? (
                      <Text color="textSubtle">Closed</Text>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 }}>
                        <Input containerStyle={{ flex: 1 }} value={h.open} onChangeText={(v) => setHour(h.day, 'open', v)} placeholder="09:00" />
                        <Text color="textSubtle">–</Text>
                        <Input containerStyle={{ flex: 1 }} value={h.close} onChangeText={(v) => setHour(h.day, 'close', v)} placeholder="22:00" />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </Card>
          </View>
        ) : null}
      </DataState>
    </View>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md }}>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{label}</Text>
        {hint ? (
          <Text variant="caption" color="textSubtle">
            {hint}
          </Text>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: theme.colors.primary, false: theme.colors.borderStrong }} />
    </View>
  );
}
