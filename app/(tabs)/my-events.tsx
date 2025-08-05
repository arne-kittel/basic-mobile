import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { ScrollView } from '@/components/ui/scroll-view';
import { Box } from '@/components/ui/box';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { useState, useEffect, useCallback } from 'react';
import { Button, ButtonText } from '@/components/ui/button';

import MyEventsCard from '@/components/ui/my-events-card';

import { useAuth } from '@clerk/clerk-expo';
import { $ZodNumberFormat } from 'zod/v4/core';

import { SnBEvent } from '@/app/types/snb_event';
import { useFocusEffect } from '@react-navigation/native';

const tempUri = require("@/assets/images/golf.jpg");


export default function MyEvents() {
  const [events, setEvents] = useState<SnBEvent[]>([]);

  const { getToken } = useAuth();

  const fetchEvents = async () => {
      try {
          console.log("🧪 Start fetchEvents()");
          
          const token = await getToken();
          console.log("🔐 Token:", token);
          
          if (!token) {
              console.warn("❌ Kein Token vorhanden – User nicht eingeloggt?");
              return;
            }
            
            console.log("🌍 URL:", "http://192.168.189.51:5050/api/events/my-events");
            console.log("📨 Headers:", {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            });
            
            const response = await fetch("http://192.168.189.51:5050/api/events/my-events", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            
            console.log("📥 Response status:", response.status);
            
            if (!response.ok) {
                const errText = await response.text();
                console.warn("❌ Backend response:", errText);
                throw new Error("Failed to fetch events");
            }
            
            const data = await response.json();
            console.log("✅ Events geladen:", data);
            
            setEvents(data);
        } catch (error) {
            console.error("❌ Fehler in fetchEvents:", error);
        }
    };
    
    useFocusEffect(
        useCallback(() => {
          fetchEvents();
        }, [])
      );
  
  

  return (
    <VStack className='p-4 pb-0 md:px-10 md:pt-6 md:pb-0 h-full w-full self-center mb-20 md:mb-2 bg-white'>
      <Heading size='xl' className='mb-4 font-roboto'>
        You're upcoming events
      </Heading>
      <HStack space='2xl' className='h-full w-full flex-1'>
        <ScrollView className='max-w-[900px] flex-1 md_mb-2'>
        <VStack className='w-full' space='2xl'>
          {events.map((event) => (
            <MyEventsCard key={event.id} event={event} onWithdrawSuccess={fetchEvents} />
          ))}
          </VStack>
        </ScrollView>
      </HStack>
    </VStack>
  )
}