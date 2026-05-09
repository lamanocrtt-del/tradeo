# Guide de Conversion Tradeo - React Native avec Expo

## 1. Installation et Setup Initial

```bash
# Creer le projet Expo
npx create-expo-app tradeo-mobile --template blank-typescript
cd tradeo-mobile

# Installer les dependances essentielles
npx expo install @supabase/supabase-js
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npx expo install expo-secure-store expo-haptics expo-linear-gradient
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install @react-native-async-storage/async-storage
npx expo install expo-font @expo-google-fonts/inter
```

## 2. Structure du Projet

```
tradeo-mobile/
├── app/                          # Expo Router (comme Next.js App Router)
│   ├── (tabs)/                   # Tab Navigator
│   │   ├── _layout.tsx           # Tab bar config
│   │   ├── learn.tsx             # Apprendre
│   │   ├── leagues.tsx           # Ligues
│   │   ├── trading.tsx           # Trading
│   │   ├── shop.tsx              # Boutique
│   │   └── profile.tsx           # Profil
│   ├── (auth)/                   # Auth screens (pas de tabs)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── onboarding.tsx
│   ├── lesson/
│   │   └── [lessonId].tsx        # Dynamic route
│   └── _layout.tsx               # Root layout
├── components/
│   ├── ui/                       # Composants UI reutilisables
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── BottomNav.tsx
│   ├── XPBar.tsx
│   └── ...
├── lib/
│   ├── supabase.ts               # Client Supabase
│   ├── auth-service.ts           # Service d'auth
│   ├── haptics.ts                # Vibrations
│   └── types.ts                  # Types TypeScript
├── hooks/
│   ├── useAuth.ts
│   ├── useUser.ts
│   └── ...
├── constants/
│   ├── Colors.ts
│   ├── Lessons.ts
│   └── ...
└── assets/
    ├── fonts/
    └── images/
```

## 3. Configuration Supabase (lib/supabase.ts)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

