import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';

export async function getDeviceUserId(): Promise<string> {
  let deviceId = await SecureStore.getItemAsync('device_user_id');
  if (!deviceId || typeof deviceId !== 'string') {
    deviceId = uuidv4();
    await SecureStore.setItemAsync('device_user_id', deviceId);
  }
  return deviceId;
}
