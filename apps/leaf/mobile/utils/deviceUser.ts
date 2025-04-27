import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';
import { initUser } from '../services/api';

export async function getDeviceUserId(): Promise<string> {
  let deviceId = await SecureStore.getItemAsync('device_user_id');
  if (!deviceId || typeof deviceId !== 'string') {
    deviceId = uuidv4();
    await SecureStore.setItemAsync('device_user_id', deviceId);
    console.log('[deviceUser] Generated new device user id:', deviceId);
    // Initialize user in backend
    try {
      await initUser(deviceId);
      console.log('[deviceUser] User initialized in backend:', deviceId);
    } catch (e) {
      console.error('[deviceUser] Failed to initialize user in backend:', e);
    }
  } else {
    console.log('[deviceUser] Retrieved existing device user id:', deviceId);
    // Ensure user exists in backend (idempotent)
    try {
      await initUser(deviceId);
      console.log('[deviceUser] User ensured in backend:', deviceId);
    } catch (e) {
      console.error('[deviceUser] Failed to ensure user in backend:', e);
    }
  }
  return deviceId;
}
