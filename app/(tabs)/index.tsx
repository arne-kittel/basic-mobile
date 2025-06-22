import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { ScrollView } from '@/components/ui/scroll-view';
import { Box } from '@/components/ui/box';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';

interface BlogData {
  bannerUri: string;
  title: string;
  description: string;
  publishedDate: string;
}

const BLOGS_DATA: BlogData[] = [
  {
    bannerUri: require("@/assets/images/golf.jpg"),
    title: "Golfing at Öschberghof",
    description:
      "Discover how the power of positive thinking can transform your life, boost your confidence, and help you overcome challenges. Explore practical tips and techniques to cultivate a positive mindset for greater happiness and success.",
    publishedDate: "May 15, 2023",
  },
  {
    bannerUri: require("@/assets/images/image2.png"),
    title: "The Power of Positive Thinking",
    description:
      "Discover how the power of positive thinking can transform your life, boost your confidence, and help you overcome challenges. Explore practical tips and techniques to cultivate a positive mindset for greater happiness and success.",
    publishedDate: "May 15, 2023",
  },
  {
    bannerUri: require("@/assets/images/image2.png"),
    title: "The Power of Positive Thinking",
    description:
      "Discover how the power of positive thinking can transform your life, boost your confidence, and help you overcome challenges. Explore practical tips and techniques to cultivate a positive mindset for greater happiness and success.",
    publishedDate: "May 15, 2023",
  },
];

export default function EventFeed () {
  return (
    <VStack className='p-4 pb-0 md:px-10 md:pt-6 md:pb-0 h-full w-full self-center mb-20 md:mb-2 bg-white'>
      <Heading size='2xl' className='mb-4 font-roboto'>
        Events
      </Heading>
      <HStack space='2xl' className='h-full w-full flex-1'>
        <ScrollView className='max-w-[900px] flex-1 md_mb-2'>
          <VStack className='w-full' space='2xl'>
            {BLOGS_DATA.map((item, index) => {
              return (
                <VStack
                  className="rounded-xl border border-outline-300 p-5"
                  key={index}
                >
                  <Box className="w-full h-64 rounded">
                    <Image
                      size='2xl'
                      source={item.bannerUri}
                      alt="image"
                      className='w-full'
                    />
                  </Box>
                  <VStack className="mt-4" space="md">
                    <Text className="text-sm">{item.publishedDate}</Text>
                    <Heading size="md">{item.title}</Heading>
                    <Text className="line-clamp-2">{item.description}</Text>
                  </VStack>
                </VStack>
              );
            })}
          </VStack>
        </ScrollView>
      </HStack>
    </VStack>
  )
}