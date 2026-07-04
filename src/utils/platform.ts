import { Capacitor } from '@capacitor/core';

// Detecção de plataforma: app nativo (Capacitor) vs site (web)
export const isNativeApp = Capacitor.isNativePlatform();
export const isAndroid = Capacitor.getPlatform() === 'android';
export const isIOS = Capacitor.getPlatform() === 'ios';
export const isWeb = Capacitor.getPlatform() === 'web';
