import React, { useRef, useState } from "react";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import {
  AlertCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  EditIcon,
  Icon,
  MenuIcon,
  PhoneIcon,
  SettingsIcon,
} from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Pressable } from "@/components/ui/pressable";
import { AlertCircle, type LucideIcon } from "lucide-react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Image } from "@/components/ui/image";
import { ScrollView } from "@/components/ui/scroll-view";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
} from "@/components/ui/modal";
import { Input, InputField } from "@/components/ui/input";
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { useRouter } from "expo-router";
import { ProfileIcon } from "./assets/icons/profile";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { Center } from "@/components/ui/center";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { Keyboard, Platform } from "react-native";
import { SubscriptionIcon } from "./assets/icons/subscription";
import { DownloadIcon } from "./assets/icons/download";
import { FaqIcon } from "./assets/icons/faq";
import { NewsBlogIcon } from "./assets/icons/news-blog";
import { HomeIcon } from "./assets/icons/home";
import { GlobeIcon } from "./assets/icons/globe";
import { InboxIcon } from "./assets/icons/inbox";
import { HeartIcon } from "./assets/icons/heart";
import { Divider } from "@/components/ui/divider";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { CameraSparklesIcon } from "./assets/icons/camera-sparkles";
import { EditPhotoIcon } from "./assets/icons/edit-photo";
import { isWeb } from "@gluestack-ui/nativewind-utils/IsWeb";
import { B } from "@expo/html-elements";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

type MobileHeaderProps = {
  title: string;
};

type HeaderProps = {
  title: string;
  toggleSidebar: () => void;
};

type Icons = {
  iconName: LucideIcon | typeof Icon;
  iconText: string;
};
const SettingsList: Icons[] = [
  {
    iconName: ProfileIcon,
    iconText: "Profile",
  },
  {
    iconName: SettingsIcon,
    iconText: "Preferences",
  },
  {
    iconName: SubscriptionIcon,
    iconText: "Subscription",
  },
];
const ResourcesList: Icons[] = [
  {
    iconName: DownloadIcon,
    iconText: "Downloads",
  },
  {
    iconName: FaqIcon,
    iconText: "FAQs",
  },
  {
    iconName: NewsBlogIcon,
    iconText: "News & Blogs",
  },
];
type BottomTabs = {
  iconName: LucideIcon | typeof Icon;
  iconText: string;
};
const bottomTabsList: BottomTabs[] = [
  {
    iconName: HomeIcon,
    iconText: "Home",
  },

  {
    iconName: GlobeIcon,
    iconText: "Community",
  },
  {
    iconName: InboxIcon,
    iconText: "Inbox",
  },
  {
    iconName: HeartIcon,
    iconText: "Favourite",
  },
  {
    iconName: ProfileIcon,
    iconText: "Profile",
  },
];
interface UserStats {
  friends: string;
  friendsText: string;
  followers: string;
  followersText: string;
  rewards: string;
  rewardsText: string;
  posts: string;
  postsText: string;
}
const userData: UserStats[] = [
  {
    friends: "45K",
    friendsText: "Friends",
    followers: "500M",
    followersText: "Followers",
    rewards: "40",
    rewardsText: "Rewards",
    posts: "346",
    postsText: "Posts",
  },
];

type userSchemaDetails = z.infer<typeof userSchema>;

// Define the Zod schema
const userSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  gender: z.enum(["male", "female", "other"]),
  phoneNumber: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Phone number must be a valid international phone number"
    ),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must be less than 100 characters"),
  state: z
    .string()
    .min(1, "State is required")
    .max(100, "State must be less than 100 characters"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country must be less than 100 characters"),
  zipcode: z
    .string()
    .min(1, "Zipcode is required")
    .max(20, "Zipcode must be less than 20 characters"),
});

