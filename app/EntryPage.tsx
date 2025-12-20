import { DiaryEntry, useDiary } from "@/hooks/useDiary";
import { dateToTimeString, getCurrentTime, getLocalDateStr, timeStringToDate } from "@/utils/dateUtil";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import { useEffect, useState } from "react";
import { Alert, Button, Platform, Pressable, ScrollView, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ColorPicker from "react-native-wheel-color-picker";

export default function EntryPage() {
  const { addEntry, updateEntry, deleteEntry, getLatestEndTime } = useDiary();

  const params = useSearchParams();
  const router = useRouter();
  const entryJson = params.get("entry");
  const existingEntry: DiaryEntry | null = entryJson ? JSON.parse(entryJson) : null;

  const entryDateStr = existingEntry?.Date || getLocalDateStr(new Date());
  const [name, setName] = useState(existingEntry?.Name || "");
  const [notes, setNotes] = useState(existingEntry?.Notes || "");
  const [startTime, setStartTime] = useState(existingEntry?.StartTime || "00:00:00");
  const [endTime, setEndTime] = useState(existingEntry?.EndTime || getCurrentTime());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [duration, setDuration] = useState(0);
  const [color, setColor] = useState(existingEntry?.Color || "#4CAF50");

  // Пересчёт длительности
  useEffect(() => {
    const [h1, m1] = startTime.split(":").map(Number);
    const [h2, m2] = endTime.split(":").map(Number);
    const startSec = h1 * 3600 + m1 * 60;
    const endSec = h2 * 3600 + m2 * 60;
    setDuration(Math.max(0, endSec - startSec));
  }, [startTime, endTime]);
  // Установка времени начала по последнему времени окончания
  useEffect(() => {
    if (!existingEntry?.Id) {
      getLatestEndTime(timeStringToDate("00:00:00", entryDateStr)).then(latest => {
        setStartTime(latest);
      });
    }
  }, [entryDateStr, existingEntry?.Id, getLatestEndTime]);

  const handleSave = async () => {
    const entryData = {
      Date: entryDateStr,
      Name: name.trim() || "New Entry",
      Notes: notes,
      StartTime: startTime,
      EndTime: endTime,
      Color: color,
    };

    if (existingEntry?.Id) {
      await updateEntry(existingEntry.Id, entryData);
    } else {
      await addEntry(entryData);
    }

    router.back();
  };

  const handleDelete = async () => {
    if (!existingEntry?.Id) return;
    Alert.alert(
      "Подтвердите удаление",
      "Вы уверены, что хотите удалить эту запись?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          onPress: async () => {
            await deleteEntry(existingEntry.Id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, padding: 12 }} contentContainerStyle={{ paddingBottom: 50 }}>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>Title</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Title"
          placeholderTextColor="#999"
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 8,
            marginBottom: 12,
            borderRadius: 5,
          }}
        />

        <Text style={{ fontWeight: "bold", fontSize: 16 }}>Time</Text>

        {/* START */}
        <Pressable
          onPress={() => setShowStartPicker(true)}
          style={{ padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 8 }}
        >
          <Text>Start: {startTime.slice(0, 5)}</Text>
        </Pressable>

        {showStartPicker && (
          <DateTimePicker
            value={timeStringToDate(startTime, entryDateStr)} // ← ключевое исправление!
            mode="time"
            is24Hour
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, selectedDate) => {
              setShowStartPicker(false);
              if (selectedDate) {
                setStartTime(dateToTimeString(selectedDate));
              }
            }}
          />
        )}

        {/* END */}
        <Pressable
          onPress={() => setShowEndPicker(true)}
          style={{ padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5 }}
        >
          <Text>End: {endTime.slice(0, 5)}</Text>
        </Pressable>

        {showEndPicker && (
          <DateTimePicker
            value={timeStringToDate(endTime, entryDateStr)} // ← ключевое исправление!
            mode="time"
            is24Hour
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, selectedDate) => {
              setShowEndPicker(false);
              if (selectedDate) {
                setEndTime(dateToTimeString(selectedDate));
              }
            }}
          />
        )}

        <Text style={{ fontWeight: "bold", fontSize: 16, marginVertical: 12 }}>
          Duration: {Math.floor(duration / 3600).toString().padStart(2, "0")}:
          {Math.floor((duration % 3600) / 60).toString().padStart(2, "0")}
        </Text>
        <Text style={{ fontWeight: "bold", fontSize: 16, marginVertical: 12 }}>
          Date: {entryDateStr}
        </Text>

        <Text style={{ fontWeight: "bold", fontSize: 16 }}>Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes..."
          placeholderTextColor="#999"
          multiline
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 8,
            borderRadius: 5,
            minHeight: 100,
            marginBottom: 12,
            textAlignVertical: "top",
          }}
        />

        <Text style={{ fontWeight: "bold", fontSize: 16, marginVertical: 12 }}>Color</Text>
        <ColorPicker
          color={color}
          thumbSize={30}
          sliderSize={30}
          noSnap={true}
          row={false}
          swatches={true}
          swatchesLast={true}
          onColorChange={setColor}
        />
        <Text style={{ textAlign: "center", marginBottom: 12 }}>Выбранный цвет: {color}</Text>

        <Button title="Save" onPress={handleSave} />
        <Button title="Delete" color="red" onPress={handleDelete} disabled={!existingEntry?.Id} />
      </ScrollView>
    </SafeAreaView>
  );
}