import { Box } from '@/components/ui/box';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { SnBEvent, getEventThumbnail } from '@/app/types/snb_event';
import { useAuth } from '@clerk/clerk-expo';
import { useState } from 'react';

interface EventFeedCardProps {
  event: SnBEvent;
  onParticipateSuccess: () => void;
}

const API_BASE_URL = "http://192.168.189.51:5050/api";
const FALLBACK_IMAGE = require("@/assets/images/golf.jpg");

export default function EventFeedCard({ event, onParticipateSuccess }: EventFeedCardProps) {
  const [isParticipating, setIsParticipating] = useState(false);
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
        // Optional: Zeige einen Toast/Alert mit dem Fehler (z.B. "Event is full")
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

  // Thumbnail-URL aus Media-Array holen oder Fallback verwenden
  const thumbnailUrl = getEventThumbnail(event);
  const imageSource = thumbnailUrl ? { uri: thumbnailUrl } : FALLBACK_IMAGE;

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

  return (
    <Box className='rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm'>
      {/* Event Bild */}
      <Image
        source={imageSource}
        alt={event.title}
        className='w-full h-48 object-cover'
        resizeMode='cover'
      />

      {/* Event Details */}
      <VStack className='p-4' space='sm'>
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
          
          {/* Teilnehmer-Informationen - nur anzeigen wenn Daten vorhanden */}
          {event.participant_count !== undefined && (
            <Text className='text-sm text-gray-600 font-medium'>
              {event.max_participants ? (
                // Event mit max_participants
                event.available_spots !== undefined && event.available_spots !== null ? (
                  // Zeige freie Plätze
                  <>👥 {event.available_spots} spots available ({event.participant_count}/{event.max_participants})</>
                ) : (
                  // Fallback: Nur Teilnehmer/Max
                  <>👥 {event.participant_count}/{event.max_participants} participants</>
                )
              ) : (
                // Event ohne Limit
                <>👥 {event.participant_count} participants</>
              )}
            </Text>
          )}
          
          {/* Fallback wenn keine Teilnehmer-Daten geladen wurden */}
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

        {/* Medien-Indikator */}
        {event.media && event.media.length > 1 && (
          <Text className='text-xs text-gray-400 mt-2 text-center'>
            📸 {event.media.length} {event.media.length === 1 ? 'photo' : 'photos'}
          </Text>
        )}
      </VStack>
    </Box>
  );
}