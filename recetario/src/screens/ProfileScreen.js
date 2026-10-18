import React, { useState } from 'react';
import { TextInput, Text, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Screen from '../components/Screen';
import { Btn, ui } from '../theme';

export default function ProfileScreen() {
  const { user, updateProfile, logout, deleteAccount } = useAuth();
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');

  const onSave = async () => {
    try {
      await updateProfile({ username, email, password });
      setPassword('');
      Alert.alert('Listo', 'Perfil actualizado');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const onDelete = () =>
    Alert.alert(
      'Eliminar cuenta',
      'Se eliminarán tu cuenta, tus recetas y tus grupos. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteAccount() },
      ]
    );

  return (
    <Screen tab>
      <Text style={ui.label}>Usuario</Text>
      <TextInput placeholderTextColor="#8a7a6c" style={ui.input} autoCapitalize="none" maxLength={20} value={username} onChangeText={setUsername} />
      <Text style={ui.label}>Correo</Text>
      <TextInput placeholderTextColor="#8a7a6c" style={ui.input} autoCapitalize="none" keyboardType="email-address" maxLength={50}
        value={email} onChangeText={setEmail} />
      <Text style={ui.label}>Nueva contraseña (opcional)</Text>
      <TextInput placeholderTextColor="#8a7a6c" style={ui.input} secureTextEntry maxLength={32} placeholder="Déjala vacía para no cambiarla"
        value={password} onChangeText={setPassword} />
      <Btn title="Guardar cambios" onPress={onSave} />
      <Btn title="Cerrar sesión" variant="outline" onPress={logout} />
      <Btn title="Eliminar cuenta" variant="danger" onPress={onDelete} />
    </Screen>
  );
}
