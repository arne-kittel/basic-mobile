import { VStack } from '@/components/ui/vstack'
import { Box } from "@/components/ui/box"
import { Image } from '@/components/ui/image'
import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { Button, ButtonText } from '@/components/ui/button'
import { SnBEvent } from '@/app/types/snb_event'
import { useAuth } from '@clerk/clerk-expo'


export default function MyEventsCard({event, onWithdrawSuccess}: {event: SnBEvent, onWithdrawSuccess: () => void}) {
    const { getToken } = useAuth();
    
    const handleWithdraw = async () => {
        try {
        console.log("Withdraw from event", event.id);
        const token = await getToken();
        console.log("🔐 Token:", token);
  
        if (!token) {
          console.warn("❌ Kein Token vorhanden – User nicht eingeloggt?");
          return;
        }
        
        const response = await fetch(`http://192.168.189.51:5050/api/events/withdraw`, {
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

    return (
        <VStack className='w-full' space='2xl'>
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
                  <VStack className="w-full my-7" space="lg">
                    <Button className="w-full">
                      <ButtonText className="font-medium" onPress={handleWithdraw}>Withdraw</ButtonText>
                    </Button>
                  </VStack>
                </VStack>
              </VStack>
          </VStack>
    )
}