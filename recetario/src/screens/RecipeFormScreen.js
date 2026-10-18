import React, { useEffect, useState } from 'react';
import { TextInput, Text, Alert, View, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { create, update, getById } from '../services/recipeService';
import { getGroups } from '../services/groupService';
import { uploadImage } from '../services/imageService';
import Screen from '../components/Screen';
import RecipeImage from '../components/RecipeImage';
import { Btn, ui, colors } from '../theme';

export default function RecipeFormScreen({ route, navigation }) {
  const { user } = useAuth();
  const id = route.params?.id;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [servings, setServings] = useState('');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '' }]);
  const [steps, setSteps] = useState(['']);
  const [groupIds, setGroupIds] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    navigation.setOptions({ title: id ? 'Editar receta' : 'Nueva receta' });
    getGroups(user.id).then(setGroups);
    if (id) {
      getById(id).then((r) => {
        if (!r) return;
        setTitle(r.title);
        setDescription(r.description || '');
        setPrepTime(r.prepTime ? String(r.prepTime) : '');
        setServings(r.servings ? String(r.servings) : '');
        setImage(r.image || '');
        setIngredients(r.ingredients.length ? r.ingredients : [{ name: '', quantity: '' }]);
        setSteps(r.steps.length ? r.steps : ['']);
        setGroupIds(r.groupIds || []);
      });
    }
  }, []);

  const pickFromGallery = async () => {
    if (uploading) return;
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });
      if (res.canceled || !res.assets?.length) return;
      setUploading(true);
      setImage(await uploadImage(res.assets[0]));
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const setIng = (idx, field, value) =>
    setIngredients((list) => list.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  const setStep = (idx, value) => setSteps((list) => list.map((s, i) => (i === idx ? value : s)));
  const toggleGroup = (gid) =>
    setGroupIds((ids) => (ids.includes(gid) ? ids.filter((g) => g !== gid) : [...ids, gid]));

  const onSave = async () => {
    const data = {
      title,
      description,
      image,
      prepTime: prepTime.replace(/\D/g, ''),
      servings: servings.replace(/\D/g, ''),
      ingredients: ingredients
        .map((i) => ({ name: i.name.trim(), quantity: i.quantity.trim() }))
        .filter((i) => i.name),
      steps: steps.map((s) => s.trim()).filter(Boolean),
      groupIds,
    };
    try {
      if (id) await update(id, data);
      else await create(user.id, data);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <Screen>
      <Text style={ui.label}>Foto</Text>
      <RecipeImage uri={image} style={{ width: '100%', height: 200, borderRadius: 12 }}
        fallbackText="No se pudo cargar la imagen. Elige otra foto." />
      <View style={ui.row}>
        <Btn title={uploading ? 'Subiendo...' : 'Añadir'} variant="outline" style={{ flex: 1 }}
          onPress={pickFromGallery} />
        {!!image && <Btn title="Quitar" variant="danger" style={{ flex: 1 }} onPress={() => setImage('')} />}
      </View>

      <Text style={ui.label}>Título *</Text>
      <TextInput placeholderTextColor="#8a7a6c" style={ui.input} maxLength={60} value={title} onChangeText={setTitle} />

      <Text style={ui.label}>Descripción</Text>
      <TextInput placeholderTextColor="#8a7a6c" style={[ui.input, { minHeight: 70 }]} multiline maxLength={300}
        value={description} onChangeText={setDescription} />

      <View style={ui.row}>
        <View style={{ flex: 1 }}>
          <Text style={ui.label}>Tiempo (min)</Text>
          <TextInput placeholderTextColor="#8a7a6c" style={ui.input} keyboardType="number-pad" maxLength={4} value={prepTime} onChangeText={setPrepTime} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={ui.label}>Porciones</Text>
          <TextInput placeholderTextColor="#8a7a6c" style={ui.input} keyboardType="number-pad" maxLength={3} value={servings} onChangeText={setServings} />
        </View>
      </View>

      <Text style={ui.label}>Ingredientes *</Text>
      {ingredients.map((ing, idx) => (
        <View key={idx} style={ui.row}>
          <TextInput placeholderTextColor="#8a7a6c" style={[ui.input, { flex: 1 }]} placeholder="Cant." maxLength={15}
            value={ing.quantity} onChangeText={(v) => setIng(idx, 'quantity', v)} />
          <TextInput placeholderTextColor="#8a7a6c" style={[ui.input, { flex: 2 }]} placeholder="Ingrediente" maxLength={40}
            value={ing.name} onChangeText={(v) => setIng(idx, 'name', v)} />
          <Pressable onPress={() => setIngredients((l) => (l.length > 1 ? l.filter((_, i) => i !== idx) : l))}>
            <Text style={{ color: colors.danger, fontSize: 20 }}>✕</Text>
          </Pressable>
        </View>
      ))}
      <Btn title="+ Ingrediente" variant="outline"
        onPress={() => setIngredients((l) => [...l, { name: '', quantity: '' }])} />

      <Text style={ui.label}>Pasos *</Text>
      {steps.map((s, idx) => (
        <View key={idx} style={ui.row}>
          <Text style={ui.label}>{idx + 1}.</Text>
          <TextInput placeholderTextColor="#8a7a6c" style={[ui.input, { flex: 1 }]} multiline maxLength={300}
            value={s} onChangeText={(v) => setStep(idx, v)} />
          <Pressable onPress={() => setSteps((l) => (l.length > 1 ? l.filter((_, i) => i !== idx) : l))}>
            <Text style={{ color: colors.danger, fontSize: 20 }}>✕</Text>
          </Pressable>
        </View>
      ))}
      <Btn title="+ Paso" variant="outline" onPress={() => setSteps((l) => [...l, ''])} />

      <Text style={ui.label}>Grupos</Text>
      {groups.length === 0 ? (
        <Text style={ui.muted}>Aún no tienes grupos (créalos en la pestaña Grupos)</Text>
      ) : (
        <View style={[ui.row, { flexWrap: 'wrap' }]}>
          {groups.map((g) => {
            const on = groupIds.includes(g.id);
            return (
              <Pressable key={g.id} onPress={() => toggleGroup(g.id)}
                style={[ui.chip, on && { backgroundColor: colors.primary }]}>
                <Text style={{ color: on ? '#fff' : colors.primary }}>{g.name}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Btn title={id ? 'Guardar cambios' : 'Crear receta'} onPress={onSave} style={{ marginTop: 12 }} />
    </Screen>
  );
}
