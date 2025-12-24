// settings.tsx
import { useLanguage } from '@/context/LanguageContext';
import {
  ColorSelectMode,
  DayTimelineViewMode,
  useSettings,
} from '@/context/SettingsСontext';
import { useTheme } from '@/context/ThemeContext';
import i18n from '@/utils/i18n';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export default function SettingsPage() {
  const { appThemeSetting, setAppTheme, colors } = useTheme();
  const { colorSelectMode, setColorSelectMode } = useSettings();
  const { dayTimelineViewMode, setDayTimelineViewMode } = useSettings();
  const { language, setLanguage } = useLanguage();

  const themes = [
    { label: i18n.t('settings.theme.system'), value: 'system' },
    { label: i18n.t('settings.theme.light'), value: 'light' },
    { label: i18n.t('settings.theme.dark'), value: 'dark' },
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
          {i18n.t('settings.note_restart')}
        </Text>

        {/* Тема */}
        <Section title={i18n.t('settings.theme.title')}>
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
        <Section title={i18n.t('settings.language.title')}>
          {languages.map(({ label, value }) => (
            <Row
              key={value}
              label={label}
              selected={language === value}
              onPress={() => setLanguage(value)}
              colors={colors}
            />
          ))}
        </Section>

        {/* Режим выбора цвета */}
        <Section title={i18n.t('settings.colorMode.title')}>
          {[
            {
              label: i18n.t('settings.colorMode.palette'),
              value: 'palette',
            },
            {
              label: i18n.t('settings.colorMode.preset'),
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
        <Section title={i18n.t('settings.dayTimelineViewMode.title')}>
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
