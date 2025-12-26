import { Attribute, useAttribute } from "@/hooks/useAttribute";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  value: Attribute[];
  onChange: (value: Attribute[]) => void;
};

export function AttributePicker({ value, onChange }: Props) {
  const { attributes } = useAttribute();

  const toggle = (attr: Attribute) => {
    const exists = value.some(a => a.Id === attr.Id);

    if (exists) {
      onChange(value.filter(a => a.Id !== attr.Id));
    } else {
      onChange([...value, attr]);
    }
  };

  return (
    <View style={styles.container}>
      {attributes.map(attr => {
        const selected = value.some(a => a.Id === attr.Id);

        return (
          <Pressable
            key={attr.Id}
            onPress={() => toggle(attr)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? attr.Color : "#ddd",
                opacity: selected ? 1 : 0.6,
              },
            ]}
          >
            <Text style={styles.text}>{attr.Name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  text: {
    color: "#000",
    fontSize: 14,
  },
});
