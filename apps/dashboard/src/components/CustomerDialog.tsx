import { ApiError } from '@odyssey/api-client';
import { Button, Dialog, Input, useToast } from '@odyssey/ui';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useCreateCustomer } from '../features/customers';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CustomerDialog({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const toast = useToast();
  const createCustomer = useCreateCustomer();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState(false);

  const nameError = touched && !name.trim() ? 'Name is required' : undefined;
  const emailError = touched && !EMAIL_RE.test(email) ? 'A valid email is required' : undefined;
  const valid = name.trim() && EMAIL_RE.test(email);

  const close = () => {
    setName('');
    setEmail('');
    setPhone('');
    setTouched(false);
    onClose();
  };

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    createCustomer.mutate(
      { data: { name: name.trim(), email: email.trim(), phone: phone.trim() || null } },
      {
        onSuccess: () => {
          toast.show('Customer added', { variant: 'success' });
          close();
        },
        onError: (err) => {
          const message =
            err instanceof ApiError ? err.body?.error?.message ?? err.message : 'Failed to add customer';
          toast.show(message, { variant: 'error' });
        },
      },
    );
  };

  return (
    <Dialog
      visible={visible}
      onClose={close}
      title="Add customer"
      size="sm"
      footer={
        <>
          <Button label="Cancel" variant="ghost" onPress={close} />
          <Button label="Add customer" onPress={submit} disabled={createCustomer.isPending} loading={createCustomer.isPending} />
        </>
      }
    >
      <View style={{ gap: 16 }}>
        <Input label="Name" value={name} onChangeText={setName} error={nameError} placeholder="Jane Doe" />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          placeholder="jane@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input label="Phone (optional)" value={phone} onChangeText={setPhone} placeholder="+1 555 010 0000" />
      </View>
    </Dialog>
  );
}
