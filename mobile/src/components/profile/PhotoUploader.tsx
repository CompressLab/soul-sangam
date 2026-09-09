import { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadUriToCloudinary } from "@shared/utils/cloudinary";
import Toast from "react-native-toast-message";
import { Camera, X } from "lucide-react-native";
import { colors, radius, spacing } from "@/constants/theme";

interface Props {
  uid:       string;   // kept for API compatibility
  photos:    string[]; // Cloudinary secure_url values
  onChange:  (urls: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({ photos, onChange, maxPhotos = 6 }: Props) {
  const [uploading, setUploading] = useState(false);

  async function pickAndUpload() {
    if (photos.length >= maxPhotos) {
      Toast.show({ type: "info", text1: `Maximum ${maxPhotos} photos allowed.` });
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({ type: "error", text1: "Photo library permission is required." });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: maxPhotos - photos.length,
    });

    if (result.canceled || result.assets.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];
    try {
      for (const asset of result.assets) {
        const uploaded = await uploadUriToCloudinary(asset.uri, "profiles");
        newUrls.push(uploaded.secure_url);
      }
      onChange([...photos, ...newUrls]);
      Toast.show({
        type: "success",
        text1: `${newUrls.length} photo${newUrls.length > 1 ? "s" : ""} uploaded`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      Toast.show({ type: "error", text1: msg });
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {photos.map((url, i) => (
          <View key={url} style={styles.photoWrap}>
            <Image source={{ uri: url }} style={styles.photo} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(i)}>
              <X size={10} color={colors.white} />
            </TouchableOpacity>
            {i === 0 && (
              <View style={styles.mainBadge}>
                <Text style={styles.mainBadgeText}>Main</Text>
              </View>
            )}
          </View>
        ))}

        {photos.length < maxPhotos && (
          <TouchableOpacity
            style={styles.addSlot}
            onPress={pickAndUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <>
                <Camera size={22} color={colors.gray400} />
                <Text style={styles.addText}>Add photo</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      <Text style={styles.hint}>
        {photos.length}/{maxPhotos} photos · Max 5 MB each
      </Text>
    </View>
  );
}

const THUMB = 90;

const styles = StyleSheet.create({
  wrapper:       { gap: spacing.sm },
  row:           { gap: spacing.sm, paddingBottom: 4 },
  photoWrap:     { width: THUMB, height: THUMB, borderRadius: radius.md, overflow: "visible", position: "relative" },
  photo:         { width: THUMB, height: THUMB, borderRadius: radius.md },
  removeBtn:     { position: "absolute", top: -6, right: -6, backgroundColor: colors.red, borderRadius: 10, width: 20, height: 20, alignItems: "center", justifyContent: "center", zIndex: 10 },
  mainBadge:     { position: "absolute", bottom: 4, left: 4, backgroundColor: colors.primary, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  mainBadgeText: { color: colors.white, fontSize: 9, fontWeight: "700" },
  addSlot:       { width: THUMB, height: THUMB, borderRadius: radius.md, borderWidth: 2, borderColor: colors.gray200, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 4 },
  addText:       { fontSize: 10, color: colors.gray400 },
  hint:          { fontSize: 11, color: colors.gray400 },
});
