import {
  ColorSelectMode,
  DayTimelineViewMode,
  useSettings,
} from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { useLocalization } from '@/hooks/useLocalization';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ---------- UI helpers ---------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 32 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          marginBottom: 12,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Row({
  label,
  selected,
  onPress,
  colors,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: pressed
          ? colors.card + 'CC'
          : colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      })}
    >
      <Text style={{ color: colors.text, fontSize: 16 }}>{label}</Text>
      {selected && (
        <Text style={{ color: colors.primary, fontSize: 16 }}>✓</Text>
      )}
    </Pressable>
  );
}

/* ---------- Screen ---------- */

export default function SettingsPage() {
  const { appThemeSetting, setAppTheme, colors } = useTheme();
  const {
    colorSelectMode,
    setColorSelectMode,
    dayTimelineViewMode,
    setDayTimelineViewMode,
  } = useSettings();

  const {
    t,
    language,
    changeLanguage,
  } = useLocalization(); // 👈 новый API

  const themes = [
    { label: t('settings.theme.system'), value: 'system' },
    { label: t('settings.theme.light'), value: 'light' },
    { label: t('settings.theme.dark'), value: 'dark' },
  ];

  const languages = [
    { label: 'English', value: 'en' as const },
    { label: 'Русский', value: 'ru' as const },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
        style={{ backgroundColor: colors.background }}
      >
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary ?? '#777',
            marginBottom: 24,
          }}
        >
          {t('settings.note_restart')}
        </Text>

        {/* Тема */}
        <Section title={t('settings.theme.title')}>
          {themes.map(({ label, value }) => (
            <Row
              key={value}
              label={label}
              selected={appThemeSetting === value}
              onPress={() =>
                setAppTheme(value as 'light' | 'dark' | 'system')
              }
              colors={colors}
            />
          ))}
        </Section>

        {/* Язык */}
        <Section title={t('settings.language.title')}>
          {languages.map(({ label, value }) => (
            <Row
              key={value}
              label={label}
              selected={language === value}
              onPress={() => changeLanguage(value)}
              colors={colors}
            />
          ))}
        </Section>

        {/* Режим выбора цвета */}
        <Section title={t('settings.colorMode.title')}>
          {[
            {
              label: t('settings.colorMode.palette'),
              value: 'palette',
            },
            {
              label: t('settings.colorMode.preset'),
              value: 'preset',
            },
          ].map(({ label, value }) => (
            <Row
              key={value}
              label={label}
              selected={colorSelectMode === value}
              onPress={() =>
                setColorSelectMode(value as ColorSelectMode)
              }
              colors={colors}
            />
          ))}
        </Section>

        {/* Таймлайн */}
        <Section title={t('settings.dayTimelineViewMode.title')}>
          {[
            { label: 'V1', value: 'v1' },
            { label: 'V2', value: 'v2' },
          ].map(({ label, value }) => (
            <Row
              key={value}
              label={label}
              selected={dayTimelineViewMode === value}
              onPress={() =>
                setDayTimelineViewMode(value as DayTimelineViewMode)
              }
              colors={colors}
            />
          ))}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
