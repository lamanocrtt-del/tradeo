import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { haptics } from '../../lib/haptics'

interface ButtonProps {
  children: React.ReactNode
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  style?: ViewStyle
  textStyle?: TextStyle
  fullWidth?: boolean
}

const VARIANTS = {
  primary: {
    colors: ['#9333ea', '#7c3aed'],
    textColor: '#ffffff',
  },
  secondary: {
    colors: ['#374151', '#1f2937'],
    textColor: '#ffffff',
  },
  success: {
    colors: ['#22c55e', '#16a34a'],
    textColor: '#ffffff',
  },
  danger: {
    colors: ['#ef4444', '#dc2626'],
    textColor: '#ffffff',
  },
  ghost: {
    colors: ['transparent', 'transparent'],
    textColor: '#9333ea',
  },
}

const SIZES = {
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    borderRadius: 8,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    borderRadius: 10,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    fontSize: 18,
    borderRadius: 12,
  },
}

export function Button({
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const variantConfig = VARIANTS[variant]
  const sizeConfig = SIZES[size]

  const handlePress = async () => {
    if (disabled || loading) return
    await haptics.tap()
    onPress()
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        { borderRadius: sizeConfig.borderRadius },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={variantConfig.colors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          {
            paddingVertical: sizeConfig.paddingVertical,
            paddingHorizontal: sizeConfig.paddingHorizontal,
            borderRadius: sizeConfig.borderRadius,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variantConfig.textColor} />
        ) : (
          <Text
            style={[
              styles.text,
              { color: variantConfig.textColor, fontSize: sizeConfig.fontSize },
              textStyle,
            ]}
          >
            {children}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.5,
  },
})
