import React, { useCallback, useState } from 'react';
import { View, FlatList, Text, Pressable, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getAll, copyRecipe } from '../services/recipeService';
import RecipeImage from '../components/RecipeImage';
import { Btn, ui } from '../theme';

export default function AllRecipesScreen({ navigation }) {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState('');

  const reload = useCallback(async () => {
    setRecipes(await getAll());
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const onCopy = async (id) => {
    try {
      const copy = await copyRecipe(id, user.id);
      Alert.alert('Receta copiada', `Se agregó a tus recetas como "${copy.title}"`);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const filtered = recipes.filter((r) => r.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <View style={ui.screen}>
      <FlatList
        contentContainerStyle={ui.content}
        keyboardShouldPersistTaps="handled"
        data={filtered}
        keyExtractor={(r) => r.id}
        ListHeaderComponent={
          <TextInput placeholderTextColor="#8a7a6c" style={ui.input} placeholder="Buscar receta..." value={query} onChangeText={setQuery} />
        }
        ListEmptyComponent={<Text style={ui.empty}>No hay recetas</Text>}
        renderItem={({ item }) => {
          const mine = item.ownerId === user.id;
          return (
            <Pressable style={ui.card} onPress={() => navigation.navigate('RecipeDetail', { id: item.id })}>
              <View style={ui.row}>
                <RecipeImage uri={item.image} style={{ width: 72, height: 72, borderRadius: 8 }} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={ui.title}>{item.title}</Text>
                  <Text style={ui.muted}>Por {mine ? 'ti' : item.ownerName || 'usuario'}</Text>
                  {!!item.description && <Text style={ui.muted} numberOfLines={2}>{item.description}</Text>}
                </View>
              </View>
              {!mine && <Btn title="Copiar a mis recetas" variant="outline" onPress={() => onCopy(item.id)} />}
            </Pressable>
          );
        }}
      />
    </View>
  );
}
