import React, { useEffect, useState } from 'react';
import { Image, Text } from 'react-native';
import { resolveImage } from '../services/api';
import { ui } from '../theme';

export default function RecipeImage({ uri, style, fallbackText }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  if (!uri) return null;
  if (failed) return fallbackText ? <Text style={ui.muted}>{fallbackText}</Text> : null;
  return <Image source={{ uri: resolveImage(uri) }} style={style} resizeMode="cover" onError={() => setFailed(true)} />;
}
