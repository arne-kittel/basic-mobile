import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function Profile() {
  return (
    <VStack className='p-4 pb-0 md:px-10 md:pt-6 md:pb-0 h-full w-full self-center mb-20 md:mb-2'>
      <Heading size='2xl' className='font-roboto'>
        Profile
      </Heading>
      <Text className='mt-4'>This is the profile page.</Text>
    </VStack>
  );
}