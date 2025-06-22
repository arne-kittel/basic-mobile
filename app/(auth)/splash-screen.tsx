import { View} from '@/components/ui/view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Button, ButtonText } from '@/components/ui/button';
import { useRouter } from 'expo-router';

export default function SignIn() {
  return (
    <SafeAreaView className='flex-1 bg-white'>
      <VStack
        className='p-9 w-full items-center h-full justify-center'
        space='lg'>
          <VStack
            className='w-full'
            space='lg'>
            <Button
              className='w-full'
              variant='solid'
              size='lg'
              onPress={() => useRouter().push('/(auth)/signin')}
            >
              <ButtonText className='font-medium'>Login</ButtonText>
            </Button>
            <Button
              className='w-full'
              variant='solid'
              size='lg'
              onPress={() => useRouter().push('/(auth)/signup')}
            >
              <ButtonText className='font-medium'>Sign Up</ButtonText>
            </Button>
          </VStack>    
      </VStack>
    </SafeAreaView>
  );
}