// Adapter pour stocker les tokens de maniere securisee
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(key)
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value)
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key)
  },
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important pour React Native
  },
})
```

## 4. Correspondance des Composants Web -> React Native

| React Web | React Native |
|-----------|--------------|
| `<div>` | `<View>` |
| `<span>`, `<p>` | `<Text>` |
| `<img>` | `<Image>` |
| `<button>` | `<TouchableOpacity>` ou `<Pressable>` |
| `<input>` | `<TextInput>` |
| `<a>` | `<Link>` (expo-router) ou `<TouchableOpacity>` |
| `className="..."` | `style={styles.xxx}` |
| `onClick` | `onPress` |
| `onChange` | `onChangeText` |
| CSS/Tailwind | StyleSheet.create() |

## 5. Exemple: Conversion du Composant Button

### Version Web (Next.js)
```tsx
// components/ui/button.tsx (Web)
export function Button({ children, onClick, disabled, className }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 bg-purple-600 text-white rounded-lg ${className}`}
    >
      {children}
    </button>
  )
}
```

### Version React Native
```tsx
// components/ui/Button.tsx (React Native)
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'

interface ButtonProps {
  children: React.ReactNode
  onPress: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  style?: ViewStyle
}

export function Button({ children, onPress, disabled, variant = 'primary', style }: ButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  const colors = {
    primary: ['#9333ea', '#3b82f6'],
    secondary: ['#374151', '#1f2937'],
    danger: ['#ef4444', '#dc2626'],
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.button, disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={colors[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.text}>{children}</Text>
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.5,
  },
})
```

## 6. Navigation (Tab Bar)

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#9333ea',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          height: 60,
          paddingBottom: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Apprendre',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leagues"
        options={{
          title: 'Ligues',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trading"
        options={{
          title: 'Trading',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Boutique',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
```

## 7. Exemple: Page Trading

```tsx
// app/(tabs)/trading.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useState, useEffect } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'

const { width } = Dimensions.get('window')

// Assets icons
const ASSETS = [
  { id: 'eurusd', name: 'EUR/USD', price: 1.08234, change: 0.45 },
  { id: 'btc', name: 'Bitcoin', price: 68572.21, change: 2.29 },
  { id: 'gold', name: 'Gold', price: 4760.94, change: -0.12 },
  { id: 'oil', name: 'Oil', price: 98.90, change: 0.85 },
]

export default function TradingScreen() {
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0])
  const [balance, setBalance] = useState(10000)

  const handleBuy = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    // Logic d'achat
  }

  const handleSell = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    // Logic de vente
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.balanceLabel}>Portefeuille virtuel</Text>
          <Text style={styles.balance}>$ {balance.toLocaleString()}</Text>
        </View>
      </View>

      {/* Asset Selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.assetScroll}
        contentContainerStyle={styles.assetContainer}
      >
        {ASSETS.map((asset) => (
          <TouchableOpacity
            key={asset.id}
            onPress={() => {
              Haptics.selectionAsync()
              setSelectedAsset(asset)
            }}
            style={[
              styles.assetCard,
              selectedAsset.id === asset.id && styles.assetCardActive
            ]}
          >
            <Text style={styles.assetName}>{asset.name}</Text>
            <Text style={styles.assetPrice}>${asset.price}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Price Display */}
      <View style={styles.priceSection}>
        <Text style={styles.assetTitle}>{selectedAsset.name}</Text>
        <Text style={styles.currentPrice}>${selectedAsset.price}</Text>
        <Text style={[
          styles.change,
          selectedAsset.change >= 0 ? styles.positive : styles.negative
        ]}>
          {selectedAsset.change >= 0 ? '+' : ''}{selectedAsset.change}%
        </Text>
      </View>

      {/* Chart Placeholder */}
      <View style={styles.chartContainer}>
        {/* Ici tu peux utiliser react-native-svg ou victory-native pour le graphique */}
        <Text style={styles.chartPlaceholder}>Graphique</Text>
      </View>

      {/* Trade Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={handleSell} style={styles.sellButton}>
          <LinearGradient
            colors={['#ef4444', '#dc2626']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonIcon}>↓</Text>
            <Text style={styles.buttonText}>VENDRE</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleBuy} style={styles.buyButton}>
          <LinearGradient
            colors={['#22c55e', '#16a34a']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonIcon}>↗</Text>
            <Text style={styles.buttonText}>ACHETER</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  balanceLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  balance: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  assetScroll: {
    maxHeight: 100,
  },
  assetContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  assetCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 12,
    width: 80,
    alignItems: 'center',
  },
  assetCardActive: {
    borderWidth: 2,
    borderColor: '#9333ea',
  },
  assetName: {
    color: '#fff',
    fontSize: 10,
    marginTop: 4,
  },
  assetPrice: {
    color: '#94a3b8',
    fontSize: 9,
  },
  priceSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  assetTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  currentPrice: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  change: {
    fontSize: 14,
  },
  positive: {
    color: '#22c55e',
  },
  negative: {
    color: '#ef4444',
  },
  chartContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholder: {
    color: '#64748b',
  },
  buttonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  sellButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buyButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
```

## 8. Haptics (Vibrations)

```typescript
// lib/haptics.ts
import * as Haptics from 'expo-haptics'

export const haptics = {
  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  selection: () => Haptics.selectionAsync(),
}
```

## 9. Auth Context

```tsx
// context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  session: Session | null
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: username }
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

## 10. Variables d'environnement

Cree un fichier `.env` a la racine:

```env
EXPO_PUBLIC_SUPABASE_URL=https://orhaudtygcytmmrhyuke.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ta_cle_anon_ici
```

## 11. Lancer l'application

```bash
# Demarrer le serveur de dev
npx expo start

# Ou directement sur simulateur
npx expo run:ios
npx expo run:android
```

## 12. Bibliotheques Recommandees

| Fonctionnalite | Bibliotheque |
|----------------|--------------|
| Graphiques | `react-native-svg` + `victory-native` ou `react-native-chart-kit` |
| Animations | `react-native-reanimated` + `react-native-gesture-handler` |
| Icons | `@expo/vector-icons` (inclut Ionicons, FontAwesome, etc.) |
| Gradients | `expo-linear-gradient` |
| Storage | `expo-secure-store` (tokens), `@react-native-async-storage/async-storage` (data) |
| Notifications | `expo-notifications` |
| Splash Screen | `expo-splash-screen` |

## 13. Prochaines Etapes

1. Creer le projet avec `npx create-expo-app`
2. Installer les dependances
3. Configurer Supabase
4. Creer les composants UI de base (Button, Card, Input)
5. Configurer la navigation
6. Convertir les ecrans un par un
7. Tester sur simulateur/device
8. Publier avec EAS Build

## 14. Ressources

- [Expo Documentation](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
