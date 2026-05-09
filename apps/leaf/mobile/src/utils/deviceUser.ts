import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';
import { initUser } from '../services/api';

export async function getDeviceUserId(): Promise<string> {
  let deviceId = await SecureStore.getItemAsync('device_user_id');
  if (!deviceId || typeof deviceId !== 'string') {
    deviceId = uuidv4();
    await SecureStore.setItemAsync('device_user_id', deviceId);
    // Initialize user in backend ONLY when new
    try {
      await initUser(deviceId);
    } catch (e) {
      console.error('[deviceUser] Failed to initialize user in backend:', e);
    }
  }
  return deviceId;
}
