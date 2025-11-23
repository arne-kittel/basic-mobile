import FontAwesome from '@expo/vector-icons/FontAwesome';
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

// Authentication
import { useAuth, ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';

// ⭐ Stripe
import { StripeProvider } from '@stripe/stripe-react-native';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// ⭐ Publishable Key – am besten über Env-Variable setzen
const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? 'pk_test_xxx_dein_key_hier';

export default function RootLayout() {

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (!STRIPE_PUBLISHABLE_KEY) {
    console.warn(
      '⚠️ STRIPE_PUBLISHABLE_KEY ist nicht gesetzt. Setze EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in deiner .env.'
    );
  }

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <ClerkProvider tokenCache={tokenCache}>
        <RootLayoutNav />
      </ClerkProvider>
    </StripeProvider>
  );

  function RootLayoutNav() {
    const colorScheme = useColorScheme();
    const { isSignedIn, isLoaded } = useAuth();

    if (!isLoaded) {
      return null; // oder ein Loading Spinner
    }

    console.log('Clerk isLoaded:', isLoaded);
    console.log('Clerk isSignedIn:', isSignedIn);

    return (
      <GluestackUIProvider mode={(colorScheme ?? "light") as "light" | "dark"}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Protected guard={isSignedIn}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack.Protected>
            <Stack.Protected guard={!isSignedIn}>
              <Stack.Screen name="(auth)/splash-screen" options={{ headerShown: false }} />
            </Stack.Protected>
          </Stack>
        </ThemeProvider>
      </GluestackUIProvider>
    );
  }
}
