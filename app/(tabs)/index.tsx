import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { useState, useCallback, useRef } from 'react';
import EventFeedCard from '../../components/ui/event-feed-card';
import { useAuth } from '@clerk/clerk-expo';
import { useFocusEffect } from '@react-navigation/native';
import { SnBEvent } from '@/app/types/snb_event';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native';
import type { ViewToken } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function EventFeed() {
  const [events, setEvents] = useState<SnBEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeEventId, setActiveEventId] = useState<string | number | null>(
    null
  );
  const { getToken } = useAuth();

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      console.log('🧪 Start fetchEvents()');

      const token = await getToken();
      console.log('🔐 Token:', token ? '✓ vorhanden' : '✗ fehlt');

      if (!token) {
        console.warn('❌ Kein Token vorhanden – User nicht eingeloggt?');
        return;
      }

      // Mit include_media=true Parameter, um Bilder/Videos zu laden
      const url = `${API_BASE_URL}/events/?include_media=true&include_participants=true`;

      console.log('🌍 URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errText = await response.text();
        console.warn('❌ Backend response:', errText);
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Events geladen:', data.length, 'Events');
      console.log(
        '🖼️ Media-Items:',
        data.reduce(
          (sum: number, e: SnBEvent) => sum + (e.media?.length || 0),
          0
        )
      );

      setEvents(data);
    } catch (error) {
      console.error('❌ Fehler in fetchEvents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const firstVisible = viewableItems[0];
        const visibleEvent = firstVisible.item as SnBEvent | undefined;
        if (visibleEvent?.id != null) {
          setActiveEventId(visibleEvent.id);
        }
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <VStack className="p-4 pb-0 md:px-10 md:pt-6 md:pb-0 h-full w-full self-center mb-20 md:mb-2 bg-white">
        <Heading size="2xl" className="mb-4 font-roboto">
          Upcoming events
        </Heading>

        {isLoading && events.length === 0 ? (
          <Text className="text-center mt-8 text-gray-500">
            Loading events...
          </Text>
        ) : events.length === 0 ? (
          <Text className="text-center mt-8 text-gray-500">
            No upcoming events available.
          </Text>
        ) : (
          <HStack space="2xl" className="h-full w-full flex-1">
            <FlatList
              data={events}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ paddingBottom: 32 }}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              renderItem={({ item }) => (
                <EventFeedCard
                  event={item}
                  onParticipateSuccess={fetchEvents}
                  isActiveCard={item.id === activeEventId}
                />
              )}
            />
          </HStack>
        )}
      </VStack>
    </SafeAreaView>
  );
}
