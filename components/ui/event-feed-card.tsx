// src/app/components/event-feed-card.tsx
import { Box } from '@/components/ui/box';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { SnBEvent } from '@/app/types/snb_event';
import { useAuth, useUser } from '@clerk/clerk-expo';
import React, { useEffect, useState } from 'react';
import { View, Dimensions, LayoutChangeEvent, Alert } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { MiniAvatarRow } from '@/components/ui/mini-avatar-row';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useIsFocused } from '@react-navigation/native';
import { useStripe } from '@stripe/stripe-react-native';

import EventServicesSheet, {
  EventOption,
} from '../../components/ui/event-services-sheet';

export interface EventFeedCardProps {
  event: SnBEvent;
  onParticipateSuccess: () => void;
  isActiveCard?: boolean;
}

type MediaItem = {
  uri: string | null;
  type: 'image' | 'video' | 'gif';
};

type EventVideoItemProps = {
  uri: string;
  isActive: boolean;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const FALLBACK_IMAGE = require('@/assets/images/golf.jpg');
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Video im Carousel
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

export default function EventFeedCard({
  event,
  onParticipateSuccess,
  isActiveCard = true,
}: EventFeedCardProps) {
  const [isParticipating, setIsParticipating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(SCREEN_WIDTH);
  const { getToken } = useAuth();
  const { user } = useUser();

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // Overlay-/Options-State
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [options, setOptions] = useState<EventOption[]>([]);
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);

  // 🔑 Merkt sich das Client Secret und die User Event ID des PaymentIntents
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(
    null
  );
  const [currentUserEventId, setCurrentUserEventId] = useState<number | null>(
    null
  );

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
      : [{ uri: null, type: 'image' }];

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

  const handleLayout = (eventLayout: LayoutChangeEvent) => {
    const { width } = eventLayout.nativeEvent.layout;
    if (width > 0) {
      setCarouselWidth(width);
    }
  };

  const avatarUrls =
    event.participants_media?.map((p) => p.url).filter(Boolean) ?? [
      'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    ];

  // Optionen vom Backend holen
  const fetchOptions = async () => {
    setIsOptionsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/events/${event.id}/options`);

      if (!res.ok) {
        if (res.status === 404) {
          Alert.alert(
            'Fehler',
            'Für dieses Event sind noch keine Leistungen konfiguriert.'
          );
          return;
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            `Fehler beim Laden der Leistungen (${res.status})`
        );
      }

      const data: EventOption[] = await res.json();
      const active = data.filter((o) => o.is_active !== false);
      setOptions(active);

      // 🔹 Standard: alle optionalen Leistungen (TRAVEL/TICKET) aktiv setzen
      setSelectedOptionIds(
        active
          .filter((o) => o.is_selectable) // nur wählbare Optionen
          .map((o) => o.id)
      );

      // Falls vorher ein PaymentIntent existierte → verwerfen
      setPaymentClientSecret(null);
      setCurrentUserEventId(null);
    } catch (e: any) {
      console.error('Fehler beim Laden der Optionen:', e);
      Alert.alert(
        'Fehler',
        e?.message || 'Leistungen konnten nicht geladen werden.'
      );
    } finally {
      setIsOptionsLoading(false);
    }
  };

  // 🆕 Funktion zum Canceln eines PaymentIntents auf dem Backend
  const cancelPaymentIntent = async (userEventId: number) => {
    try {
      console.log(`🔄 Canceling PaymentIntent for UserEvent ID: ${userEventId}`);
      const token = await getToken();
      if (!token) {
        console.warn('⚠️ Kein Token verfügbar für Cancel-Request');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/user-events/${userEventId}/cancel-payment`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        console.log('✅ PaymentIntent und UserEvent erfolgreich gecancelt');
      } else {
        const data = await response.json().catch(() => ({}));
        console.warn('⚠️ Fehler beim Canceln:', data.error || response.status);
      }
    } catch (error) {
      console.error('⚠️ Error cancelling payment intent:', error);
      // Nicht kritisch - weitermachen
    }
  };

  const toggleOption = (optionId: number) => {
    setSelectedOptionIds((prev) => {
      const next = prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId];

      // Wenn der User die Auswahl ändert, altes PaymentIntent-Secret verwerfen
      setPaymentClientSecret(null);
      setCurrentUserEventId(null);
      return next;
    });
  };

  // Join Event → Overlay öffnen
  const handleParticipate = async () => {
    try {
      setIsParticipating(true);

      const token = await getToken();
      if (!token) {
        Alert.alert(
          'Login erforderlich',
          'Du musst eingeloggt sein, um teilzunehmen.'
        );
        return;
      }

      await fetchOptions();
      setShowOptionsModal(true);
    } catch (e: any) {
      console.error('Fehler beim Join-Flow (Options öffnen):', e);
      Alert.alert(
        'Fehler',
        e?.message || 'Die Event-Leistungen konnten nicht geladen werden.'
      );
    } finally {
      setIsParticipating(false);
    }
  };

  // 🆕 Funktion zum Schließen des Modals mit Cleanup
  const handleCloseModal = async () => {
    // Wenn ein PaymentIntent existiert, aber nicht bezahlt wurde, canceln wir ihn
    if (currentUserEventId && paymentClientSecret) {
      await cancelPaymentIntent(currentUserEventId);
    }

    // State zurücksetzen
    setPaymentClientSecret(null);
    setCurrentUserEventId(null);
    setShowOptionsModal(false);
  };

  // Book im Overlay → Backend-Booking + Stripe
  const handleConfirmBooking = async () => {
    try {
      if (!options.length) {
        Alert.alert(
          'Fehler',
          'Für dieses Event sind keine Leistungen konfiguriert.'
        );
        return;
      }

      const hasClubFee = options.some(
        (o) => o.type === 'CLUB_FEE' && o.is_required
      );
      if (!hasClubFee) {
        Alert.alert(
          'Konfigurationsfehler',
          'Dieses Event hat keine Club Fee konfiguriert. Bitte kontaktiere den Veranstalter.'
        );
        return;
      }

      const token = await getToken();
      if (!token) {
        Alert.alert(
          'Login erforderlich',
          'Du musst eingeloggt sein, um teilzunehmen.'
        );
        return;
      }

      setIsBooking(true);

      let clientSecret = paymentClientSecret;

      // 🔹 Falls wir noch keinen PaymentIntent haben → neuen via /book erzeugen
      if (!clientSecret) {
        // Falls ein alter PaymentIntent existiert, canceln wir ihn zuerst
        if (currentUserEventId) {
          await cancelPaymentIntent(currentUserEventId);
        }

        const bookResponse = await fetch(
          `${API_BASE_URL}/events/${event.id}/book`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              selected_option_ids: selectedOptionIds,
            }),
          }
        );

        if (!bookResponse.ok) {
          const data = await bookResponse.json().catch(() => ({}));
          console.warn(
            '❌ Backend response (book):',
            data.error || 'Unknown error'
          );
          throw new Error(
            data.error || `Fehler bei der Buchung (${bookResponse.status})`
          );
        }

        const bookingData = await bookResponse.json();

        clientSecret =
          bookingData.stripe_client_secret ||
          bookingData.clientSecret ||
          null;

        if (!clientSecret) {
          throw new Error(
            'Missing client secret from backend (stripe_client_secret).'
          );
        }

        // ClientSecret und User Event ID merken
        setPaymentClientSecret(clientSecret);
        setCurrentUserEventId(bookingData.user_event_id || null);
      }

      // 2) Stripe PaymentSheet initialisieren
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'SnB Club',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // 3) PaymentSheet anzeigen
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          console.log(
            'ℹ️ Zahlung abgebrochen – PaymentIntent wird auf Backend gecancelt'
          );

          // 🔹 WICHTIG: Altes PaymentIntent auf Backend canceln
          if (currentUserEventId) {
            await cancelPaymentIntent(currentUserEventId);
          }

          // Secret und User Event ID verwerfen
          setPaymentClientSecret(null);
          setCurrentUserEventId(null);
          return;
        }
        console.error('❌ Fehler im PaymentSheet:', presentError);
        Alert.alert('Zahlung fehlgeschlagen', presentError.message);

        // Bei anderen Fehlern auch aufräumen
        if (currentUserEventId) {
          await cancelPaymentIntent(currentUserEventId);
        }
        setPaymentClientSecret(null);
        setCurrentUserEventId(null);
        return;
      }

      console.log('✅ Zahlung erfolgreich für Event:', event.title);
      Alert.alert('Erfolg', 'Du bist jetzt für das Event angemeldet 🎉');

      // Bei Erfolg alles aufräumen
      setPaymentClientSecret(null);
      setCurrentUserEventId(null);
      setShowOptionsModal(false);
      onParticipateSuccess();
    } catch (error: any) {
      console.error('❌ Fehler im Book/Payment-Flow:', error);
      if (!error?.message?.includes('Canceled')) {
        Alert.alert(
          'Fehler',
          error.message || 'Es ist ein Fehler aufgetreten.'
        );
      }

      // Bei Fehler auch aufräumen
      if (currentUserEventId) {
        await cancelPaymentIntent(currentUserEventId);
      }
      setPaymentClientSecret(null);
      setCurrentUserEventId(null);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Box className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
      {/* Media Carousel */}
      <View className="w-full h-72 relative z-0" onLayout={handleLayout}>
        <Carousel
          width={carouselWidth}
          height={288}
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
                  isActive={index === currentIndex && isActiveCard}
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

      {/* Event Details */}
      <VStack className="p-4 bg-white" space="sm">
        <Text className="text-sm text-gray-500">{eventDate}</Text>
        <Text className="text-xl font-semibold text-gray-900">
          {event.title}
        </Text>

        {event.description && (
          <Text className="text-sm text-gray-600" numberOfLines={2}>
            {event.description}
          </Text>
        )}

        <VStack space="xs" className="mt-2">
          <Text className="text-sm text-gray-500">🕐 {eventTime}</Text>
          {event.location && (
            <Text className="text-sm text-gray-500">
              📍 {event.location}
            </Text>
          )}

          {event.participant_count !== undefined && (
            <Text className="text-sm text-gray-600 font-medium">
              {event.max_participants ? (
                event.available_spots !== undefined &&
                event.available_spots !== null ? (
                  <>
                    👥 {event.available_spots} spots available (
                    {event.participant_count}/{event.max_participants})
                  </>
                ) : (
                  <>
                    👥 {event.participant_count}/{event.max_participants}{' '}
                    participants
                  </>
                )
              ) : (
                <>👥 {event.participant_count} participants</>
              )}
            </Text>
          )}

          {event.participant_count === undefined &&
            event.max_participants && (
              <Text className="text-sm text-gray-600">
                👥 Max {event.max_participants} participants
              </Text>
            )}

          {avatarUrls.length > 0 && (
            <HStack className="mt-1 items-center">
              <MiniAvatarRow avatarUrls={avatarUrls} />
            </HStack>
          )}
        </VStack>

        <Button
          className="w-full mt-4"
          onPress={handleParticipate}
          isDisabled={isParticipating || isBooking}
        >
          <ButtonText>
            {isParticipating || isBooking ? 'Processing...' : 'Join Event'}
          </ButtonText>
        </Button>
      </VStack>

      {/* Overlay für Leistungen */}
      <EventServicesSheet
        visible={showOptionsModal}
        onClose={handleCloseModal}
        isLoading={isOptionsLoading}
        isBooking={isBooking}
        options={options}
        selectedOptionIds={selectedOptionIds}
        onToggleOption={toggleOption}
        onConfirm={handleConfirmBooking}
      />
    </Box>
  );
}