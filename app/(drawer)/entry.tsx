import { AttributePicker } from "@/components/AttributePicker";
import { PRESET_COLORS } from "@/constants/presetColors";
import { useSettings } from "@/context/SettingsContext";
import { Attribute, useAttribute } from "@/hooks/useAttribute";
import { useDiary } from "@/hooks/useDiary";
import { useLocalization } from "@/hooks/useLocalization";
import { useLogger } from "@/hooks/useLogger";
import {
  cancelNotificationForEntry,
  scheduledNotification,
  storeNotificationId,
} from "@/hooks/useNotification";
import {
  dateToTimeString,
  getCurrentTime,
  timeStringToDate,
} from "@/utils/dateUtil";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ColorPicker from "react-native-wheel-color-picker";

export default function EntryPage() {
  /* ---------- hooks ---------- */

  const { addEntry, updateEntry, deleteEntry, getLatestEndTime, last_insert_id } =
    useDiary();
  const { setAttributesForEntry, getAttributesForEntry } = useAttribute();
  const { colorSelectMode } = useSettings();
  const { logError } = useLogger();
  const { t } = useLocalization(); // 👈 новый API

  const router = useRouter();
  const params = useSearchParams();

  /* ---------- memo ---------- */

  const entryJson = useMemo(() => params.get("entry"), [params]);
  const parsedEntry = useMemo(
    () => (entryJson ? JSON.parse(entryJson) : null),
    [entryJson]
  );

  /* ---------- state ---------- */

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

  /* ---------- effects ---------- */

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
        logError(e, "EntryPage/loadData");
      }
    };

    loadData();
  }, [getAttributesForEntry, getLatestEndTime, parsedEntry, logError]);

  useEffect(() => {
    const [h1, m1] = diaryEntry.StartTime.split(":").map(Number);
    const [h2, m2] = diaryEntry.EndTime.split(":").map(Number);
    const startSec = h1 * 3600 + m1 * 60;
    const endSec = h2 * 3600 + m2 * 60;
    setDuration(Math.max(0, endSec - startSec));
  }, [diaryEntry.StartTime, diaryEntry.EndTime]);

  /* ---------- handlers ---------- */

  const handleSave = async () => {
    try {
      const entryData = {
        ...diaryEntry,
        Name: diaryEntry.Name.trim() || t("entry.newEntry"),
        Date: parsedEntry.Date,
      };

      let entryId: number;

      if (parsedEntry?.Id) {
        entryId = parsedEntry.Id;

        await cancelNotificationForEntry(entryId);
        await updateEntry(entryId, entryData);
        await setAttributesForEntry(entryId, selectedAttributes);
      } else {
        await addEntry(entryData);
        entryId = await last_insert_id();

        if (!entryId) {
          throw new Error("last_insert_id returned null");
        }

        await setAttributesForEntry(entryId, selectedAttributes);
      }

      const [year, month, day] = entryData.Date.split("-").map(Number);
      const [hour, minute] = diaryEntry.StartTime.split(":").map(Number);
      const notificationDate = new Date(year, month - 1, day, hour, minute);

      if (notificationDate.getTime() > Date.now()) {
        const notificationId = await scheduledNotification(
          entryData.Name,
          entryData.Notes ||
            t("entry.notificationStart", {
              time: diaryEntry.StartTime.slice(0, 5),
            }),
          notificationDate,
          { entryId }
        );

        if (notificationId) {
          await storeNotificationId(entryId, notificationId);
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
      t("entry.confirmDelete.title"),
      t("entry.confirmDelete.message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await cancelNotificationForEntry(parsedEntry.Id);
              await deleteEntry(parsedEntry.Id);
              router.back();
            } catch (e) {
              logError(e, "EntryPage/handleDelete");
            }
          },
        },
      ]
    );
  };

  /* ---------- render ---------- */

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, padding: 12 }}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          {t("entry.title")}
        </Text>

        <TextInput
          value={diaryEntry.Name}
          onChangeText={text =>
            setDiaryEntry(prev => ({ ...prev, Name: text }))
          }
          placeholder={t("entry.newEntry")}
          placeholderTextColor="#999"
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 8,
            marginBottom: 12,
            borderRadius: 5,
          }}
        />

        <Text style={{ fontWeight: "bold", fontSize: 16, marginVertical: 12 }}>
          {t("attributes.attributes")}
        </Text>
        <AttributePicker
          value={selectedAttributes}
          onChange={setSelectedAttributes}
        />

        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          {t("time")}
        </Text>

        <Pressable
          onPress={() => setShowStartPicker(true)}
          style={{
            padding: 10,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 5,
            marginBottom: 8,
          }}
        >
          <Text>
            {t("start")}: {diaryEntry.StartTime.slice(0, 5)}
          </Text>
        </Pressable>

        {showStartPicker && (
          <DateTimePicker
            value={timeStringToDate(
              diaryEntry.StartTime,
              parsedEntry?.Date
            )}
            mode="time"
            is24Hour
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, selectedDate) => {
              setShowStartPicker(false);
              if (selectedDate) {
                setDiaryEntry(prev => ({
                  ...prev,
                  StartTime: dateToTimeString(selectedDate),
                }));
              }
            }}
          />
        )}

        <Pressable
          onPress={() => setShowEndPicker(true)}
          style={{
            padding: 10,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 5,
          }}
        >
          <Text>
            {t("end")}: {diaryEntry.EndTime.slice(0, 5)}
          </Text>
        </Pressable>

        {showEndPicker && (
          <DateTimePicker
            value={timeStringToDate(diaryEntry.EndTime, parsedEntry?.Date)}
            mode="time"
            is24Hour
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, selectedDate) => {
              setShowEndPicker(false);
              if (selectedDate) {
                setDiaryEntry(prev => ({
                  ...prev,
                  EndTime: dateToTimeString(selectedDate),
                }));
              }
            }}
          />
        )}

        <View style={{ marginVertical: 12 }}>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {t("duration")}:{" "}
            {Math.floor(duration / 3600)
              .toString()
              .padStart(2, "0")}
            :
            {Math.floor((duration % 3600) / 60)
              .toString()
              .padStart(2, "0")}
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {t("date")}: {parsedEntry?.Date}
          </Text>
        </View>

        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          {t("notes")}
        </Text>
        <TextInput
          value={diaryEntry.Notes}
          onChangeText={text =>
            setDiaryEntry(prev => ({ ...prev, Notes: text }))
          }
          placeholder={t("notes")}
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
          {t("color")}
        </Text>

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
              onColorChange={color =>
                setDiaryEntry(prev => ({ ...prev, Color: color }))
              }
            />
            <Text style={{ textAlign: "center" }}>
              {t("entry.selectedColor")}: {diaryEntry.Color}
            </Text>
          </>
        )}

        {colorSelectMode === "preset" && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {PRESET_COLORS.map(c => (
              <Pressable
                key={c}
                onPress={() =>
                  setDiaryEntry(prev => ({ ...prev, Color: c }))
                }
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: c,
                  borderWidth: diaryEntry.Color === c ? 3 : 1,
                  borderColor:
                    diaryEntry.Color === c ? "#000" : "#ccc",
                }}
              />
            ))}
          </View>
        )}

        <Button title={t("common.save")} onPress={handleSave} />
        <Button
          title={t("common.delete")}
          color="red"
          onPress={handleDelete}
          disabled={!parsedEntry?.Id}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
