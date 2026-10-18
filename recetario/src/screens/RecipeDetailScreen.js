import React, { useCallback, useState } from 'react';
import { Text, Alert, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getById, remove, copyRecipe } from '../services/recipeService';
import { getGroups } from '../services/groupService';
import Screen from '../components/Screen';
import RecipeImage from '../components/RecipeImage';
import { Btn, ui, colors } from '../theme';

export default function RecipeDetailScreen({ route, navigation }) {
  const { user } = useAuth();
  const { id } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [owner, setOwner] = useState('');
  const [groups, setGroups] = useState([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const r = await getById(id);
        setRecipe(r);
        if (r) {
          setOwner(r.ownerName || 'usuario');
          setGroups(await getGroups(user.id));
        }
      })();
    }, [id, user.id])
  );

  if (!recipe) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  const mine = recipe.ownerId === user.id;
  const recipeGroups = groups.filter((g) => (recipe.groupIds || []).includes(g.id));

  const onDelete = () =>
    Alert.alert('Eliminar receta', `¿Eliminar "${recipe.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await remove(recipe.id);
          navigation.goBack();
        },
      },
    ]);

  const onCopy = async () => {
    try {
      const copy = await copyRecipe(recipe.id, user.id);
      Alert.alert('Receta copiada', `Se agregó a tus recetas como "${copy.title}"`);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <Screen>
      <RecipeImage uri={recipe.image} style={{ width: '100%', height: 220, borderRadius: 12 }} />
      <Text style={[ui.title, { fontSize: 24 }]}>{recipe.title}</Text>
      <Text style={ui.muted}>Por {mine ? 'ti' : owner}</Text>
      {!!recipe.description && <Text>{recipe.description}</Text>}
      <Text style={ui.muted}>
        {recipe.prepTime ? `⏱ ${recipe.prepTime} min   ` : ''}
        {recipe.servings ? `🍽 ${recipe.servings} porciones` : ''}
      </Text>
      {mine && recipeGroups.length > 0 && (
        <Text style={ui.muted}>Grupos: {recipeGroups.map((g) => g.name).join(', ')}</Text>
      )}

      <Text style={[ui.title, { marginTop: 8 }]}>Ingredientes</Text>
      <View style={ui.card}>
        {recipe.ingredients.map((i, idx) => (
          <Text key={idx}>• {i.quantity ? `${i.quantity} ` : ''}{i.name}</Text>
        ))}
      </View>

      <Text style={ui.title}>Pasos</Text>
      <View style={ui.card}>
        {recipe.steps.map((s, idx) => (
          <Text key={idx}>{idx + 1}. {s}</Text>
        ))}
      </View>

      {mine ? (
        <>
          <Btn title="Editar" onPress={() => navigation.navigate('RecipeForm', { id: recipe.id })} />
          <Btn title="Eliminar" variant="danger" onPress={onDelete} />
        </>
      ) : (
        <Btn title="Copiar a mis recetas" onPress={onCopy} />
      )}
    </Screen>
  );
}
