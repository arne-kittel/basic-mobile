import { View} from '@/components/ui/view';
import { Text } from '@/components/ui/text';

export default function SignIn() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold">Sign In</Text>
      <Text className="mt-4 text-gray-600">This is the sign-in page.</Text>
    </View>
  );
}