import {
  ACCEPTED_MEDIA_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_PER_ENTRY,
} from "@/types";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUpload(
  fileSize: number,
  contentType: string,
  currentMediaCount: number,
): ValidationResult {
  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size ${Math.round(fileSize / 1024 / 1024)}MB exceeds maximum of 50MB`,
    };
  }

  if (
    !ACCEPTED_MEDIA_TYPES.includes(
      contentType as (typeof ACCEPTED_MEDIA_TYPES)[number],
    )
  ) {
    return {
      valid: false,
      error: `File type "${contentType}" is not accepted. Accepted: ${ACCEPTED_MEDIA_TYPES.join(", ")}`,
    };
  }

  if (currentMediaCount >= MAX_FILES_PER_ENTRY) {
    return {
      valid: false,
      error: `Maximum of ${MAX_FILES_PER_ENTRY} files per entry reached`,
    };
  }

  return { valid: true };
}

export function validateEntryFields(fields: {
  title?: string;
  body?: string;
  locationName?: string;
  lat?: number;
  lng?: number;
}): ValidationResult {
  if (fields.title !== undefined) {
    if (fields.title.trim().length === 0) {
      return { valid: false, error: "Title is required" };
    }
    if (fields.title.length > 200) {
      return { valid: false, error: "Title must be 200 characters or less" };
    }
  }

  if (fields.body !== undefined && fields.body.trim().length === 0) {
    return { valid: false, error: "Body is required" };
  }

  if (fields.locationName !== undefined && fields.locationName.trim().length === 0) {
    return { valid: false, error: "Location name is required" };
  }

  if (fields.lat !== undefined && (fields.lat < -90 || fields.lat > 90)) {
    return { valid: false, error: "Latitude must be between -90 and 90" };
  }

  if (fields.lng !== undefined && (fields.lng < -180 || fields.lng > 180)) {
    return { valid: false, error: "Longitude must be between -180 and 180" };
  }

  return { valid: true };
}
