import { DayTimeline } from "@/components/DayTimeline";
import { DiaryEntry, useDiary } from "@/hooks/useDiary";
import { getLocalDateStr } from "@/utils/dateUtil";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Button, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function MainPage() {
  const { entries, loadEntries } = useDiary();
  const [currentDay, setCurrentDay] = useState(new Date());
  const router = useRouter();

  useFocusEffect(useCallback(() => { loadEntries(); }, [loadEntries]));
  useEffect(() => { loadEntries(); }, [currentDay, loadEntries]);

  const headerText = (() => {
    const now = new Date();
    const c = currentDay;

    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (sameDay(c, now)) return 'Сегодняшние записи';

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (sameDay(c, yesterday)) return 'Вчерашние записи';

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (sameDay(c, tomorrow)) return 'Завтрашние записи';

    return `Записи за ${c.toLocaleDateString()}`;
  })();


  const dayEntries = entries.filter(e => e.Date === getLocalDateStr(currentDay));


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
          <Button title="+" onPress={() => router.push({ pathname: "/EntryPage", params: { entry: JSON.stringify({ Date: getLocalDateStr(currentDay) }) }, })} />
          <Button title=">" onPress={() => setCurrentDay(d => new Date(d.setDate(d.getDate() + 1)))} />
        </View>
      </View>
    </SafeAreaView>
  );
}
