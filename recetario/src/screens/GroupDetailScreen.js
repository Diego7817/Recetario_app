import React, { useCallback, useState } from 'react';
import { Text, View, Alert, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import {
  getGroupById, deleteGroup, addRecipeToGroup, removeRecipeFromGroup,
} from '../services/groupService';
import { getMine } from '../services/recipeService';
import Screen from '../components/Screen';
import { Btn, ui, colors } from '../theme';

export default function GroupDetailScreen({ route, navigation }) {
  const { user } = useAuth();
  const { id } = route.params;
  const [group, setGroup] = useState(null);
  const [recipes, setRecipes] = useState([]);

  const reload = useCallback(async () => {
    const g = await getGroupById(id);
    setGroup(g);
    if (g) {
      navigation.setOptions({ title: g.name });
      setRecipes(await getMine(user.id));
    }
  }, [id, user.id]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  if (!group) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  const inGroup = recipes.filter((r) => (r.groupIds || []).includes(id));
  const available = recipes.filter((r) => !(r.groupIds || []).includes(id));

  const onDelete = () => {
    const n = inGroup.length;
    const warning =
      n > 0
        ? `Al eliminar "${group.name}" también se eliminarán sus ${n} receta(s). Esta acción no se puede deshacer.`
        : `Se eliminará el grupo "${group.name}". No tiene recetas.`;
    Alert.alert('Eliminar grupo', warning, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const removed = await deleteGroup(id);
          navigation.goBack();
          Alert.alert(
            'Grupo eliminado',
            removed > 0
              ? `Se eliminó "${group.name}" junto con ${removed} receta(s).`
              : `Se eliminó "${group.name}".`
          );
        },
      },
    ]);
  };

  return (
    <Screen>
      {!!group.description && <Text style={ui.muted}>{group.description}</Text>}

      <Text style={ui.title}>Recetas del grupo</Text>
      {inGroup.length === 0 && <Text style={ui.muted}>Este grupo no tiene recetas</Text>}
      {inGroup.map((r) => (
        <View key={r.id} style={ui.card}>
          <Pressable onPress={() => navigation.navigate('RecipeDetail', { id: r.id })}>
            <Text style={ui.title}>{r.title}</Text>
          </Pressable>
          <Btn title="Quitar del grupo" variant="outline"
            onPress={async () => { await removeRecipeFromGroup(r.id, id); reload(); }} />
        </View>
      ))}

      <Text style={[ui.title, { marginTop: 8 }]}>Agregar recetas</Text>
      {available.length === 0 && <Text style={ui.muted}>No hay más recetas disponibles</Text>}
      {available.map((r) => (
        <View key={r.id} style={[ui.card, ui.row, { justifyContent: 'space-between' }]}>
          <Text style={[ui.title, { flex: 1 }]}>{r.title}</Text>
          <Btn title="Agregar" onPress={async () => { await addRecipeToGroup(r.id, id); reload(); }} />
        </View>
      ))}

      <Btn title="Editar grupo" variant="outline" onPress={() => navigation.navigate('GroupForm', { id })} />
      <Btn title="Eliminar grupo" variant="danger" onPress={onDelete} />
    </Screen>
  );
}
