import { ConditionRow } from "@/components/ConditionRow";
import { SearchCondition, useSearch } from "@/hooks/useSearch";
import { Button, FlatList, Text, View } from "react-native";

export default function SearchPage() {
    const { conditions, setConditions, results, runSearch } = useSearch();
    const addCondition = () => {
        setConditions(prev => [
            ...prev,
            {
                id: Math.random().toString(36).substr(2, 9),
                field: 'name',
                operator: 'contains',
                value: ''
            },
        ]);
    };

   const updateCondition = (id: string, patch: Partial<SearchCondition>) => {
    setConditions(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)) );
  };

   const removeCondition = (id: string) => {
    setConditions(prev => prev.filter(c => c.id !== id));
  };


  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Поиск</Text>

      {conditions.map(c => (
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
        ListEmptyComponent={ <Text style={{ opacity: 0.6, marginTop: 8 }}> Ничего не найдено </Text> }
        renderItem={({ item }) => ( <Text>{item.Date} — {item.Name}</Text> )}
        />

    </View>
  );
}