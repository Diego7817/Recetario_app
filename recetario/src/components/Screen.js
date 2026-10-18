import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Keyboard, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

// Contenedor con scroll que:
//  - deja espacio para los botones del sistema (barra de navegación) en pantallas de stack
//  - se encoge cuando aparece el teclado y desplaza el campo enfocado a la vista
export default function Screen({ children, center = false, tab = false }) {
  const insets = useSafeAreaInsets();
  const box = useRef(null);
  const scroll = useRef(null);
  const [overlap, setOverlap] = useState(0);

  const scrollToFocused = () => {
    try {
      const input = TextInput.State.currentlyFocusedInput?.();
      const inner = scroll.current?.getInnerViewRef?.();
      if (input && inner) {
        input.measureLayout(
          inner,
          (x, y) => scroll.current?.scrollTo({ y: Math.max(0, y - 120), animated: true }),
          () => {}
        );
      }
    } catch (e) {}
  };

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      box.current?.measureInWindow((x, y, w, h) => {
        setOverlap(Math.max(0, y + h - e.endCoordinates.screenY));
        setTimeout(scrollToFocused, 120);
      });
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setOverlap(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <View
      ref={box}
      collapsable={false}
      style={{ flex: 1, backgroundColor: colors.bg, paddingBottom: overlap }}
    >
      <ScrollView
        ref={scroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          { padding: center ? 24 : 16, gap: 12, paddingBottom: (tab ? 0 : insets.bottom) + 32 },
          center && { flexGrow: 1, justifyContent: 'center' },
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
}
