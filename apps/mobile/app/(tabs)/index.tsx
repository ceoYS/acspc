import { ScrollView, Text, View } from "react-native";

const SECTIONS = [
  {
    title: "Primary",
    swatches: [
      { bg: "bg-blue-500", label: "blue-500" },
      { bg: "bg-blue-600", label: "blue-600" },
      { bg: "bg-blue-700", label: "blue-700" },
    ],
  },
  {
    title: "Accent",
    swatches: [
      { bg: "bg-violet-500", label: "violet-500" },
      { bg: "bg-violet-600", label: "violet-600" },
      { bg: "bg-violet-700", label: "violet-700" },
    ],
  },
  {
    title: "Surface",
    swatches: [
      { bg: "bg-slate-50", label: "slate-50" },
      { bg: "bg-slate-100", label: "slate-100" },
      { bg: "bg-slate-200", label: "slate-200" },
    ],
  },
  {
    title: "Semantic",
    swatches: [
      { bg: "bg-green-500", label: "success" },
      { bg: "bg-yellow-500", label: "warning" },
      { bg: "bg-red-500", label: "error" },
    ],
  },
];

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-base font-bold text-slate-900 mb-4">
        acspc — Mobile Color Verification (d-4b-2)
      </Text>

      {SECTIONS.map((section) => (
        <View key={section.title} className="mb-4">
          <Text className="text-sm font-bold text-slate-600 mb-2">
            {section.title}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {section.swatches.map((s) => (
              <View key={s.label} className="items-center m-1">
                <View className={`w-12 h-12 rounded ${s.bg}`} />
                <Text className="text-xs text-slate-600 mt-1">{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View className="mb-4">
        <Text className="text-sm font-bold text-slate-600 mb-2">Text</Text>
        <Text className="text-sm text-slate-900">Primary (slate-900)</Text>
        <Text className="text-sm text-slate-600">Secondary (slate-600)</Text>
        <Text className="text-sm text-slate-400">Disabled (slate-400)</Text>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-bold text-slate-600 mb-2">Tag Chip</Text>
        <View className="flex-row flex-wrap gap-2">
          <View className="bg-blue-100 rounded-full p-1">
            <Text className="text-xs text-blue-700 p-1">위치</Text>
          </View>
          <View className="bg-violet-100 rounded-full p-1">
            <Text className="text-xs text-violet-700 p-1">공종</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
