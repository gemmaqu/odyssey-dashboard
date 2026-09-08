import { ApiError, type MenuCategoryWithItems, type MenuItem } from '@odyssey/api-client';
import { formatAmount, parseMoneyToCents } from '@odyssey/shared';
import { Button, Dialog, Input, Select, Text, useTheme, useToast } from '@odyssey/ui';
import React, { useEffect, useState } from 'react';
import { Switch, View } from 'react-native';
import { useCreateMenuItem, useUpdateMenuItem } from '../features/menu';

export function MenuItemDialog({
  visible,
  onClose,
  item,
  categories,
}: {
  visible: boolean;
  onClose: () => void;
  item?: MenuItem | null;
  categories: MenuCategoryWithItems[];
}) {
  const { theme } = useTheme();
  const toast = useToast();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const isEdit = Boolean(item);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(item?.name ?? '');
      setDescription(item?.description ?? '');
      setPrice(item ? formatAmount(item.priceCents) : '');
      setCategoryId(item?.categoryId ?? categories[0]?.id ?? null);
      setIsAvailable(item?.isAvailable ?? true);
      setTouched(false);
    }
  }, [visible, item, categories]);

  const priceCents = parseMoneyToCents(price);
  const nameError = touched && !name.trim() ? 'Name is required' : undefined;
  const priceError = touched && (priceCents === null || priceCents <= 0) ? 'Enter a valid price' : undefined;
  const valid = name.trim() && priceCents !== null && priceCents > 0 && categoryId;
  const pending = createItem.isPending || updateItem.isPending;

  const submit = () => {
    setTouched(true);
    if (!valid || !categoryId || priceCents === null) return;

    const onSuccess = () => {
      toast.show(isEdit ? 'Item updated' : 'Item created', { variant: 'success' });
      onClose();
    };
    const onError = (err: unknown) => {
      const message = err instanceof ApiError ? err.body?.error?.message ?? err.message : 'Failed to save item';
      toast.show(message, { variant: 'error' });
    };

    if (isEdit && item) {
      updateItem.mutate(
        { id: item.id, data: { name: name.trim(), description: description.trim() || null, priceCents, categoryId, isAvailable } },
        { onSuccess, onError },
      );
    } else {
      createItem.mutate(
        { data: { name: name.trim(), description: description.trim() || null, priceCents, categoryId, isAvailable } },
        { onSuccess, onError },
      );
    }
  };

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={isEdit ? 'Edit item' : 'New menu item'}
      size="sm"
      footer={
        <>
          <Button label="Cancel" variant="ghost" onPress={onClose} />
          <Button label={isEdit ? 'Save changes' : 'Create item'} onPress={submit} disabled={pending} loading={pending} />
        </>
      }
    >
      <View style={{ gap: 16 }}>
        <Input label="Name" value={name} onChangeText={setName} error={nameError} placeholder="Margherita" />
        <Input label="Description (optional)" value={description} onChangeText={setDescription} multiline placeholder="Short description" />
        <Input
          label="Price"
          value={price}
          onChangeText={setPrice}
          error={priceError}
          placeholder="0.00"
          keyboardType="decimal-pad"
          leftIcon={<Text color="textMuted">$</Text>}
        />
        <Select
          label="Category"
          value={categoryId}
          onChange={setCategoryId}
          options={categories.map((c) => ({ label: c.name, value: c.id }))}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="label" color="textMuted">
            Available
          </Text>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ true: theme.colors.primary, false: theme.colors.borderStrong }}
          />
        </View>
      </View>
    </Dialog>
  );
}
