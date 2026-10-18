import React, { useEffect, useState } from 'react';
import { TextInput, Text, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { createGroup, updateGroup, getGroupById } from '../services/groupService';
import Screen from '../components/Screen';
import { Btn, ui } from '../theme';

export default function GroupFormScreen({ route, navigation }) {
  const { user } = useAuth();
  const id = route.params?.id;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    navigation.setOptions({ title: id ? 'Editar grupo' : 'Nuevo grupo' });
    if (id) {
      getGroupById(id).then((g) => {
        if (g) {
          setName(g.name);
          setDescription(g.description || '');
        }
      });
    }
  }, []);

  const onSave = async () => {
    try {
      if (id) await updateGroup(id, { name, description });
      else await createGroup(user.id, { name, description });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <Screen>
      <Text style={ui.label}>Nombre *</Text>
      <TextInput placeholderTextColor="#8a7a6c" style={ui.input} maxLength={40} value={name} onChangeText={setName} />
      <Text style={ui.label}>Descripción</Text>
      <TextInput placeholderTextColor="#8a7a6c" style={[ui.input, { minHeight: 70 }]} multiline maxLength={200}
        value={description} onChangeText={setDescription} />
      <Btn title={id ? 'Guardar cambios' : 'Crear grupo'} onPress={onSave} />
    </Screen>
  );
}
