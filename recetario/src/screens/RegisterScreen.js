import React, { useState } from 'react';
import { TextInput, Text, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Screen from '../components/Screen';
import { Btn, ui } from '../theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const onRegister = async () => {
    if (password !== confirm) return Alert.alert('Error', 'Las contraseñas no coinciden');
    try {
      await register({ username, email, password });
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <Screen center>
      <Text style={ui.label}>Usuario</Text>
      <TextInput placeholderTextColor="#8a7a6c" style={ui.input} placeholder="Ej: chef_ana"
        autoCapitalize="none" maxLength={20} value={username} onChangeText={setUsername} />
      <Text style={ui.muted}>4 a 20 caracteres: letras, números y guion bajo (_)</Text>

      <Text style={ui.label}>Correo</Text>
      <TextInput placeholderTextColor="#8a7a6c" style={ui.input} placeholder="correo@ejemplo.com"
        autoCapitalize="none" keyboardType="email-address" maxLength={50}
        value={email} onChangeText={setEmail} />

      <Text style={ui.label}>Contraseña</Text>
      <TextInput placeholderTextColor="#8a7a6c" style={ui.input} placeholder="Tu contraseña"
        secureTextEntry maxLength={32} value={password} onChangeText={setPassword} />
      <Text style={ui.muted}>
        8 a 32 caracteres, con mayúscula, minúscula, número y un símbolo. Sin espacios.
      </Text>

      <Text style={ui.label}>Confirmar contraseña</Text>
      <TextInput placeholderTextColor="#8a7a6c" style={ui.input} placeholder="Repite la contraseña"
        secureTextEntry maxLength={32} value={confirm} onChangeText={setConfirm} />

      <Btn title="Crear cuenta" onPress={onRegister} />
      <Text style={ui.link} onPress={() => navigation.goBack()}>¿Ya tienes cuenta? Inicia sesión</Text>
    </Screen>
  );
}
