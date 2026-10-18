import React, { useState } from 'react';
import { TextInput, Text, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Screen from '../components/Screen';
import { Btn, ui } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    try {
      await login(username, password);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <Screen center>
      <Text style={[ui.title, { fontSize: 28, textAlign: 'center' }]}>Recetario</Text>

      <Text style={ui.label}>Usuario</Text>
      <TextInput placeholderTextColor="#8a7a6c" style={ui.input} placeholder="Tu nombre de usuario"
        autoCapitalize="none" maxLength={20} value={username} onChangeText={setUsername} />

      <Text style={ui.label}>Contraseña</Text>
      <TextInput placeholderTextColor="#8a7a6c" style={ui.input} placeholder="Tu contraseña"
        secureTextEntry maxLength={32} value={password} onChangeText={setPassword} />

      <Btn title="Entrar" onPress={onLogin} />
      <Text style={ui.link} onPress={() => navigation.navigate('Register')}>
        ¿No tienes cuenta? Regístrate
      </Text>
    </Screen>
  );
}
