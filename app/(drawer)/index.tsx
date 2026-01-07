import { DayDiary } from "@/components/DayDiary";
import { DayTimeline } from "@/components/DayTimeline";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/context/ThemeContext";
import { DiaryEntry, useDiary } from "@/hooks/useDiary";
import { useLocalization } from "@/hooks/useLocalization";
import { getLocalDateStr } from "@/utils/dateUtil";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MainPage() {
  const { entries, loadEntries } = useDiary();
  const [currentDay, setCurrentDay] = useState(new Date());
  const router = useRouter();

  const { colors } = useTheme();
  const { dayTimelineViewMode } = useSettings();
  const { t } = useLocalization(); // 👈 новый API

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  useEffect(() => {
    loadEntries();
  }, [currentDay, loadEntries]);

  const headerText = useMemo(() => {
    const now = new Date();
    const c = currentDay;

    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (sameDay(c, now)) return t("main.todayEntry");

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (sameDay(c, yesterday)) return t("main.yesterdayEntry");

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (sameDay(c, tomorrow)) return t("main.tomorrowEntry");

    return `${t("main.records_for_date")} ${getLocalDateStr(c)}`;
  }, [currentDay, t]);

  const dayEntries = useMemo(
    () => entries.filter(e => e.Date === getLocalDateStr(currentDay)),
    [entries, currentDay]
  );

  const renderItem = ({ item }: { item: DiaryEntry }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/entry",
          params: { entry: JSON.stringify(item) },
        })
      }
      style={{
        flexDirection: "row",
        padding: 10,
        backgroundColor: colors.card,
        marginVertical: 4,
        borderRadius: 5,
      }}
    >
      <Text
        style={{
          fontWeight: "bold",
          width: 100,
          color: colors.cardItemText,
        }}
      >
        {item.StartTime} – {item.EndTime}
      </Text>
      <Text style={{ flex: 1, color: colors.cardItemText }}>
        {item.Name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          padding: 10,
          backgroundColor: colors.background,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 10,
            color: colors.text,
          }}
        >
          {headerText}
        </Text>

        {dayTimelineViewMode === "v1" ? (
          <DayTimeline entries={dayEntries} />
        ) : (
          <DayDiary entries={dayEntries} />
        )}

        <FlatList
          data={dayEntries}
          keyExtractor={item => item.Id.toString()}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: "center",
                fontSize: 16,
                marginVertical: 20,
                color: "#666",
              }}
            >
              {t("main.noEntries")}
            </Text>
          }
          renderItem={renderItem}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          <Button
            title="<"
            onPress={() =>
              setCurrentDay(d => new Date(d.setDate(d.getDate() - 1)))
            }
          />
          <Button
            title="+"
            onPress={() =>
              router.push({
                pathname: "/entry",
                params: {
                  entry: JSON.stringify({
                    Date: getLocalDateStr(currentDay),
                  }),
                },
              })
            }
          />
          <Button
            title=">"
            onPress={() =>
              setCurrentDay(d => new Date(d.setDate(d.getDate() + 1)))
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
