import api from "./axios";

const validateImage = (file) => {
  if (!file) throw new Error("Please select an image.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Only JPG, PNG and WEBP images are allowed.");
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Each image must be smaller than 5MB.");
};

const upload = async (file, cloudName, parameters) => {
  if (!cloudName) throw new Error("Cloudinary is not configured.");
  const formData = new FormData();
  formData.append("file", file);
  Object.entries(parameters).forEach(([key, value]) =>
    formData.append(key, value),
  );
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData },
  );
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error?.message || "Cloudinary upload failed.");
    error.status = response.status;
    throw error;
  }
  if (!data.secure_url || !data.public_id)
    throw new Error("Cloudinary returned incomplete photo details.");
  return { url: data.secure_url, publicId: data.public_id };
};

const uploadSigned = (file, signed) =>
  upload(file, signed.cloudName, {
    api_key: signed.apiKey,
    timestamp: String(signed.timestamp),
    signature: signed.signature,
    folder: signed.folder,
  });

const uploadWithPermissionFallback = async (file, signed) => {
  try {
    return await uploadSigned(file, signed);
  } catch (error) {
    const createPermissionDenied =
      error.status === 403 &&
      /missing permissions.*create/i.test(error.message);
    if (!createPermissionDenied) throw error;

    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!preset) {
      throw new Error(
        `${error.message} Configure VITE_CLOUDINARY_UPLOAD_PRESET to enable photo uploads.`,
        { cause: error },
      );
    }
    return upload(file, signed.cloudName, { upload_preset: preset });
  }
};

const uploadSignedImage = async (file, signatureEndpoint) => {
  validateImage(file);
  const { data: signed } = await api.get(signatureEndpoint);
  return uploadWithPermissionFallback(file, signed);
};

export const uploadImageToCloudinary = (file) => {
  return uploadSignedImage(file, "/upload/signature");
};

export const uploadRegistrationPhoto = (file) => {
  return uploadSignedImage(file, "/auth/registration-photo-signature");
};
