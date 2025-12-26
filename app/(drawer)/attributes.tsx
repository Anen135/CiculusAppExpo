import { PRESET_COLORS } from "@/constants/presetColors";
import { useSettings } from "@/context/SettingsСontext";
import { useTheme } from "@/context/ThemeContext";
import { Attribute, useAttribute } from "@/hooks/useAttribute";
import i18n from "@/utils/i18n";
import { useState } from "react";
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import ColorPicker from "react-native-wheel-color-picker";


export default function AttributesPage() {
  const { attributes, loadAttributes, addAttribute, updateAttribute, deleteAttribute } = useAttribute();
  const { colors } = useTheme();
  const { colorSelectMode } = useSettings();

  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#888888");

  

  const openModal = (attr: Attribute) => {
    setSelectedAttribute(attr);
    setName(attr.Name);
    setColor(attr.Color);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (selectedAttribute) {
      await updateAttribute(selectedAttribute.Id, name || ("Attribute" + selectedAttribute.Id), color);
      await loadAttributes();
      setModalVisible(false);
    }
  };

  const handleAddAttribute = async () => {
    await addAttribute(`Атрибут ${attributes.length + 1}`, "#888888");
    await loadAttributes();
  };

  const handleDeleteAttribute = async (id: number) => {
    Alert.alert(
      "Подтвердите удаление",
      "Вы уверены, что хотите удалить этот атрибут?",
      [
        { text: "Отмена", style: "cancel" },
        { text: "Удалить", style: "destructive", onPress: async () => {
            await deleteAttribute(id);
            await loadAttributes();
            setModalVisible(false);
          }
        },
      ]);
    };

  const renderItem = ({ item }: { item: Attribute }) => (
    <TouchableOpacity onPress={() => openModal(item)}>
      <View style={[styles.itemContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.itemText, { color: colors.text }]}>{item.Name}</Text>
        <Svg height="20" width="20">
          <Circle cx="10" cy="10" r="10" fill={item.Color} />
        </Svg>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={attributes}
        keyExtractor={(item) => item.Id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* Плавающая кнопка */}
      <TouchableOpacity
        onPress={handleAddAttribute}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Модальное окно */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                {i18n.t("attributes.editAttribute")}
                </Text>
                {/* delete */}
                <Text style={{ color: 'red', position: 'absolute', right: 0, top: 0 }} onPress={() => {
                  if (selectedAttribute) {
                    handleDeleteAttribute(selectedAttribute.Id);
                    setModalVisible(false);
                  }
                }}>🗑️</Text>
            </View>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={i18n.t("attributes.name")}
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.text },
              ]}
            />

            <Text style={{ color: colors.text, marginVertical: 8 }}>
              {i18n.t("attributes.color")}
            </Text>

            {colorSelectMode === "palette" ? (
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
                <Text style={{ textAlign: "center", color: colors.text }}>
                  {i18n.t("entry.selectedColor")}: {color}
                </Text>
              </>
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {PRESET_COLORS.map((c) => (
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
                      marginBottom: 8,
                    }}
                  />
                ))}
              </View>
            )}

            <TouchableOpacity
              onPress={handleSave}
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: "#fff" }}>{i18n.t("close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  fabText: {
    color: "#fff",
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  closeButton: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});
