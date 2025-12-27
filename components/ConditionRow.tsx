import { AttributePicker } from "@/components/AttributePicker";
import { Operator, SearchCondition } from "@/hooks/useSearch";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { Button, Platform, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";

export type FieldKey = "date" | "name" | "notes" | "attribute";
export type LogicOperator = "AND" | "OR";

type Props = {
  condition: SearchCondition;
  showLogic?: boolean; // показывать AND/OR селектор
  onChange: (patch: Partial<SearchCondition>) => void;
  onRemove: () => void;
};

type FieldConfig = {
  label: string;
  type: "text" | "date" | "attribute";
  operators: Operator[];
};

export const FIELD_CONFIG: Record<FieldKey, FieldConfig> = {
  name: { label: "Название", type: "text", operators: ["contains", "equals"] },
  notes: { label: "Заметки", type: "text", operators: ["contains"] },
  date: { label: "Дата", type: "date", operators: ["equals", "before", "after", "between"] },
  attribute: { label: "Атрибут", type: "attribute", operators: ["in"] },
};

type ValueInputProps = {
  fieldType: FieldConfig["type"];
  operator: Operator;
  value: any;
  onChange: (value: any) => void;
};

function ValueInput({ fieldType, operator, value, onChange }: ValueInputProps) {
const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  if (fieldType === "text") {
    return (
      <TextInput
        placeholder="Введите текст"
        value={value ?? ""}
        onChangeText={onChange}
        style={styles.input}
      />
    );
  }

  if (fieldType === "date") {
    if (operator === "between") {
            return (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button title={value?.from || "С"} onPress={() => setShowFrom(true)} />
          <Button title={value?.to || "По"} onPress={() => setShowTo(true)} />

          {showFrom && (
            <DateTimePicker
              value={value?.from ? new Date(value.from) : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(_: any, selectedDate?: Date) => {
                setShowFrom(Platform.OS === "ios");
                if (selectedDate) onChange({ ...value, from: selectedDate.toISOString().slice(0, 10) });
              }}
            />
          )}

          {showTo && (
            <DateTimePicker
              value={value?.to ? new Date(value.to) : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(_: any, selectedDate?: Date) => {
                setShowTo(Platform.OS === "ios");
                if (selectedDate) onChange({ ...value, to: selectedDate.toISOString().slice(0, 10) });
              }}
            />
          )}
        </View>
      );
    }

    return (
      <Button
        title={value || "Выберите дату"}
        onPress={() => setShowFrom(true)}
      />
    );

  }

  if (fieldType === "attribute") {
    return <AttributePicker value={value ?? []} onChange={onChange} />;
  }

  return null;
}

function operatorLabel(op: Operator) {
  switch (op) {
    case "contains":
      return "содержит";
    case "equals":
      return "равно";
    case "before":
      return "до";
    case "after":
      return "после";
    case "between":
      return "между";
    case "in":
      return "содержит";
  }
}

export function ConditionRow({ condition, showLogic, onChange, onRemove }: Props) {
  const fieldConfig = FIELD_CONFIG[condition.field];

  return (
    <View style={styles.container}>
      {/* Логический оператор AND/OR */}
      {showLogic && (
        <Picker
          selectedValue={condition.logic || "AND"}
          onValueChange={value => onChange({ logic: value })}
          style={{ marginBottom: 4 }}
        >
          <Picker.Item label="AND" value="AND" />
          <Picker.Item label="OR" value="OR" />
        </Picker>
      )}

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {/* NOT */}
        <TouchableOpacity onPress={() => onChange({ negate: !condition.negate })}>
          <Text style={{ fontWeight: "bold", color: condition.negate ? "red" : "#888" }}>
            {condition.negate ? "NOT" : "NOT"}
          </Text>
        </TouchableOpacity>

        {/* Поле */}
        <Picker
          selectedValue={condition.field}
          onValueChange={(value: FieldKey) =>
            onChange({
              field: value,
              operator: FIELD_CONFIG[value].operators[0],
              value: FIELD_CONFIG[value].type === "attribute" ? [] : null,
            })
          }
          style={{ flex: 1 }}
        >
          {Object.entries(FIELD_CONFIG).map(([key, cfg]) => (
            <Picker.Item key={key} label={cfg.label} value={key} />
          ))}
        </Picker>

        {/* Оператор */}
        <Picker
          selectedValue={condition.operator}
          onValueChange={(value: Operator) =>
            onChange({
              operator: value,
              value:
                fieldConfig.type === "attribute"
                  ? []
                  : value === "between"
                  ? { from: "", to: "" }
                  : null,
            })
          }
          style={{ flex: 1 }}
        >
          {fieldConfig.operators.map(op => (
            <Picker.Item key={op} label={operatorLabel(op)} value={op} />
          ))}
        </Picker>
      </View>

      {/* Значение */}
      <ValueInput
        fieldType={fieldConfig.type}
        operator={condition.operator}
        value={condition.value}
        onChange={value => onChange({ value })}
      />

      {/* Удаление */}
      <Pressable onPress={onRemove} style={{ position: "absolute", top: 8, right: 8 }}>
        <Text style={styles.remove}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = {
  container: {
    backgroundColor: "#eee",
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  input: {
    borderBottomWidth: 1,
    padding: 4,
    minWidth: 80,
  },
  remove: {
    color: "red",
    fontSize: 18,
    textAlign: "right" as const,
  },
};
