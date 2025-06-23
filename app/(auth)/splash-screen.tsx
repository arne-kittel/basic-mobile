import { View} from '@/components/ui/view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Button, ButtonText } from '@/components/ui/button';
import { Image } from '@/components/ui/image';

import { useColorScheme } from '@/components/useColorScheme';
import { useRouter } from 'expo-router';

export default function SignIn() {
  const colorScheme = useColorScheme();

  const imageSource = require("@/assets/logos/snb_logo.png")

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <VStack
        className='p-9 w-full items-center h-full justify-center'
        space='lg'>
          <VStack
            className='w-full items-center'
            space='lg'>
              {/* {colorScheme === "dark" ? (
                <Image source={{uri: '@/assets/logos/3x/Artboard 1@3.png'}} className="w-[219px] h-10" />
              ) : (
                <Image source={{uri: '@/assets/logos/3x/darkArtboard 1@3.png'}} className="w-[219px] h-10" />
              )} */}
            <Image
              size='2xl'
              source={imageSource}
              alt='image'
                />

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