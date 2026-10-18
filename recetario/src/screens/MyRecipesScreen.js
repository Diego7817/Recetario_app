import React, { useCallback, useState } from 'react';
import { View, FlatList, Text, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getMine } from '../services/recipeService';
import RecipeImage from '../components/RecipeImage';
import { Btn, ui } from '../theme';

export default function MyRecipesScreen({ navigation }) {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getMine(user.id).then(setRecipes);
    }, [user.id])
  );

  return (
    <View style={ui.screen}>
      <FlatList
        contentContainerStyle={ui.content}
        data={recipes}
        keyExtractor={(r) => r.id}
        ListHeaderComponent={<Btn title="+ Nueva receta" onPress={() => navigation.navigate('RecipeForm')} />}
        ListEmptyComponent={<Text style={ui.empty}>Aún no tienes recetas</Text>}
        renderItem={({ item }) => (
          <Pressable style={[ui.card, ui.row]} onPress={() => navigation.navigate('RecipeDetail', { id: item.id })}>
            <RecipeImage uri={item.image} style={{ width: 72, height: 72, borderRadius: 8 }} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={ui.title}>{item.title}</Text>
              {!!item.description && <Text style={ui.muted} numberOfLines={2}>{item.description}</Text>}
              <Text style={ui.muted}>
                {item.ingredients.length} ingredientes · {item.steps.length} pasos
                {item.prepTime ? ` · ${item.prepTime} min` : ''}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
