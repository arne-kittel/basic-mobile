import React, { useRef, useState, useEffect } from "react";
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
import { Redirect, router, useRouter } from "expo-router";
import { ProfileIcon } from "./assets/icons/profile";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { Center } from "@/components/ui/center";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { Keyboard, Platform, Alert } from "react-native";
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

import * as ImagePicker from "expo-image-picker";

// Authentication
import { useClerk, useUser } from "@clerk/clerk-expo";

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

// ---------- Zod Schema ----------
const userSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || /^\+?[1-9]\d{1,14}$/.test(val),
      "Phone number must be a valid international phone number"
    ),
  contactEmail: z
    .string()
    .email("Please enter a valid email address")
    .or(z.literal(""))
    .optional(),
  linkedinUrl: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        /^((https?:\/\/)?(www\.)?)?linkedin\.com\/.+$/i.test(val.trim()),
      "Please enter a valid LinkedIn URL"),
});

type userSchemaDetails = z.infer<typeof userSchema>;

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
  const { signOut } = useClerk();
  const [showModal, setShowModal] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    console.log("Signout Button Pressed");
    try {
      await signOut();
      router.replace("/(tabs)"); // Achtung: Route muss existieren
    } catch (error) {
      console.error(JSON.stringify(error, null, 2));
    }
  };

  const userImage = user?.imageUrl;

  return (
    <VStack className="md:items-center md:justify-center flex-1 w-full  p-6 md:gap-10 gap-16 md:m-auto md:w-1/2 h-full bg-white">
      <ModalComponent showModal={showModal} setShowModal={setShowModal} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack className="h-full w-full pb-8" space="2xl">
          <Center className="md:mt-14 mt-6 w-full md:px-10 md:pt-6 pb-4">
            <VStack space="lg" className="items-center">
              <Avatar size="2xl" className="bg-primary-600">
                <AvatarImage alt="Profile Image" source={{ uri: userImage }} />
                <AvatarBadge />
              </Avatar>
              <VStack className="gap-1 w-full items-center">
                <Text size="2xl" className="font-roboto text-dark">
                  {user?.firstName || user?.lastName
                    ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
                    : user?.primaryEmailAddress?.emailAddress}
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
                <ButtonText className="font-medium">Invite</ButtonText>
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
                        <Icon
                          as={item.iconName}
                          className="stroke-[#747474]"
                        />
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
              className="w-full"
              variant="solid"
              size="lg"
              onPress={handleSignOut}
            >
              <ButtonText className="font-medium">Logout</ButtonText>
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
          size="2xl"
          alt="Banner Image"
        />
      </Box>
      <Pressable className=" bg-background-950 rounded-full items-center justify-center h-8 w-8 right-6 top-[172px]">
        <Icon as={CameraSparklesIcon} />
      </Pressable>
      <Center className="w-full top-10">
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

          <FormControl isInvalid={!!errors.phoneNumber}>
            <FormControlLabel className="mb-2">
              <FormControlLabelText>Phone number</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <HStack className="gap-1">
                  <Select className="w-[28%]">
                    <SelectTrigger variant="outline" size="md">
                      <SelectInput placeholder="+41" />
                      <SelectIcon className="mr-1" as={ChevronDownIcon} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectItem label="Switzerland (+41)" value="+41" />
                        <SelectItem label="USA (+1)" value="+1" />
                        <SelectItem label="Germany (+49)" value="+49" />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                  <Input className="flex-1">
                    <InputField
                      placeholder="079655521"
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

          {/* Contact Email */}
          <FormControl isInvalid={!!errors.contactEmail}>
            <FormControlLabel className="mb-2">
              <FormControlLabelText>Contact Email</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="contactEmail"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="you@example.com"
                    type="text"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertCircle} size="md" />
              <FormControlErrorText>
                {errors?.contactEmail?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* LinkedIn URL */}
          <FormControl isInvalid={!!errors.linkedinUrl}>
            <FormControlLabel className="mb-2">
              <FormControlLabelText>LinkedIn URL</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="linkedinUrl"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="https://www.linkedin.com/in/username"
                    type="text"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertCircle} size="md" />
              <FormControlErrorText>
                {errors?.linkedinUrl?.message}
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

  const { user, isLoaded } = useUser();

  const handleKeyPress = () => {
    Keyboard.dismiss();
  };
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);

  const userImage = user?.imageUrl;

  // Lokaler State für das im Modal ausgewählte Bild
  const [profileImageUri, setProfileImageUri] = useState<string | undefined>(
    userImage
  );

  useEffect(() => {
    if (!isLoaded || !user || !showModal) return;

    reset({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phoneNumber:
        (user.unsafeMetadata?.phoneNumber as string | undefined) ??
        user.primaryPhoneNumber?.phoneNumber ??
        user.phoneNumbers?.[0]?.phoneNumber ??
        "",
      contactEmail:
        (user.unsafeMetadata?.contactEmail as string | undefined) ??
        user.primaryEmailAddress?.emailAddress ??
        "",
      linkedinUrl: (user.unsafeMetadata?.linkedinUrl as string | undefined) ?? "",
    });

    // Avatar im Modal mit aktuellem Clerk-Bild initialisieren
    setProfileImageUri(user.imageUrl);
  }, [isLoaded, user, showModal, reset]);

  const onSubmit = async (data: userSchemaDetails) => {
    console.log("Update user with:", data);
    if (!user) return;

    try {
      await user.update({
        firstName: data.firstName,
        lastName: data.lastName,
        unsafeMetadata: {
          ...(user.unsafeMetadata || {}),
          phoneNumber: data.phoneNumber,
          contactEmail: data.contactEmail,
          linkedinUrl: data.linkedinUrl,
        },
      });

      setShowModal(false);
      reset(data);
    } catch (err) {
      console.error("Error updating Clerk user", err);
    }
  };

  // Helper: Bildresultat verarbeiten (egal ob Kamera oder Galerie)
  const handleResult = async (
    result: ImagePicker.ImagePickerResult
  ): Promise<void> => {
    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset) return;

    const uri = asset.uri;
    const base64 = asset.base64;
    const mimeType = asset.mimeType || "image/jpeg";

    // Lokal im UI anzeigen
    if (uri) {
      setProfileImageUri(uri);
    }

    // Zu Clerk hochladen (Base64 als Data-URL)
    if (user && base64) {
      try {
        const dataUrl = `data:${mimeType};base64,${base64}`;
        await user.setProfileImage({ file: dataUrl });
        await user.reload();
      } catch (e) {
        console.error("Error uploading profile image to Clerk", e);
      }
    }
  };

  // Picker öffnen: Kamera oder Galerie
  const openImagePicker = async (source: "camera" | "gallery") => {
    try {
      if (source === "camera") {
        if (Platform.OS === "web") {
          console.warn("Camera is not supported on web, falling back to gallery.");
          return openImagePicker("gallery");
        }

        const { status } =
          await ImagePicker.requestCameraPermissionsAsync();

        if (status !== "granted") {
          console.warn("Permission to access camera was denied");
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true,
        });

        await handleResult(result);
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
          console.warn("Permission to access media library was denied");
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"], // kein MediaTypeOptions -> kein Warning
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true,
        });

        await handleResult(result);
      }
    } catch (e) {
      console.error("Error picking image", e);
    }
  };

  // Beim Klick auf Badge: Kamera / Galerie auswählen
  const handleAvatarPress = () => {
    if (Platform.OS === "web") {
      // auf Web direkt Galerie öffnen
      openImagePicker("gallery");
      return;
    }

    Alert.alert("Profilbild ändern", "Quelle auswählen", [
      {
        text: "Kamera",
        onPress: () => openImagePicker("camera"),
      },
      {
        text: "Galerie",
        onPress: () => openImagePicker("gallery"),
      },
      {
        text: "Abbrechen",
        style: "cancel",
      },
    ]);
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

        {/* Avatar + klickbarer Badge (unten rechts, Tailwind) */}
        <Center className="w-full top-16">
          <Avatar size="2xl" className="relative">
            <AvatarImage
              source={
                profileImageUri
                  ? { uri: profileImageUri }
                  : userImage
                    ? { uri: userImage }
                    : undefined
              }
            />
            <AvatarBadge className="justify-center items-center bg-background-500">
              <Pressable onPress={handleAvatarPress}>
                <Icon as={EditPhotoIcon} />
              </Pressable>
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

            <FormControl className="w-[47%]" isInvalid={!!errors.phoneNumber}>
              <FormControlLabel className="mb-2">
                <FormControlLabelText>Phone number</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <HStack className="gap-1">
                    {/* <Select className="w-[28%]">
                      <SelectTrigger variant="outline" size="md">
                        <SelectInput placeholder="+41" />
                        <SelectIcon className="mr-1" as={ChevronDownIcon} />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                          <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                          </SelectDragIndicatorWrapper>
                          <SelectItem label="Switzerland (+41)" value="+41" />
                          <SelectItem label="USA (+1)" value="+1" />
                          <SelectItem label="Germany (+49)" value="+49" />
                        </SelectContent>
                      </SelectPortal>
                    </Select> */}
                    <Input className="flex-1">
                      <InputField
                        placeholder="079655521"
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

            {/* Contact Email */}
            <FormControl className="w-[47%]" isInvalid={!!errors.contactEmail}>
              <FormControlLabel className="mb-2">
                <FormControlLabelText>Contact Email</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="contactEmail"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      placeholder="you@example.com"
                      type="text"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon as={AlertCircle} size="md" />
                <FormControlErrorText>
                  {errors?.contactEmail?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            {/* LinkedIn URL */}
            <FormControl className="w-[47%]" isInvalid={!!errors.linkedinUrl}>
              <FormControlLabel className="mb-2">
                <FormControlLabelText>LinkedIn URL</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="linkedinUrl"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      placeholder="https://www.linkedin.com/in/username"
                      type="text"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon as={AlertCircle} size="md" />
                <FormControlErrorText>
                  {errors?.linkedinUrl?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <Button onPress={handleSubmit(onSubmit)} className="flex-1 p-2">
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
}
