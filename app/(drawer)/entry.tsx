import { PRESET_COLORS } from "@/constants/presetColors";
import { useSettings } from "@/context/SettingsСontext";
import { Attribute, useAttribute } from "@/hooks/useAttribute";
import { DiaryEntry, useDiary } from "@/hooks/useDiary";
import { dateToTimeString, getCurrentTime, getLocalDateStr, timeStringToDate } from "@/utils/dateUtil";
import i18n from "@/utils/i18n";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import { useEffect, useState } from "react";
import { Alert, Button, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ColorPicker from "react-native-wheel-color-picker";

export default function EntryPage() {
  const { addEntry, updateEntry, deleteEntry, getLatestEndTime, last_insert_id } = useDiary();

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

  const { attributes: allAttributes, setAttributesForEntry, getAttributesForEntry} = useAttribute();
  const [selectedAttributes, setSelectedAttributes] = useState<Attribute[]>([]);

  const { colorSelectMode } = useSettings();

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

  useEffect(() => {
    if (existingEntry?.Id) {
      getAttributesForEntry(existingEntry.Id).then(attr => setSelectedAttributes(attr));
    }
  }, [existingEntry?.Id]);


  // синхронизация после загрузки existingEntry
  useEffect(() => {
    if (existingEntry?.Name) {
      setName(existingEntry.Name);
    }
  }, [existingEntry?.Name]);


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
      await setAttributesForEntry(existingEntry.Id, selectedAttributes);
    } else {
      await addEntry(entryData);
      const newId = await last_insert_id();
      await setAttributesForEntry(newId, selectedAttributes);
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

  const toggleAttribute = (attr: Attribute) => {
    setSelectedAttributes(prev =>
      prev.some(a => a.Id === attr.Id)
        ? prev.filter(a => a.Id !== attr.Id)
        : [...prev, attr]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, padding: 12 }} contentContainerStyle={{ paddingBottom: 50 }}>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>{i18n.t('title')}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={i18n.t('entry.newEntry')}
          placeholderTextColor="#999"
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 8,
            marginBottom: 12,
            borderRadius: 5,
          }}
        />

        <Text style={{ fontWeight: "bold", fontSize: 16, marginVertical: 12 }}>Атрибуты</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {allAttributes.map(attr => (
            <Pressable
              key={attr.Id}
              onPress={() => toggleAttribute(attr)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                borderWidth: selectedAttributes.some(a => a.Id === attr.Id) ? 2 : 1,
                borderColor: selectedAttributes.some(a => a.Id === attr.Id) ? "#000" : "#ccc",
                backgroundColor: attr.Color,
                marginBottom: 4,
              }}
            >
              <Text style={{ color: "#fff" }}>{attr.Name}</Text>
            </Pressable>
          ))}
        </View>


        <Text style={{ fontWeight: "bold", fontSize: 16 }}>{i18n.t('time')}</Text>

        {/* START */}
        <Pressable
          onPress={() => setShowStartPicker(true)}
          style={{ padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 8 }}
        >
          <Text>{i18n.t('start')}: {startTime.slice(0, 5)}</Text>
        </Pressable>

        {showStartPicker && (
          <DateTimePicker
            value={timeStringToDate(startTime, entryDateStr)} 
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
          <Text>{i18n.t('end')}: {endTime.slice(0, 5)}</Text>
        </Pressable>

        {showEndPicker && (
          <DateTimePicker
            value={timeStringToDate(endTime, entryDateStr)}
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
          {i18n.t('duration')}: {Math.floor(duration / 3600).toString().padStart(2, "0")}:
          {Math.floor((duration % 3600) / 60).toString().padStart(2, "0")}
        </Text>
        <Text style={{ fontWeight: "bold", fontSize: 16, marginVertical: 12 }}>
          {i18n.t('date')}: {entryDateStr}
        </Text>

        <Text style={{ fontWeight: "bold", fontSize: 16 }}>{i18n.t('notes')}</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder={i18n.t('notes')}
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

        <Text style={{ fontWeight: "bold", fontSize: 16, marginVertical: 12 }}>
  {i18n.t("color")}
</Text>

{colorSelectMode === "palette" && (
  <>
    <ColorPicker
      color={color}
      thumbSize={30}
      sliderSize={30}
      noSnap
      row={false}
      swatches
      swatchesLast
      onColorChange={setColor}
    />
    <Text style={{ textAlign: "center" }}>
      {i18n.t("entry.selectedColor")}: {color}
    </Text>
  </>
)}

{colorSelectMode === "preset" && (
  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
    {PRESET_COLORS.map(c => (
      <Pressable
        key={c}
        onPress={() => setColor(c)}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: c,
          borderWidth: color === c ? 3 : 1,
          borderColor: color === c ? "#000" : "#ccc",
        }}
      />
    ))}
  </View>
)}

        <Button title={i18n.t('save')} onPress={handleSave} />
        <Button title={i18n.t('delete')} color="red" onPress={handleDelete} disabled={!existingEntry?.Id} />
      </ScrollView>
    </SafeAreaView>
  );
}