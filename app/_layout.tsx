import { DiaryProvider } from "@/context/DiaryContext"; // путь к твоему контексту
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DiaryProvider>
        <Stack>
          <Stack.Screen name="index" options={{ title: "Main" }} />
          <Stack.Screen name="EntryPage" options={{ title: "Запись" }} />
        </Stack>
      </DiaryProvider>
    </SafeAreaProvider>
  );
}
