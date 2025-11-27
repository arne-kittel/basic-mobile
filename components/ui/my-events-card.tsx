import { VStack } from '@/components/ui/vstack'
import { Image } from '@/components/ui/image'
import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { Button, ButtonText } from '@/components/ui/button'
import { HStack } from '@/components/ui/hstack'
import { SnBEvent } from '@/app/types/snb_event'
import { useAuth } from '@clerk/clerk-expo'
import { useState } from 'react'
import { View, Dimensions, LayoutChangeEvent } from 'react-native'
import Carousel from 'react-native-reanimated-carousel'
import { MiniAvatarRow } from '@/components/ui/mini-avatar-row'

// Saubere Typ-Definition für Media Items
type MediaItem = {
  uri: string | null;
  type: 'image' | 'video' | 'gif';
};

const FALLBACK_IMAGE = require("@/assets/images/golf.jpg");
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function MyEventsCard({event, onWithdrawSuccess}: {event: SnBEvent, onWithdrawSuccess: () => void}) {
  const { getToken } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(SCREEN_WIDTH);
  
  const handleWithdraw = async () => {
    try {
      console.log("Withdraw from event", event.id);
      const token = await getToken();
      console.log("🔑 Token:", token);

      if (!token) {
        console.warn("❌ Kein Token vorhanden – User nicht eingeloggt?");
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/events/withdraw`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: event.id,
        }),
      });

      const data = await response.json();
      console.log("📥 Response data:", data);
      console.log("📥 Response status:", response.status);
      
      if (!response.ok) {
        const errText = await response.text();
        console.warn("❌ Backend response:", errText);
        throw new Error("Failed to participate in event");
      }

      if (onWithdrawSuccess) {
        onWithdrawSuccess();
      }
      
    } catch (error) {
      console.error("❌ Fehler in handleWithdraw:", error);
    }
  }

  // Media-Items für Carousel vorbereiten mit explizitem Typ
  const mediaItems: MediaItem[] = event.media && event.media.length > 0 
    ? event.media.map(m => ({ 
        uri: m.sasUrl, 
        type: (m.type as MediaItem['type']) 
      }))
    : [{ uri: null, type: 'image' as const }];

  // DEBUG: Prüfe was geladen wird
  console.log('🖼️ [MyEventsCard] Event ID:', event.id);
  console.log('🖼️ [MyEventsCard] Media Array:', event.media);
  console.log('🖼️ [MyEventsCard] Media Count:', event.media?.length || 0);
  console.log('🖼️ [MyEventsCard] Media Items:', mediaItems);
  if (mediaItems.length > 0 && mediaItems[0].uri) {
    console.log('🖼️ [MyEventsCard] First URI:', mediaItems[0].uri.substring(0, 80) + '...');
  }

  // Messe die tatsächliche Breite des Containers
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      setCarouselWidth(width);
    }
  };

  // 🔹 Avatar-URLs aus participants_media (Clerk-Profilbilder)
  const avatarUrls =
    event.participants_media?.map((p) => p.url).filter(Boolean) ?? [];

  return (
    <VStack className='w-full' space='2xl'>
      <VStack
        className="rounded-xl border border-outline-300 p-5"
        key={event.id}
      >
        {/* Media Carousel */}
        <View className='w-full h-64 relative rounded-xl overflow-hidden' onLayout={handleLayout}>
          <Carousel
            width={carouselWidth}
            height={256}
            data={mediaItems}
            onSnapToItem={(index) => setCurrentIndex(index)}
            renderItem={({ item }: { item: MediaItem }) => (
              <Image
                source={item.uri ? { uri: item.uri } : FALLBACK_IMAGE}
                alt={event.title}
                className='w-full h-full'
                resizeMode='cover'
              />
            )}
            loop={false}
            enabled={mediaItems.length > 1}
          />
          
          {/* Media Counter & Pagination Dots */}
          {mediaItems.length > 1 && (
            <View className='absolute inset-0 pointer-events-none'>
              {/* Counter Badge (oben rechts) */}
              <View className='absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-xl'>
                <Text className='text-white text-xs font-semibold'>
                  {currentIndex + 1}/{mediaItems.length}
                </Text>
              </View>
              
              {/* Pagination Dots (unten) */}
              <View className='absolute bottom-2 left-0 right-0 flex-row justify-center items-center gap-1.5'>
                {mediaItems.map((_, index) => (
                  <View
                    key={index}
                    className={`rounded-full ${
                      index === currentIndex 
                        ? 'w-2 h-2 bg-white' 
                        : 'w-1.5 h-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        <VStack className="mt-4" space="md">
          <Text className="text-sm text-gray-500">
            {new Date(event.start_time).toLocaleString()}
            {event.end_time && ` – ${new Date(event.end_time).toLocaleString()}`}
          </Text>
          <Heading size="md">{event.title}</Heading>
          <Text className="line-clamp-2">{event.description}</Text>
          <Text className="text-sm">
            📍 {event.is_online ? "Online Event" : event.location}
          </Text>

          {event.max_participants != null && event.available_spots != null && (
            <Text className="text-sm text-gray-600">
              Participants: {event.max_participants - event.available_spots}
            </Text>
          )}

          {/* 🔹 Mini-Avatare der Teilnehmer */}
          {avatarUrls.length > 0 && (
            <HStack className="mt-1 items-center">
              <MiniAvatarRow avatarUrls={avatarUrls} />
            </HStack>
          )}

          <VStack className="w-full my-7" space="lg">
            <Button className="w-full" variant='outline' onPress={handleWithdraw}>
              <ButtonText className="font-medium">Withdraw</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  )
}
