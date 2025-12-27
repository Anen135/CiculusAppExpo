import { ConditionRow } from "@/components/ConditionRow";
import { useTheme } from "@/context/ThemeContext";
import { DiaryEntry } from "@/hooks/useDiary";
import { SearchCondition, useSearch } from "@/hooks/useSearch";
import { useRouter } from "expo-router";
import { Button, FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchPage() {
  const { conditions, setConditions, results, runSearch } = useSearch();
  const router = useRouter();
  const { colors } = useTheme();

  // Функция для создания нового условия с безопасными дефолтами
  const createCondition = (): SearchCondition => ({
    id: Math.random().toString(36).substr(2, 9),
    field: "name",
    operator: "contains",
    value: "",
    logic: conditions.length > 0 ? "AND" : undefined, // первый элемент без логики
    negate: false,
  });

  const addCondition = () => {
    setConditions(prev => [...prev, createCondition()]);
  };

  const updateCondition = (id: string, patch: Partial<SearchCondition>) => {
    setConditions(prev =>
      prev.map(c => (c.id === id ? { ...c, ...patch } : c))
    );
  };

  const removeCondition = (id: string) => {
    setConditions(prev => prev.filter(c => c.id !== id));
  };

  const renderItem = ({ item }: { item: DiaryEntry }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({ pathname: "/entry", params: { entry: JSON.stringify(item) } })
      }
      style={{
        flexDirection: "row",
        padding: 10,
        backgroundColor: colors.card,
        marginVertical: 4,
        borderRadius: 5,
      }}
    >
      <Text style={{ fontWeight: "bold", width: 100, color: colors.cardItemText }}>
        {item.Date} – {item.EndTime}
      </Text>
      <Text style={{ flex: 1, color: colors.cardItemText }}>{item.Name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 20, marginBottom: 12 }}>Поиск</Text>

        {conditions.map((c, index) => (
          <ConditionRow
            key={c.id}
            condition={c}
            onChange={(patch: Partial<SearchCondition>) => updateCondition(c.id, patch)}
            onRemove={() => removeCondition(c.id)}
          />
        ))}

        <Button title="Добавить условие" onPress={addCondition} />
        <View style={{ height: 8 }} />
        <Button title="Найти" onPress={runSearch} />

        <Text style={{ marginTop: 16, fontSize: 18 }}>Результаты:</Text>

        <FlatList
          data={results}
          keyExtractor={item => String(item.Id)}
          ListEmptyComponent={
            <Text style={{ opacity: 0.6, marginTop: 8 }}>Ничего не найдено</Text>
          }
          renderItem={renderItem}
          scrollEnabled={false} // отключаем скролл внутри FlatList
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
