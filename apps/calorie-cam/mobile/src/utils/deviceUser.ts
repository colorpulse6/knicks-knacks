import * as SecureStore from "expo-secure-store";
import { v4 as uuidv4 } from "uuid";

const DEVICE_USER_ID_KEY = "device_user_id";

export async function getDeviceUserId(): Promise<string> {
  const existingDeviceId = await SecureStore.getItemAsync(DEVICE_USER_ID_KEY);
  if (existingDeviceId) return existingDeviceId;

  const deviceId = uuidv4();
  await SecureStore.setItemAsync(DEVICE_USER_ID_KEY, deviceId);
  return deviceId;
}
