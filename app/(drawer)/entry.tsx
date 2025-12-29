import { AttributePicker } from "@/components/AttributePicker";
import { PRESET_COLORS } from "@/constants/presetColors";
import { useSettings } from "@/context/SettingsСontext";
import { Attribute, useAttribute } from "@/hooks/useAttribute";
import { useDiary } from "@/hooks/useDiary";
import { useLogger } from "@/hooks/useLogger";
import { cancelNotificationForEntry, scheduledNotification, storeNotificationId } from "@/hooks/useNotification";
import { dateToTimeString, getCurrentTime, timeStringToDate } from "@/utils/dateUtil";
import i18n from "@/utils/i18n";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ColorPicker from "react-native-wheel-color-picker";

export default function EntryPage() {
  // hooks
  const { addEntry, updateEntry, deleteEntry, getLatestEndTime, last_insert_id } = useDiary();
  const { setAttributesForEntry, getAttributesForEntry } = useAttribute();
  const { colorSelectMode } = useSettings();
  const router = useRouter();
  const params = useSearchParams();
  const { logError } = useLogger();


  // Memo
  const entryJson = useMemo(() => params.get("entry"), [params]);
  const parsedEntry = useMemo(() => (entryJson ? JSON.parse(entryJson) : null), [entryJson]);

  // State
  // Объекты для всех данных записи
  const [diaryEntry, setDiaryEntry] = useState({
    Name: "",
    Notes: "",
    StartTime: "00:00:00",
    EndTime: getCurrentTime(),
    Color: "#4CAF50",
  });
  const [selectedAttributes, setSelectedAttributes] = useState<Attribute[]>([]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [duration, setDuration] = useState(0);

  // UseEffect - загрузка данных
useEffect(() => {
  const loadData = async () => {
    try {
      setDiaryEntry({
        Name: parsedEntry?.Name || "",
        Notes: parsedEntry?.Notes || "",
        StartTime: parsedEntry?.StartTime || "00:00:00",
        EndTime: parsedEntry?.EndTime || getCurrentTime(),
        Color: parsedEntry?.Color || "#4CAF50",
      });

      if (parsedEntry?.Id) {
        const attr = await getAttributesForEntry(parsedEntry.Id);
        setSelectedAttributes(attr);
      } else {
        setSelectedAttributes([]);
        const latest = await getLatestEndTime(
          timeStringToDate("00:00:00", parsedEntry?.Date)
        );
        setDiaryEntry(prev => ({ ...prev, StartTime: latest }));
      }
    } catch (e) {
      logError(e, "EntryPage/useEffect loadData");
    }
  };

  loadData();
}, [getAttributesForEntry, getLatestEndTime, parsedEntry]);


  // UseEffect - Пересчет длительности
  useEffect(() => {
    const [h1, m1] = diaryEntry.StartTime.split(":").map(Number);
    const [h2, m2] = diaryEntry.EndTime.split(":").map(Number);
    const startSec = h1 * 3600 + m1 * 60;
    const endSec = h2 * 3600 + m2 * 60;
    setDuration(Math.max(0, endSec - startSec));
  }, [diaryEntry.StartTime, diaryEntry.EndTime]);


  // Handlers
  const handleSave = async () => {
  try {
    const entryData = {
      ...diaryEntry,
      Name: diaryEntry.Name.trim() || "New Entry",
      Date: parsedEntry.Date,
    };

    let entryId;

    if (parsedEntry?.Id) {
      // === РЕДАКТИРОВАНИЕ ===
      entryId = parsedEntry.Id;

      await cancelNotificationForEntry(entryId);
      await updateEntry(entryId, entryData);
      await setAttributesForEntry(entryId, selectedAttributes);

      const [year, month, day] = parsedEntry.Date.split('-').map(Number);
      const [hour, minute] = diaryEntry.StartTime.split(':').map(Number);
      const notificationDate = new Date(year, month - 1, day, hour, minute);

      if (notificationDate.getTime() > Date.now()) {
        const notificationId = await scheduledNotification(
          entryData.Name,
          entryData.Notes || `Начало в ${diaryEntry.StartTime.slice(0, 5)}`,
          notificationDate,
          { entryId }
        );

        if (notificationId) {
          await storeNotificationId(entryId, notificationId);
        }
      }
    } else {
      // === СОЗДАНИЕ ===
      await addEntry(entryData);

      entryId = await last_insert_id();
      if (!entryId) {
        throw new Error("last_insert_id returned null/undefined");
      }

      await setAttributesForEntry(entryId, selectedAttributes);

      const [year, month, day] = entryData.Date.split('-').map(Number);
      const [hour, minute] = diaryEntry.StartTime.split(':').map(Number);
      const notificationDate = new Date(year, month - 1, day, hour, minute);

      if (notificationDate.getTime() > Date.now()) {
        const notificationId = await scheduledNotification(
          entryData.Name,
          entryData.Notes || `Начало в ${diaryEntry.StartTime.slice(0, 5)}`,
          notificationDate,
          { entryId }
        );

        if (notificationId) {
          await storeNotificationId(entryId, notificationId);
        }
      }
    }

    router.back();
  } catch (e) {
    logError(e, "EntryPage/handleSave");
  }
};


  const handleDelete = async () => {
  if (!parsedEntry?.Id) return;

  Alert.alert(
    "Подтвердите удаление",
    "Вы уверены, что хотите удалить эту запись?",
    [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        onPress: async () => {
          try {
            const entryId = parsedEntry.Id;

            await cancelNotificationForEntry(entryId);
            await deleteEntry(entryId);

            router.back();
          } catch (e) {
            logError(e, "EntryPage/handleDelete");
          }
        },
      },
    ]
  );
};


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, padding: 12 }} contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Header */}
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>{i18n.t('title')}</Text>
        <TextInput
          value={diaryEntry.Name}
          onChangeText={text => setDiaryEntry(prev => ({ ...prev, Name: text }))}
          placeholder={i18n.t('entry.newEntry')}
          placeholderTextColor="#999"
          style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 12, borderRadius: 5 }}
        />
        {/* Attributes */}
        <Text style={{ fontWeight: "bold", fontSize: 16, marginVertical: 12 }}>{i18n.t('attributes.attributes')}</Text>
        <AttributePicker value={selectedAttributes} onChange={setSelectedAttributes} />

        {/* Time Start*/}
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>{i18n.t('time')}</Text>
        <Pressable onPress={() => setShowStartPicker(true)} style={{ padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 8 }} >
          <Text>{i18n.t('start')}: {diaryEntry.StartTime.slice(0, 5)}</Text>
        </Pressable>
        {showStartPicker && (
          <DateTimePicker
            value={timeStringToDate(diaryEntry.StartTime, parsedEntry?.Date)}
            mode="time"
            is24Hour
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, selectedDate) => {
              setShowStartPicker(false);
              if (selectedDate) setDiaryEntry(prev => ({ ...prev, StartTime: dateToTimeString(selectedDate) }));
            }}
          />
        )}

        {/* Time End*/}
        <Pressable onPress={() => setShowEndPicker(true)} style={{ padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5 }} >
          <Text>{i18n.t('end')}: {diaryEntry.EndTime.slice(0, 5)}</Text>
        </Pressable>
        {showEndPicker && (
          <DateTimePicker
            value={timeStringToDate(diaryEntry.EndTime, parsedEntry?.Date)}
            mode="time"
            is24Hour
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, selectedDate) => {
              setShowEndPicker(false);
              if (selectedDate) setDiaryEntry(prev => ({ ...prev, EndTime: dateToTimeString(selectedDate) }));
            }}
          />
        )}

        {/* Duration */}
        <View style={{ marginVertical: 12 }}>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {i18n.t('duration')}: {Math.floor(duration / 3600).toString().padStart(2, "0")}:
            {Math.floor((duration % 3600) / 60).toString().padStart(2, "0")}
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {i18n.t('date')}: {parsedEntry?.Date}
          </Text>
        </View>

        {/* Notes */}
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>{i18n.t('notes')}</Text>
        <TextInput
          value={diaryEntry.Notes}
          onChangeText={text => setDiaryEntry(prev => ({ ...prev, Notes: text }))}
          placeholder={i18n.t('notes')}
          placeholderTextColor="#999"
          multiline
          style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 5, minHeight: 100, marginBottom: 12, textAlignVertical: "top" }}
        />

        {/* Color */}
        <Text style={{ fontWeight: "bold", fontSize: 16, marginVertical: 12 }}>{i18n.t("color")}</Text>
        {colorSelectMode === "palette" && (
          <>
            <ColorPicker
              color={diaryEntry.Color}
              thumbSize={30}
              sliderSize={30}
              noSnap
              row={false}
              swatches
              swatchesLast
              onColorChange={color => setDiaryEntry(prev => ({ ...prev, Color: color }))}
            />
            <Text style={{ textAlign: "center" }}>
              {i18n.t("entry.selectedColor")}: {diaryEntry.Color}
            </Text>
          </>
        )}

        {colorSelectMode === "preset" && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {PRESET_COLORS.map(c => (
              <Pressable
                key={c}
                onPress={() => setDiaryEntry(prev => ({ ...prev, Color: c }))}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: c,
                  borderWidth: diaryEntry.Color === c ? 3 : 1,
                  borderColor: diaryEntry.Color === c ? "#000" : "#ccc",
                }}
              />
            ))}
          </View>
        )}

        {/* Buttons */}
        <Button title={i18n.t('save')} onPress={handleSave} />
        <Button title={i18n.t('delete')} color="red" onPress={handleDelete} disabled={!parsedEntry?.Id} />
      </ScrollView>
    </SafeAreaView>
  );
}
