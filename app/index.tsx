import { DayTimeline } from "@/components/DayTimeline";
import { DiaryEntry, useDiary } from "@/hooks/useDiary";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Button, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MainPage() {
  const { entries, loadEntries } = useDiary();
  const [currentDay, setCurrentDay] = useState(new Date());
  const router = useRouter();

  useFocusEffect( useCallback(() => { loadEntries(); }, [loadEntries]) );
  useEffect(() => { loadEntries(); }, [currentDay, loadEntries]);

  const headerText = (() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (currentDay.toDateString() === today.toDateString()) return "Сегодняшние записи";
    if (currentDay.toDateString() === yesterday.toDateString()) return "Вчерашние записи";
    if (currentDay.toDateString() === tomorrow.toDateString()) return "Завтрашние записи";
    return `Записи за ${currentDay.toLocaleDateString()}`;
  })();


  const dayEntries = entries.filter( e => e.Date === currentDay.toISOString().slice(0, 10) );


  const renderItem = ({ item }: { item: DiaryEntry }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: "/EntryPage", params: { entry: JSON.stringify(item) } })}
      style={{ flexDirection: "row", padding: 10, backgroundColor: "#eee", marginVertical: 4, borderRadius: 5, }}
    >
      <Text style={{ fontWeight: "bold", width: 100 }}>
        {item.StartTime} – {item.EndTime}
      </Text>
      <Text style={{ flex: 1 }}>{item.Name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>
          {headerText}
        </Text>

        <DayTimeline entries={dayEntries} />

        {entries.length === 0 && (
          <Text style={{ textAlign: "center", fontSize: 16, marginVertical: 20 }}>
            Записей нет.
          </Text>
        )}

        <FlatList
          data={dayEntries}
          keyExtractor={(item) => item.Id.toString()}
          renderItem={renderItem}
        />

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20, marginBottom: 20 }}>
          <Button title="<" onPress={() => setCurrentDay(d => new Date(d.setDate(d.getDate() - 1)))} />
          <Button title="+" onPress={() => router.push({ pathname: "/EntryPage", params: { entry: JSON.stringify({ Date: currentDay.toISOString().slice(0, 10) }) }, }) } />
          <Button title=">" onPress={() => setCurrentDay(d => new Date(d.setDate(d.getDate() + 1)))} />
        </View>
      </View>
    </SafeAreaView>
  );
}
