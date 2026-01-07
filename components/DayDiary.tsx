/* eslint-disable @typescript-eslint/no-unused-vars */
import { DiaryEntry } from "@/hooks/useDiary";
import { useLocalization } from "@/hooks/useLocalization"; // 👈 новый hook
import { describeArc, timeToAngle } from "@/utils/DayTimeLineUtil";
import React, { useEffect, useState } from "react";
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

    const intervals = entries.map(e => {
        const [h1, m1] = e.StartTime.split(':').map(Number);
        const [h2, m2] = e.EndTime.split(':').map(Number);
        let start = h1 * 60 + m1;
        let end = h2 * 60 + m2;
        if (end <= start) end += 24 * 60;
        return [start, end] as [number, number];
    });

    intervals.sort((a, b) => a[0] - b[0]);

    const merged: [number, number][] = [];
    let [curStart, curEnd] = intervals[0];

    for (let i = 1; i < intervals.length; i++) {
        const [start, end] = intervals[i];
        if (start <= curEnd) curEnd = Math.max(curEnd, end);
        else {
            merged.push([curStart, curEnd]);
            curStart = start;
            curEnd = end;
        }
    }
    merged.push([curStart, curEnd]);

    let total = 0;
    for (const [start, end] of merged) {
        if (end > 24 * 60) total += (24 * 60 - start) + (end - 24 * 60);
        else total += end - start;
    }

    return total;
}

export const DayDiary: React.FC<DayTimelineProps> = ({ entries, size = 150, strokeWidth = 10, backgroundColor = "#eee" }) => {
    const { t } = useLocalization(); // 👈 реактивный перевод

    const radius = (size - strokeWidth) / 2;
    const center = size / 2;

    const [tooltip, setTooltip] = useState<{ names: string[]; visible: boolean }>({ names: [], visible: false });

    // пересечения
    const overlaps: { start: number; end: number; entries: DiaryEntry[] }[] = [];
    setOverLaps(overlaps, entries);

    const coveredMinutes = getTotalCoveredMinutes(entries);
    const freeMinutes = 24 * 60 - coveredMinutes;
    const coveredPercent = Math.round((coveredMinutes / (24 * 60)) * 100);

    const [nowAngle, setNowAngle] = useState<number>(() => {
        const now = new Date();
        return timeToAngle(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`);
    });

    const [nowTime, setNowTime] = useState<string>(() => {
        const now = new Date();
        return now.toLocaleTimeString("ru-RU", { hour12: false });
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
            setNowAngle(timeToAngle(timeStr));
            setNowTime(now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const dotRadius = radius;
    const dotAngleRad = ((nowAngle - 90) * Math.PI) / 180;
    const dotX = center + dotRadius * Math.cos(dotAngleRad);
    const dotY = center + dotRadius * Math.sin(dotAngleRad);

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
                    <Pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <Rect x="0" y="0" width="2" height="4" fill="rgba(0,0,0,0.2)" />
                    </Pattern>
                </Defs>

                <Circle cx={center} cy={center} r={radius} stroke={backgroundColor} strokeWidth={strokeWidth} fill="none" />

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

                <Circle cx={dotX} cy={dotY} r={strokeWidth / 2} fill="white" stroke="black" strokeWidth={2} />
            </Svg>

            <View
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: size,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>{nowTime}</Text>
                <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    {t("main.current_time")} {/* 👈 новый API */}
                </Text>
            </View>

            <Modal transparent visible={tooltip.visible} animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setTooltip({ names: [], visible: false })}>
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