interface AccountCardType {
  iconName: LucideIcon | typeof Icon;
  subText: string;
  endIcon: LucideIcon | typeof Icon;
}
const accountData: AccountCardType[] = [
  {
    iconName: InboxIcon,
    subText: "Settings",
    endIcon: ChevronRightIcon,
  },
  {
    iconName: GlobeIcon,
    subText: "Notifications",
    endIcon: ChevronRightIcon,
  },
  {
    iconName: PhoneIcon,
    subText: "Rewards",
    endIcon: ChevronRightIcon,
  },
];
const MainContent = () => {
  const [showModal, setShowModal] = useState(false);
  const { logOut } = useContext(AuthContext);

  return (
    <VStack className="md:items-center md:justify-center flex-1 w-full  p-6 md:gap-10 gap-16 md:m-auto md:w-1/2 h-full bg-white">
      <ModalComponent showModal={showModal} setShowModal={setShowModal} />
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <VStack className="h-full w-full pb-8" space="2xl">
          <Center className="md:mt-14 mt-6 w-full md:px-10 md:pt-6 pb-4">
            <VStack space="lg" className="items-center">
              <Avatar size="2xl" className="bg-primary-600">
                <AvatarImage
                  alt="Profile Image"
                  source={require("@/assets/profile-screens/profile/image.png")}
                />
                <AvatarBadge />
              </Avatar>
              <VStack className="gap-1 w-full items-center">
                <Text size="2xl" className="font-roboto text-dark">
                  Arne Kittel
                </Text>
                <Text className="font-roboto text-sm text-typograpphy-700">
                  # 000000001
                </Text>
              </VStack>
              <Button
                variant="outline"
                action="secondary"
                onPress={() => setShowModal(true)}
                className="gap-3 relative"
              >
                <ButtonText className="text-dark">Edit Profile</ButtonText>
                <ButtonIcon as={EditIcon} />
              </Button>
            </VStack>
          </Center>
          <VStack className="mx-6" space="2xl">
            <HStack
              className="py-5 px-6 border rounded-xl border-outline-300 justify-between items-center"
              space="2xl"
            >
              <HStack space="2xl" className="items-center">
                <VStack>
                  <Text className="text-typography-900 text-lg" size="lg">
                    Your referral code
                  </Text>
                  <Text className="font-roboto text-sm md:text-[16px]">
                    #000000001
                  </Text>
                </VStack>
              </HStack>
              <Button className="px-3" variant="solid">
                <ButtonText className="font-medium">
                  Invite
                </ButtonText>
              </Button>
            </HStack>
            <Heading className="font-roboto" size="xl">
              Account
            </Heading>
            <VStack className="py-2 px-4 border rounded-xl border-outline-300 justify-between items-center">
              <HStack
                space="2xl"
                className="justify-between items-center w-full flex-1 py-4 px-2"
              >
                <HStack className="items-center" space="md">
                  <Icon as={ProfileIcon} className="stroke-[#747474]" />
                  <Text size="lg">Settings</Text>
                </HStack>
                <Icon as={ChevronRightIcon} />
              </HStack>
              <Divider className="my-1" />
              <HStack
                space="2xl"
                className="justify-between items-center w-full flex-1 py-4 px-2"
              >
                <HStack className="items-center" space="md">
                  <Icon as={ProfileIcon} className="stroke-[#747474]" />
                  <Text size="lg">Settings</Text>
                </HStack>
                <Icon as={ChevronRightIcon} />
              </HStack>
              <Divider className="my-1" />
              <HStack
                space="2xl"
                className="justify-between items-center w-full flex-1 py-4 px-2"
              >
                <HStack className="items-center" space="md">
                  <Icon as={ProfileIcon} className="stroke-[#747474]" />
                  <Text size="lg">Settings</Text>
                </HStack>
                <Icon as={ChevronRightIcon} />
              </HStack>
            </VStack>
            <Heading className="font-roboto" size="xl">
              Preferences
            </Heading>
            <VStack className="py-2 px-4 border rounded-xl border-outline-300 justify-between items-center">
              {accountData.map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    <HStack
                      space="2xl"
                      className="justify-between items-center w-full flex-1 py-3 px-2"
                      key={index}
                    >
                      <HStack className="items-center" space="md">
                        <Icon as={item.iconName} className="stroke-[#747474]" />
                        <Text size="lg">{item.subText}</Text>
                      </HStack>
                      <Icon as={item.endIcon} />
                    </HStack>
                    {accountData.length - 1 !== index && (
                      <Divider className="my-1" />
                    )}
                  </React.Fragment>
                );
              })}
            </VStack>
            <Button
              className='w-full'
              variant='solid'
              size='lg'
              onPress={logOut}
            >
              <ButtonText className='font-medium'>Logout</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </ScrollView>
    </VStack>
  );
};
const MobileScreen = () => {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<userSchemaDetails>({
    resolver: zodResolver(userSchema),
  });

  const handleKeyPress = () => {
    Keyboard.dismiss();
  };
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const onSubmit = (_data: userSchemaDetails) => {
    reset();
  };

  return (
    <VStack className="md:hidden mb-5">
      <Box className="w-full h-[188px]">
        <Image
          source={require("@/assets/profile-screens/profile/image2.png")}
          size ="2xl"
          alt="Banner Image"
        />
      </Box>
      <Pressable className=" bg-background-950 rounded-full items-center justify-center h-8 w-8 right-6 top-[172px]">
        <Icon as={CameraSparklesIcon} />
      </Pressable>
      <Center className="w-full  top-10">
        <Avatar size="2xl">
          <AvatarImage
            source={require("@/assets/profile-screens/profile/image.png")}
          />
          <AvatarBadge className="justify-center items-center bg-background-950">
            <Icon as={EditPhotoIcon} />
          </AvatarBadge>
        </Avatar>
      </Center>
      <VStack space="lg" className="mx-4 mt-4">
        <Heading className="font-roboto" size="sm">
          General Information
        </Heading>
        <VStack space="md">
          <FormControl isInvalid={!!errors.firstName || isNameFocused}>
            <FormControlLabel className="mb-2">
              <FormControlLabelText>First Name</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="firstName"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await userSchema.parseAsync({
                      firstName: value,
                    });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="First Name"
                    type="text"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} size="md" />
              <FormControlErrorText>
                {errors?.firstName?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          <FormControl isInvalid={!!errors.lastName || isNameFocused}>
            <FormControlLabel className="mb-2">
              <FormControlLabelText>Last Name</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="lastName"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await userSchema.parseAsync({
                      lastName: value,
                    });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="Last Name"
                    type="text"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} size="md" />
              <FormControlErrorText>
                {errors?.lastName?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          <FormControl isInvalid={!!errors.gender}>
            <FormControlLabel className="mb-2">
              <FormControlLabelText>Gender</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="gender"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await userSchema.parseAsync({ city: value });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, value } }) => (
                <Select onValueChange={onChange} selectedValue={value}>
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder="Select" />
                    <SelectIcon className="mr-3" as={ChevronDownIcon} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label="Male" value="male" />
                      <SelectItem label="Female" value="female" />
                      <SelectItem label="Others" value="others" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertCircle} size="md" />
              <FormControlErrorText>
                {errors?.gender?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          <FormControl isInvalid={!!errors.phoneNumber}>
            <FormControlLabel className="mb-2">
              <FormControlLabelText>Phone number</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="phoneNumber"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await userSchema.parseAsync({ phoneNumber: value });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <HStack className="gap-1">
                  <Select className="w-[28%]">
                    <SelectTrigger variant="outline" size="md">
                      <SelectInput placeholder="+91" />
                      <SelectIcon className="mr-1" as={ChevronDownIcon} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectItem label="93" value="93" />
                        <SelectItem label="155" value="155" />
                        <SelectItem label="1-684" value="-1684" />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                  <Input className="flex-1">
                    <InputField
                      placeholder="89867292632"
                      type="text"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="number-pad"
                      onBlur={onBlur}
                      onSubmitEditing={handleKeyPress}
                      returnKeyType="done"
                    />
                  </Input>
                </HStack>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertCircle} size="md" />
              <FormControlErrorText>
                {errors?.phoneNumber?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        </VStack>
        <Heading className="font-roboto" size="sm">
          Address
        </Heading>
        <VStack space="md">
          <FormControl
            isInvalid={(!!errors.city || isEmailFocused) && !!errors.city}
          >
            <FormControlLabel className="mb-2">
              <FormControlLabelText>City</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="city"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await userSchema.parseAsync({ city: value });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Select onValueChange={onChange} selectedValue={value}>
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder="Select" />
                    <SelectIcon className="mr-3" as={ChevronDownIcon} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label="Bengaluru" value="Bengaluru" />
                      <SelectItem label="Udupi" value="Udupi" />
                      <SelectItem label="Others" value="Others" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertCircle} size="md" />
              <FormControlErrorText>
                {errors?.city?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          <FormControl
            isInvalid={(!!errors.state || isEmailFocused) && !!errors.state}
          >
            <FormControlLabel className="mb-2">
              <FormControlLabelText>State</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="state"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await userSchema.parseAsync({ state: value });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Select onValueChange={onChange} selectedValue={value}>
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder="Select" />
                    <SelectIcon className="mr-3" as={ChevronDownIcon} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label="Karnataka" value="Karnataka" />
                      <SelectItem label="Haryana" value="Haryana" />
                      <SelectItem label="Others" value="Others" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertCircle} size="md" />
              <FormControlErrorText>
                {errors?.state?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          <FormControl
            isInvalid={(!!errors.country || isEmailFocused) && !!errors.country}
          >
            <FormControlLabel className="mb-2">
              <FormControlLabelText>Country</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="country"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await userSchema.parseAsync({ country: value });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Select onValueChange={onChange} selectedValue={value}>
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder="Select" />
                    <SelectIcon className="mr-3" as={ChevronDownIcon} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label="India" value="India" />
                      <SelectItem label="Sri Lanka" value="Sri Lanka" />
                      <SelectItem label="Others" value="Others" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertCircle} size="md" />
              <FormControlErrorText>
                {errors?.country?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          <FormControl isInvalid={!!errors.zipcode || isEmailFocused}>
            <FormControlLabel className="mb-2">
              <FormControlLabelText>Zipcode</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="zipcode"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await userSchema.parseAsync({
                      zipCode: value,
                    });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="Enter 6 - digit zip code"
                    type="text"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertCircle} size="md" />
              <FormControlErrorText>
                {errors?.zipcode?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        </VStack>
        <Button
          onPress={() => {
            handleSubmit(onSubmit)();
          }}
          className="flex-1 p-2"
        >
          <ButtonText>Save Changes</ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
};
const ModalComponent = ({
  showModal,
  setShowModal,
}: {
  showModal: boolean;
  setShowModal: any;
}) => {
  const ref = useRef(null);
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<userSchemaDetails>({
    resolver: zodResolver(userSchema),
  });

  const handleKeyPress = () => {
    Keyboard.dismiss();
  };
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const onSubmit = (_data: userSchemaDetails) => {
    setShowModal(false);
    reset();
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={() => {
        setShowModal(false);
      }}
      finalFocusRef={ref}
      size="lg"
    >
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader className=" w-full">
          <Heading size="2xl" className="text-typography-800 pt-4 pl-4">
            Edit Profile
          </Heading>
          <ModalCloseButton>
            <Icon
              as={CloseIcon}
              size="md"
              className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900"
            />
          </ModalCloseButton>
        </ModalHeader>
        <Center className="w-full  top-16">
          <Avatar size="2xl">
            <AvatarImage
              source={require("@/assets/profile-screens/profile/image.png")}
            />
            <AvatarBadge className="justify-center items-center bg-background-500">
              <Icon as={EditPhotoIcon} />
            </AvatarBadge>
          </Avatar>
        </Center>
        <ModalBody className="px-10 py-6">
          <VStack space="2xl">
            
            <FormControl
              isInvalid={!!errors.firstName || isNameFocused}
              className="w-[47%]"
            >
              <FormControlLabel className="mb-2">
                <FormControlLabelText>First Name</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="firstName"
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await userSchema.parseAsync({
                        firstName: value,
                      });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      placeholder="First Name"
                      type="text"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={handleKeyPress}
                      returnKeyType="done"
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} size="md" />
                <FormControlErrorText>
                  {errors?.firstName?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            <FormControl
              isInvalid={!!errors.lastName || isNameFocused}
              className="w-[47%]"
            >
              <FormControlLabel className="mb-2">
                <FormControlLabelText>Last Name</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="lastName"
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await userSchema.parseAsync({
                        lastName: value,
                      });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      placeholder="Last Name"
                      type="text"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={handleKeyPress}
                      returnKeyType="done"
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} size="md" />
                <FormControlErrorText>
                  {errors?.lastName?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            <FormControl className="w-[47%]" isInvalid={!!errors.gender}>
              <FormControlLabel className="mb-2">
                <FormControlLabelText>Gender</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="gender"
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await userSchema.parseAsync({ city: value });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <Select onValueChange={onChange} selectedValue={value}>
                    <SelectTrigger variant="outline" size="md">
                      <SelectInput placeholder="Select" />
                      <SelectIcon className="mr-3" as={ChevronDownIcon} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectItem label="Male" value="male" />
                        <SelectItem label="Female" value="female" />
                        <SelectItem label="Others" value="others" />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon as={AlertCircle} size="md" />
                <FormControlErrorText>
                  {errors?.gender?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl className="w-[47%]" isInvalid={!!errors.phoneNumber}>
              <FormControlLabel className="mb-2">
                <FormControlLabelText>Phone number</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="phoneNumber"
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await userSchema.parseAsync({ phoneNumber: value });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <HStack className="gap-1">
                    <Select className="w-[28%]">
                      <SelectTrigger variant="outline" size="md">
                        <SelectInput placeholder="+91" />
                        <SelectIcon className="mr-1" as={ChevronDownIcon} />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                          <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                          </SelectDragIndicatorWrapper>
                          <SelectItem label="93" value="93" />
                          <SelectItem label="155" value="155" />
                          <SelectItem label="1-684" value="-1684" />
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                    <Input className="flex-1">
                      <InputField
                        placeholder="89867292632"
                        type="text"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="number-pad"
                        onBlur={onBlur}
                        onSubmitEditing={handleKeyPress}
                        returnKeyType="done"
                      />
                    </Input>
                  </HStack>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon as={AlertCircle} size="md" />
                <FormControlErrorText>
                  {errors?.phoneNumber?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            <FormControl
              className="w-[47%]"
              isInvalid={(!!errors.city || isEmailFocused) && !!errors.city}
            >
              <FormControlLabel className="mb-2">
                <FormControlLabelText>City</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="city"
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await userSchema.parseAsync({ city: value });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Select onValueChange={onChange} selectedValue={value}>
                    <SelectTrigger variant="outline" size="md">
                      <SelectInput placeholder="Select" />
                      <SelectIcon className="mr-3" as={ChevronDownIcon} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectItem label="Bengaluru" value="Bengaluru" />
                        <SelectItem label="Udupi" value="Udupi" />
                        <SelectItem label="Others" value="Others" />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon as={AlertCircle} size="md" />
                <FormControlErrorText>
                  {errors?.city?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            <FormControl
              className="w-[47%]"
              isInvalid={(!!errors.state || isEmailFocused) && !!errors.state}
            >
              <FormControlLabel className="mb-2">
                <FormControlLabelText>State</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="state"
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await userSchema.parseAsync({ state: value });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Select onValueChange={onChange} selectedValue={value}>
                    <SelectTrigger variant="outline" size="md">
                      <SelectInput placeholder="Select" />
                      <SelectIcon className="mr-3" as={ChevronDownIcon} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectItem label="Karnataka" value="Karnataka" />
                        <SelectItem label="Haryana" value="Haryana" />
                        <SelectItem label="Others" value="Others" />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon as={AlertCircle} size="md" />
                <FormControlErrorText>
                  {errors?.state?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            <FormControl
              className="w-[47%]"
              isInvalid={
                (!!errors.country || isEmailFocused) && !!errors.country
              }
            >
              <FormControlLabel className="mb-2">
                <FormControlLabelText>Country</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="country"
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await userSchema.parseAsync({ country: value });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Select onValueChange={onChange} selectedValue={value}>
                    <SelectTrigger variant="outline" size="md">
                      <SelectInput placeholder="Select" />
                      <SelectIcon className="mr-3" as={ChevronDownIcon} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectItem label="India" value="India" />
                        <SelectItem label="Sri Lanka" value="Sri Lanka" />
                        <SelectItem label="Others" value="Others" />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon as={AlertCircle} size="md" />
                <FormControlErrorText>
                  {errors?.country?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            <FormControl
              className="w-[47%]"
              isInvalid={!!errors.zipcode || isEmailFocused}
            >
              <FormControlLabel className="mb-2">
                <FormControlLabelText>Zipcode</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="zipcode"
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await userSchema.parseAsync({
                        zipCode: value,
                      });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      placeholder="Enter 6 - digit zip code"
                      type="text"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={handleKeyPress}
                      returnKeyType="done"
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon as={AlertCircle} size="md" />
                <FormControlErrorText>
                  {errors?.zipcode?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            <Button
              onPress={() => {
                handleSubmit(onSubmit)();
              }}
              className="flex-1 p-2"
            >
              <ButtonText>Save Changes</ButtonText>
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
export function Profile() {
  return (
    <SafeAreaView className="h-full w-full">
      <MainContent />
    </SafeAreaView>
  );
};
