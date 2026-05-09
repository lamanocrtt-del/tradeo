import React, { useState } from 'react'
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  icon?: keyof typeof Ionicons.glyphMap
  containerStyle?: ViewStyle
  isPassword?: boolean
}

export function Input({
  label,
  error,
  icon,
  containerStyle,
  isPassword = false,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? '#9333ea' : '#64748b'}
            style={styles.icon}
          />
        )}
        
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon]}
          placeholderTextColor="#64748b"
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#64748b"
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155',
  },
  inputFocused: {
    borderColor: '#9333ea',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  icon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  inputWithIcon: {
    paddingLeft: 12,
  },
  eyeIcon: {
    padding: 16,
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
})
