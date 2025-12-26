/* eslint-disable @typescript-eslint/no-unused-vars */
import { DiaryEntry } from "@/hooks/useDiary";
import { describeArc, timeToAngle } from "@/utils/DayTimeLineUtil";
import i18n from "@/utils/i18n";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Defs, G, Path, Pattern, Rect } from "react-native-svg";


interface DayTimelineProps {
  entries: DiaryEntry[];
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
}

// вычисляем все пересечения
function setOverLaps(overlaps: { start: number; end: number; entries: DiaryEntry[] }[], entries: DiaryEntry[]) {
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const start1 = timeToAngle(entries[i].StartTime);
      const end1 = timeToAngle(entries[i].EndTime);
      const start2 = timeToAngle(entries[j].StartTime);
      const end2 = timeToAngle(entries[j].EndTime);

      const startOverlap = Math.max(start1, start2);
      const endOverlap = Math.min(end1, end2);

      if (startOverlap < endOverlap) {
        // ищем все записи, которые пересекаются в этом диапазоне
        const overlappedEntries = entries.filter((e) => {
          const s = timeToAngle(e.StartTime);
          const e_ = timeToAngle(e.EndTime);
          return !(e_ <= startOverlap || s >= endOverlap);
        });
        overlaps.push({ start: startOverlap, end: endOverlap, entries: overlappedEntries });
      }
    }
  }
}

function getTotalCoveredMinutes(entries: DiaryEntry[]): number {
  if (entries.length === 0) return 0;

  // Преобразуем в минуты от 0 до 1440 (24 * 60)
  const intervals = entries.map(e => {
    const [h1, m1] = e.StartTime.split(':').map(Number);
    const [h2, m2] = e.EndTime.split(':').map(Number);
    let start = h1 * 60 + m1;
    let end = h2 * 60 + m2;
    if (end <= start) end += 24 * 60; // пересекает полночь
    return [start, end] as [number, number];
  });

  // Сортируем по началу
  intervals.sort((a, b) => a[0] - b[0]);

  // Объединяем
  const merged: [number, number][] = [];
  let [curStart, curEnd] = intervals[0];

  for (let i = 1; i < intervals.length; i++) {
    const [start, end] = intervals[i];
    if (start <= curEnd) {
      curEnd = Math.max(curEnd, end);
    } else {
      merged.push([curStart, curEnd]);
      curStart = start;
      curEnd = end;
    }
  }
  merged.push([curStart, curEnd]);

  // Суммируем, учитывая возможный переход через полночь
  let total = 0;
  for (const [start, end] of merged) {
    if (end > 24 * 60) {
      total += (24 * 60 - start) + (end - 24 * 60);
    } else {
      total += end - start;
    }
  }

  return total;
}

export const DayTimeline: React.FC<DayTimelineProps> = ({ entries, size = 150, strokeWidth = 10, backgroundColor = "#eee", }) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  const [tooltip, setTooltip] = useState<{ names: string[]; visible: boolean }>({ names: [], visible: false, });

  // вычисляем все пересечения
  const overlaps: { start: number; end: number; entries: DiaryEntry[] }[] = [];
  setOverLaps(overlaps, entries);

  const coveredMinutes = getTotalCoveredMinutes(entries);
  const freeMinutes = 24 * 60 - coveredMinutes;
  const coveredPercent = Math.round((coveredMinutes / (24 * 60)) * 100);

  const getEntriesAtAngle = (angle: number) => {
    return entries.filter((entry) => {
      const start = timeToAngle(entry.StartTime);
      const end = timeToAngle(entry.EndTime);
      if (end < start) return angle >= start || angle <= end;
      return angle >= start && angle <= end;
    });
  };

  const handlePress = (startAngle: number, endAngle: number) => {
    const midAngle = (startAngle + endAngle) / 2;
    const selected = getEntriesAtAngle(midAngle);
    setTooltip({ names: selected.map((e) => e.Name), visible: true });
  };

  return (
    <View style={{ alignItems: "center", marginVertical: 20 }}>
      <Svg width={size} height={size}>
        <Defs>
          {/* паттерн полосок для пересечений */}
          <Pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <Rect x="0" y="0" width="2" height="4" fill="rgba(0,0,0,0.2)" />
          </Pattern>
        </Defs>

        {/* фон */}
        <Circle cx={center} cy={center} r={radius} stroke={backgroundColor} strokeWidth={strokeWidth} fill="none" />

        {/* сегменты записей */}
        {entries.map((entry, index) => {
          const startAngle = timeToAngle(entry.StartTime);
          const endAngle = timeToAngle(entry.EndTime);
          const path = describeArc(center, center, radius, startAngle, endAngle);
          return (
            <G key={index}>
              <Path
                d={path}
                stroke={entry.Color || "#4CAF50"}
                strokeWidth={strokeWidth}
                fill="none"
                onPress={() => handlePress(startAngle, endAngle)}
              />
            </G>
          );
        })}

        {/* пересечения */}
        {overlaps.map((overlap, index) => {
          const path = describeArc(center, center, radius, overlap.start, overlap.end);
          return (
            <Path
              key={"overlap-" + index}
              d={path}
              stroke="url(#hatch)"
              strokeWidth={strokeWidth}
              fill="none"
              onPress={() =>
                setTooltip({ names: overlap.entries.map((e) => e.Name), visible: true })
              }
            />
          );
        })}
      </Svg>

        {/* Центральный текст */}
      <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: size, justifyContent: 'center', alignItems: 'center', }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
          {coveredMinutes} / {24 * 60} {i18n.t('minutes')}
        </Text>
        <Text style={{ fontSize: 12, color: '#666' }}>
          {coveredPercent}%
        </Text>
      </View>

      {/* тултип */}
      <Modal transparent visible={tooltip.visible} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setTooltip({ names: [], visible: false })}
        >
          <View style={styles.tooltip}>
            {tooltip.names.map((n, i) => (
              <Text key={i}>{n}</Text>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  tooltip: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    maxWidth: "80%",
    alignItems: "center",
  },
});
