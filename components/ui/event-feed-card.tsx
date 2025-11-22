import { Box } from '@/components/ui/box';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { SnBEvent, getEventThumbnail } from '@/app/types/snb_event';
import { useAuth } from '@clerk/clerk-expo';
import { useState } from 'react';
import { View, Dimensions, LayoutChangeEvent } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

interface EventFeedCardProps {
  event: SnBEvent;
  onParticipateSuccess: () => void;
}

// Saubere Typ-Definition für Media Items
type MediaItem = {
  uri: string | null;
  type: 'image' | 'video' | 'gif';
};

const API_BASE_URL = "http://192.168.189.51:5050/api";
const FALLBACK_IMAGE = require("@/assets/images/golf.jpg");
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function EventFeedCard({ event, onParticipateSuccess }: EventFeedCardProps) {
  const [isParticipating, setIsParticipating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(SCREEN_WIDTH);
  const { getToken } = useAuth();

  const handleParticipate = async () => {
    try {
      setIsParticipating(true);
      const token = await getToken();
      
      if (!token) {
        console.warn("❌ Kein Token vorhanden");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/events/participate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ event_id: event.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.warn("❌ Backend response:", data.error || "Unknown error");
        throw new Error(data.error || "Failed to participate");
      }

      console.log("✅ Erfolgreich für Event registriert:", event.title);
      onParticipateSuccess();
    } catch (error) {
      console.error("❌ Fehler beim Registrieren:", error);
    } finally {
      setIsParticipating(false);
    }
  };

  // Media-Items für Carousel vorbereiten mit explizitem Typ
  const mediaItems: MediaItem[] = event.media && event.media.length > 0 
    ? event.media.map(m => ({ 
        uri: m.sasUrl, 
        type: (m.type as MediaItem['type']) 
      }))
    : [{ uri: null, type: 'image' as const }];

  // Datum formatieren
  const eventDate = new Date(event.start_time).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const eventTime = new Date(event.start_time).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Messe die tatsächliche Breite des Containers
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      setCarouselWidth(width);
    }
  };

  return (
    <Box className='rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm'>
      {/* Media Carousel */}
      <View className='w-full h-72 relative z-0' onLayout={handleLayout}>
        <Carousel
          width={carouselWidth}
          height={288}
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


      {/* Event Details */}
      <VStack className='p-4 bg-white' space='sm'>
        <Text className='text-xl font-semibold text-gray-900'>
          {event.title}
        </Text>

        {event.description && (
          <Text className='text-sm text-gray-600' numberOfLines={2}>
            {event.description}
          </Text>
        )}

        <VStack space='xs' className='mt-2'>
          <Text className='text-sm text-gray-500'>
            📅 {eventDate}
          </Text>
          <Text className='text-sm text-gray-500'>
            🕐 {eventTime}
          </Text>
          {event.location && (
            <Text className='text-sm text-gray-500'>
              📍 {event.location}
            </Text>
          )}
          
          {/* Teilnehmer-Informationen */}
          {event.participant_count !== undefined && (
            <Text className='text-sm text-gray-600 font-medium'>
              {event.max_participants ? (
                event.available_spots !== undefined && event.available_spots !== null ? (
                  <>👥 {event.available_spots} spots available ({event.participant_count}/{event.max_participants})</>
                ) : (
                  <>👥 {event.participant_count}/{event.max_participants} participants</>
                )
              ) : (
                <>👥 {event.participant_count} participants</>
              )}
            </Text>
          )}
          
          {event.participant_count === undefined && event.max_participants && (
            <Text className='text-sm text-gray-600'>
              👥 Max {event.max_participants} participants
            </Text>
          )}
        </VStack>

        <Button
          className='w-full mt-4'
          onPress={handleParticipate}
          isDisabled={isParticipating}
        >
          <ButtonText>
            {isParticipating ? 'Joining...' : 'Join Event'}
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}