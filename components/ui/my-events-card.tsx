import { VStack } from '@/components/ui/vstack';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { SnBEvent } from '@/app/types/snb_event';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';
import { View, Dimensions, LayoutChangeEvent } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { MiniAvatarRow } from '@/components/ui/mini-avatar-row';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useIsFocused } from '@react-navigation/native';

type MediaItem = {
  uri: string | null;
  type: 'image' | 'video' | 'gif';
};

const FALLBACK_IMAGE = require('@/assets/images/golf.jpg');
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// 🔹 Video-Item: spielt nur, wenn Slide aktiv UND Screen fokussiert
type EventVideoItemProps = {
  uri: string;
  isActive: boolean;
};

const EventVideoItem = ({ uri, isActive }: EventVideoItemProps) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.volume = 1.0;
  });

  const isScreenFocused = useIsFocused();

  useEffect(() => {
    if (!player) return;

    const shouldPlay = isActive && isScreenFocused;

    if (shouldPlay) {
      player.muted = false;
      player.play();
    } else {
      player.pause();
      player.muted = true;
    }
  }, [isActive, isScreenFocused, player]);

  return (
    <VideoView
      style={{ width: '100%', height: '100%' }}
      player={player}
      nativeControls
      contentFit="cover"
      allowsFullscreen
      allowsPictureInPicture
    />
  );
};

type MyEventsCardProps = {
  event: SnBEvent;
  onWithdrawSuccess: () => void;
};

export default function MyEventsCard({
  event,
  onWithdrawSuccess,
}: MyEventsCardProps) {
  const { getToken } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(SCREEN_WIDTH);

  const handleWithdraw = async () => {
    try {
      console.log('Withdraw from event', event.id);
      const token = await getToken();
      console.log('🔑 Token:', token);

      if (!token) {
        console.warn('❌ Kein Token vorhanden – User nicht eingeloggt?');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/events/cancel-participation`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_id: event.id,
          }),
        }
      );

      const data = await response.json();
      console.log('📥 Response status:', response.status);
      console.log('📥 Response data:', data);

      if (!response.ok) {
        console.warn('❌ Backend response:', data);
        throw new Error(data?.error || 'Failed to cancel event');
      }

      onWithdrawSuccess();
    } catch (error) {
      console.error('❌ Fehler in handleWithdraw:', error);
    }
  };

  const mediaItems: MediaItem[] =
    event.media && event.media.length > 0
      ? event.media.map((m) => {
          let type: MediaItem['type'] = 'image';
          const rawType = (m.type || '').toLowerCase();

          if (rawType.startsWith('video')) {
            type = 'video';
          } else if (rawType === 'gif' || rawType === 'image/gif') {
            type = 'gif';
          }

          return {
            uri: m.sasUrl,
            type,
          };
        })
      : [{ uri: null, type: 'image' as const }];

  const handleLayout = (eventLayout: LayoutChangeEvent) => {
    const { width } = eventLayout.nativeEvent.layout;
    if (width > 0) {
      setCarouselWidth(width);
    }
  };

  const avatarUrls =
    event.participants_media?.map((p) => p.url).filter(Boolean) ?? [];

  return (
    <VStack className="w-full" space="2xl">
      <VStack
        className="rounded-xl border border-outline-300 p-5"
        key={event.id}
      >
        {/* Media Carousel */}
        <View
          className="w-full h-64 relative rounded-xl overflow-hidden"
          onLayout={handleLayout}
        >
          <Carousel
            width={carouselWidth}
            height={256}
            data={mediaItems}
            onSnapToItem={(index) => setCurrentIndex(index)}
            renderItem={({
              item,
              index,
            }: {
              item: MediaItem;
              index: number;
            }) => {
              if (!item.uri) {
                return (
                  <Image
                    source={FALLBACK_IMAGE}
                    alt={event.title}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                );
              }

              if (item.type === 'video') {
                return (
                  <EventVideoItem
                    uri={item.uri}
                    isActive={index === currentIndex}
                  />
                );
              }

              return (
                <Image
                  source={{ uri: item.uri }}
                  alt={event.title}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              );
            }}
            loop={false}
            enabled={mediaItems.length > 1}
          />

          {mediaItems.length > 1 && (
            <View className="absolute inset-0 pointer-events-none">
              <View className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-xl">
                <Text className="text-white text-xs font-semibold">
                  {currentIndex + 1}/{mediaItems.length}
                </Text>
              </View>

              <View className="absolute bottom-2 left-0 right-0 flex-row justify-center items-center gap-1.5">
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
            {event.end_time &&
              ` – ${new Date(event.end_time).toLocaleString()}`}
          </Text>
          <Heading size="md">{event.title}</Heading>
          <Text className="line-clamp-2">{event.description}</Text>
          <Text className="text-sm">
            📍 {event.is_online ? 'Online Event' : event.location}
          </Text>

          {event.max_participants != null &&
            event.available_spots != null && (
              <Text className="text-sm text-gray-600">
                Participants:{' '}
                {event.max_participants - event.available_spots}
              </Text>
            )}

          {avatarUrls.length > 0 && (
            <HStack className="mt-1 items-center">
              <MiniAvatarRow avatarUrls={avatarUrls} />
            </HStack>
          )}

          <VStack className="w-full my-7" space="lg">
            <Button
              className="w-full"
              variant="outline"
              onPress={handleWithdraw}
            >
              <ButtonText className="font-medium">Withdraw</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  );
}
