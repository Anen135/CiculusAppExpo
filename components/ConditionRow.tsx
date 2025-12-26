import { AttributePicker } from "@/components/AttributePicker";
import { Operator, SearchCondition } from "@/hooks/useSearch";
import { Picker } from "@react-native-picker/picker";
import { Pressable, Text, TextInput, View } from "react-native";

export type FieldKey = 'date' | 'name' | 'notes' | 'attribute';

type Props = {
  condition: SearchCondition;
  onChange: (patch: Partial<SearchCondition>) => void;
  onRemove: () => void;
};

type ValueInputProps = {
  fieldType: FieldConfig['type'];
  operator: Operator;
  value: any;
  onChange: (value: any) => void;
};


type FieldConfig = {
  label: string;
  type: 'text' | 'date' | 'attribute';
  operators: Operator[];
};

export const FIELD_CONFIG: Record<FieldKey, FieldConfig> = {
  name: {
    label: 'Название',
    type: 'text',
    operators: ['contains', 'equals'],
  },
  notes: {
    label: 'Заметки',
    type: 'text',
    operators: ['contains'],
  },
  date: {
    label: 'Дата',
    type: 'date',
    operators: ['equals', 'before', 'after', 'between'],
  },
  attribute: {
    label: 'Атрибут',
    type: 'attribute',
    operators: ['in'],
  },
};

function ValueInput({ fieldType, operator, value, onChange }: ValueInputProps) {
  if (fieldType === 'text') {
    return (
      <TextInput
        placeholder="Введите текст"
        value={value ?? ''}
        onChangeText={onChange}
        style={styles.input}
      />
    );
  }

  if (fieldType === 'date') {
    if (operator === 'between') {
      return (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            placeholder="С"
            value={value?.from ?? ''}
            onChangeText={from =>
              onChange({ ...value, from })
            }
            style={styles.input}
          />
          <TextInput
            placeholder="По"
            value={value?.to ?? ''}
            onChangeText={to =>
              onChange({ ...value, to })
            }
            style={styles.input}
          />
        </View>
      );
    }

    return (
      <TextInput
        placeholder="YYYY-MM-DD"
        value={value ?? ''}
        onChangeText={onChange}
        style={styles.input}
      />
    );
  }

   if (fieldType === "attribute") {
    return (
      <AttributePicker
        value={value ?? []}
        onChange={onChange}
      />
    );
  }

  return null;
}

function operatorLabel(op: Operator) {
  switch (op) {
    case 'contains': return 'содержит';
    case 'equals': return 'равно';
    case 'before': return 'до';
    case 'after': return 'после';
    case 'between': return 'между';
    case 'in': return 'содержит';
  }
}


export function ConditionRow({ condition, onChange, onRemove }: Props) {
  const fieldConfig = FIELD_CONFIG[condition.field];

  return (
    <View style={styles.container}>
      {/* Поле */}
      <Picker
        selectedValue={condition.field}
        onValueChange={(value: FieldKey) =>
            onChange({
            field: value,
            operator: FIELD_CONFIG[value].operators[0],
            value: FIELD_CONFIG[value].type === 'attribute' ? [] : null,
            })

        }
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
                fieldConfig.type === 'attribute'
                ? []
                : value === 'between'
                ? { from: '', to: '' }
                : null,
            })
        }
      >
        {fieldConfig.operators.map(op => (
          <Picker.Item key={op} label={operatorLabel(op)} value={op} />
        ))}
      </Picker>

      {/* Значение */}
      <ValueInput
        fieldType={fieldConfig.type}
        operator={condition.operator}
        value={condition.value}
        onChange={(value: any) => onChange({ value })}
      />

      {/* Удаление */}
      <Pressable onPress={onRemove}>
        <Text style={styles.remove}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = {
  container: {
    backgroundColor: '#eee',
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
    color: 'red',
    fontSize: 18,
    textAlign: 'right' as const,
  },
};
