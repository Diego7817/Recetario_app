import React, { useCallback, useState } from 'react';
import { View, FlatList, Text, Pressable, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getGroups, deleteGroup } from '../services/groupService';
import { getMine } from '../services/recipeService';
import { Btn, ui } from '../theme';

export default function GroupsScreen({ navigation }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [recipes, setRecipes] = useState([]);

  const reload = useCallback(async () => {
    setGroups(await getGroups(user.id));
    setRecipes(await getMine(user.id));
  }, [user.id]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const count = (gid) => recipes.filter((r) => (r.groupIds || []).includes(gid)).length;

  const onDelete = (g) => {
    const n = count(g.id);
    const warning =
      n > 0
        ? `Al eliminar "${g.name}" también se eliminarán sus ${n} receta(s). Esta acción no se puede deshacer.`
        : `Se eliminará el grupo "${g.name}". No tiene recetas.`;
    Alert.alert('Eliminar grupo', warning, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const removed = await deleteGroup(g.id);
          await reload();
          Alert.alert(
            'Grupo eliminado',
            removed > 0
              ? `Se eliminó "${g.name}" junto con ${removed} receta(s).`
              : `Se eliminó "${g.name}".`
          );
        },
      },
    ]);
  };

  return (
    <View style={ui.screen}>
      <FlatList
        contentContainerStyle={ui.content}
        data={groups}
        keyExtractor={(g) => g.id}
        ListHeaderComponent={<Btn title="+ Nuevo grupo" onPress={() => navigation.navigate('GroupForm')} />}
        ListEmptyComponent={<Text style={ui.empty}>Aún no tienes grupos</Text>}
        renderItem={({ item }) => (
          <Pressable style={ui.card} onPress={() => navigation.navigate('GroupDetail', { id: item.id })}>
            <Text style={ui.title}>{item.name}</Text>
            {!!item.description && <Text style={ui.muted}>{item.description}</Text>}
            <Text style={ui.muted}>{count(item.id)} receta(s)</Text>
            <View style={ui.row}>
              <Btn title="Editar" variant="outline" style={{ flex: 1 }}
                onPress={() => navigation.navigate('GroupForm', { id: item.id })} />
              <Btn title="Eliminar" variant="danger" style={{ flex: 1 }} onPress={() => onDelete(item)} />
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
