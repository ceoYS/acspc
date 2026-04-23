import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ProjectSchema } from "@repo/domain";

export default function VerifyDomainScreen() {
  const validResult = ProjectSchema.safeParse({
    id: "550e8400-e29b-41d4-a716-446655440000",
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Sample project",
    created_at: "2026-04-23T10:00:00Z",
  });

  const invalidResult = ProjectSchema.safeParse({
    id: "not-a-uuid",
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    name: "",
    created_at: "2026-04-23T10:00:00Z",
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>@repo/domain import check</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Valid input</Text>
        <Text style={styles.code}>
          success: {String(validResult.success)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invalid input</Text>
        <Text style={styles.code}>
          success: {String(invalidResult.success)}
          {!invalidResult.success
            ? `\nerrors: ${invalidResult.error.issues.length}`
            : ""}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  code: {
    fontSize: 14,
    fontFamily: "Courier",
  },
});
