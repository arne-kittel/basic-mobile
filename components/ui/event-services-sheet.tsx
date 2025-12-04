// src/app/components/EventServicesSheet.tsx
import React, { useMemo } from 'react';
import { View, Modal, ScrollView, Switch } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';

export type EventOption = {
  id: number;
  type: 'TRAVEL' | 'TICKET' | 'CLUB_FEE' | string;
  label: string;
  price_cents: number;
  is_required: boolean;
  is_selectable: boolean;
  is_active?: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  isLoading: boolean;
  isBooking: boolean;
  options: EventOption[];
  selectedOptionIds: number[];
  onToggleOption: (id: number) => void;
  onConfirm: () => void;
};

export default function EventServicesSheet({
  visible,
  onClose,
  isLoading,
  isBooking,
  options,
  selectedOptionIds,
  onToggleOption,
  onConfirm,
}: Props) {
  console.log('EventServicesSheet options:', options);

  const activeOptions = useMemo(
    () => options.filter((o) => o.is_active !== false),
    [options]
  );

  const totalPriceCents = useMemo(() => {
    if (!activeOptions.length) return 0;
    return activeOptions.reduce((sum, opt) => {
      if (opt.is_required) {
        return sum + opt.price_cents;
      }
      if (opt.is_selectable && selectedOptionIds.includes(opt.id)) {
        return sum + opt.price_cents;
      }
      return sum;
    }, 0);
  }, [activeOptions, selectedOptionIds]);

  const totalPriceLabel = useMemo(() => {
    if (!totalPriceCents) return '–';
    return `${(totalPriceCents / 100).toFixed(2)} CHF`;
  }, [totalPriceCents]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => !isBooking && onClose()}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl p-4">
          <View className="w-12 h-1 bg-gray-300 self-center rounded-full mb-3" />
          <Text className="text-lg font-semibold mb-1">
            Leistungen & Preis
          </Text>
          <Text className="text-sm text-gray-500 mb-3">
            Wähle, was du buchen möchtest. Die Club Fee ist immer enthalten.
          </Text>

          {isLoading ? (
            <Text className="text-sm text-gray-500">Lade Leistungen…</Text>
          ) : (
            <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
              {activeOptions.length === 0 && (
                <Text className="text-sm text-gray-500 mt-2">
                  Für dieses Event sind keine Leistungen hinterlegt.
                </Text>
              )}

              {activeOptions.map((opt) => {
                const isClubFee =
                  opt.type === 'CLUB_FEE' ||
                  (opt.is_required && !opt.is_selectable);
                const isToggleable = opt.is_selectable && !opt.is_required;

                return (
                  <View
                    key={opt.id}
                    className="flex-row items-center justify-between py-2 border-b border-gray-100"
                  >
                    <View style={{ flexShrink: 1 }}>
                      <Text className="text-sm font-medium" numberOfLines={1}>
                        {opt.label || opt.type}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {(opt.price_cents / 100).toFixed(2)} CHF
                        {isClubFee
                          ? ' · Pflicht'
                          : isToggleable
                          ? ' · Optional'
                          : ''}
                      </Text>
                    </View>

                    {isClubFee ? (
                      <Text className="text-xs text-green-600 font-semibold">
                        Included
                      </Text>
                    ) : isToggleable ? (
                      <Switch
                        value={selectedOptionIds.includes(opt.id)}
                        onValueChange={() => onToggleOption(opt.id)}
                      />
                    ) : null}
                  </View>
                );
              })}

              {/* Gesamtsumme */}
              <View className="flex-row items-center justify-between mt-4">
                <Text className="text-base font-semibold">Gesamtpreis</Text>
                <Text className="text-base font-semibold">
                  {totalPriceLabel}
                </Text>
              </View>
            </ScrollView>
          )}

          {/* Buttons */}
          <View className="flex-row mt-4 gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => !isBooking && onClose()}
              isDisabled={isBooking}
            >
              <ButtonText>Abbrechen</ButtonText>
            </Button>
            <Button
              className="flex-1"
              onPress={onConfirm}
              isDisabled={isBooking || isLoading || !activeOptions.length}
            >
              <ButtonText>
                {isBooking ? 'Buche…' : 'Jetzt buchen'}
              </ButtonText>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
