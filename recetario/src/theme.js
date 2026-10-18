import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export const colors = {
  primary: '#d9480f',
  bg: '#fff8f0',
  card: '#ffffff',
  border: '#e5d5c5',
  text: '#2b2118',
  muted: '#7a6a5c',
  danger: '#c92a2a',
};

export function Btn({ title, onPress, variant = 'primary', style }) {
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : 'transparent';
  const color = variant === 'outline' ? colors.primary : '#fff';
  const border = variant === 'outline' ? colors.primary : bg;
  return (
    <Pressable onPress={onPress} style={[ui.btn, { backgroundColor: bg, borderColor: border }, style]}>
      <Text style={[ui.btnText, { color }]}>{title}</Text>
    </Pressable>
  );
}

export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 12 },
  center: { flex: 1, padding: 24, justifyContent: 'center', gap: 12, backgroundColor: colors.bg },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    color: colors.text,
  },
  label: { fontWeight: '700', color: colors.text, marginTop: 4 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 6,
  },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  btnText: { fontWeight: '700' },
  link: { color: colors.primary, textAlign: 'center', marginTop: 12 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
});
