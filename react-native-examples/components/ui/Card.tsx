import React from 'react'
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { haptics } from '../../lib/haptics'

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  onPress?: () => void
  gradient?: boolean
  gradientColors?: [string, string]
}

export function Card({
  children,
  style,
  onPress,
  gradient = false,
  gradientColors = ['#1e293b', '#0f172a'],
}: CardProps) {
  const handlePress = async () => {
    if (onPress) {
      await haptics.tap()
      onPress()
    }
  }

  const content = gradient ? (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  ) : (
    <View style={[styles.card, style]}>{children}</View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}

// Sub-components pour une API plus propre
Card.Header = function CardHeader({
  children,
  style,
}: {
  children: React.ReactNode
  style?: ViewStyle
}) {
  return <View style={[styles.header, style]}>{children}</View>
}

Card.Title = function CardTitle({
  children,
  style,
}: {
  children: React.ReactNode
  style?: ViewStyle
}) {
  return <Text style={[styles.title, style]}>{children}</Text>
}

Card.Description = function CardDescription({
  children,
  style,
}: {
  children: React.ReactNode
  style?: ViewStyle
}) {
  return <Text style={[styles.description, style]}>{children}</Text>
}

Card.Content = function CardContent({
  children,
  style,
}: {
  children: React.ReactNode
  style?: ViewStyle
}) {
  return <View style={[styles.content, style]}>{children}</View>
}

Card.Footer = function CardFooter({
  children,
  style,
}: {
  children: React.ReactNode
  style?: ViewStyle
}) {
  return <View style={[styles.footer, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    marginBottom: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    marginVertical: 8,
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
})
