import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { ScrollView } from '@/components/ui/scroll-view';
import { Box } from '@/components/ui/box';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { useState, useEffect } from 'react';

import { useAuth } from '@clerk/clerk-expo';
import { $ZodNumberFormat } from 'zod/v4/core';

interface Event {
  id: number;
  title: string;
  description: string;
  creator_id: number;
  host_id: number;
  location: string;
  is_online: boolean;
  start_time: string; //ISO 8601 string
  end_time?: string;
  max_participants?: number;
}

const tempUri = require("@/assets/images/golf.jpg");


export default function EventFeed() {
  const [events, setEvents] = useState<Event[]>([]);

  const { getToken } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log("🧪 Start fetchEvents()");
        
        const token = await getToken();
        console.log("🔐 Token:", token);
  
        if (!token) {
          console.warn("❌ Kein Token vorhanden – User nicht eingeloggt?");
          return;
        }
  
        console.log("🌍 URL:", "http://192.168.189.51:5050/api/events/");
        console.log("📨 Headers:", {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        });
  
        const response = await fetch("http://192.168.189.51:5050/api/events/", {
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
  
    fetchEvents(); // ← GANZ WICHTIG!
  }, []);
  
  

  return (
    <VStack className='p-4 pb-0 md:px-10 md:pt-6 md:pb-0 h-full w-full self-center mb-20 md:mb-2 bg-white'>
      <Heading size='2xl' className='mb-4 font-roboto'>
        Events
      </Heading>
      <HStack space='2xl' className='h-full w-full flex-1'>
        <ScrollView className='max-w-[900px] flex-1 md_mb-2'>
          <VStack className='w-full' space='2xl'>
            {events.map((event) => (
              <VStack
                className="rounded-xl border border-outline-300 p-5"
                key={event.id}
              >
                <Box className="w-full h-64 rounded">
                  <Image
                    size="2xl"
                    source={require("@/assets/images/golf.jpg")} // Platzhalter
                    alt="image"
                    className="w-full"
                  />
                </Box>
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
                  <Text className="text-sm text-gray-600">
                    Max. Participants: {event.max_participants ?? "unlimited"}
                  </Text>
                </VStack>
              </VStack>
            ))}
          </VStack>
        </ScrollView>
      </HStack>
    </VStack>
  )
}