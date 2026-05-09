import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

// Wrapper pour les vibrations avec fallback sur web
export const haptics = {
  tap: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  },
  
  medium: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
  },
  
  heavy: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    }
  },
  
  success: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }
  },
  
  error: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  },
  
  warning: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    }
  },
  
  selection: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.selectionAsync()
    }
  },
}
