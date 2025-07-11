import React, { useState } from "react";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { LinkText } from "@/components/ui/link";

import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import {
  ArrowLeftIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  Icon,
} from "@/components/ui/icon";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Keyboard, FlatList } from "react-native";
import { useForm, Controller, set } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import { Redirect, useRouter } from "expo-router";


// Authentication
import { useSignIn } from "@clerk/clerk-expo";


const USERS = [
  {
    email: "gabrial@gmail.com",
    password: "Gabrial@123",
  },
  {
    email: "tom@gmail.com",
    password: "Tom@123",
  },
  {
    email: "thomas@gmail.com",
    password: "Thomas@1234",
  },
];

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email(),
  password: z
    .string().min(1, "Password is required")
    .max(32, "Must be at most 32 characters in length"),
  rememberme: z.boolean().optional(),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export default function SignIn() {
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });
  const toast = useToast();
  const [validated, setValidated] = useState({
    emailValid: true,
    passwordValid: true,
  });
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [authErrors, setAuthErrors] = useState<{message: string}[]>([]);

  const onSubmit = async (data: LoginSchemaType) => {

    // arne.kittel@gmail.com
    // dejxaz-8batja-datbYp
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: data.email,
        password: data.password,
      })

      // If sign-in process is complete, set the created session as active and redirect user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId})
        reset();
        router.replace('/(tabs)');
      } else {
        // if the status isn't complete, check why. User might nieed to complete furhter steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
        toast.show({
          placement: 'bottom',
          render: ({ id }) => (
            <Toast nativeID={id} variant='solid'>
            <ToastTitle>Login failed. Please try again.</ToastTitle>
          </Toast>
          )
        })
      }
      reset();

      } catch (err: any) {
        // See https://clerk.com/docs/custom-flows/error-handling for more info on error handling
        if (err.errors && Array.isArray(err.errors)) {
          setAuthErrors(err.errors.map((e: any) => ({ message: e.longMessage })));
        } else {
          setAuthErrors([{ message: err.message || "An unknown error occurred" }]);
        }
        console.error(JSON.stringify(err, null, 2));
        toast.show({
          placement: 'bottom',
          render: ({ id }) => (
            <Toast nativeID={id} variant='solid' action='error'>
              <ToastTitle>Login failed. Please try again.</ToastTitle>
            </Toast>
          )
        })
      }
    };

  const [showPassword, setShowPassword] = useState(false);

  const handleState = () => {
    setShowPassword((showState) => {
      return !showState;
    });
  };

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  return (
    <VStack className="p-9 pb-5 max-w-[440px] w-full bg-white" space="md">
      <VStack className="md:items-center" space="md">
        <VStack>
          <Heading className="md:text-center" size="3xl">
            Log in
          </Heading>
          <Text>Login to see the most recent events of the club</Text>
        </VStack>
      </VStack>
      <VStack className="w-full">
        <VStack space="xl" className="w-full">
          <FormControl
            isInvalid={!!errors?.email || !validated.emailValid}
            className="w-full"
          >
            <FormControlLabel>
              <FormControlLabelText>Email</FormControlLabelText>
            </FormControlLabel>
            <Controller
              defaultValue=""
              name="email"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="Enter email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertTriangle} />
              <FormControlErrorText>
                {errors?.email?.message ||
                  (!validated.emailValid && "Email ID not found")}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          {/* Label Message */}
          <FormControl
            isInvalid={!!errors.password || !validated.passwordValid}
            className="w-full"
          >
            <FormControlLabel>
              <FormControlLabelText>Password</FormControlLabelText>
            </FormControlLabel>
            <Controller
              defaultValue=""
              name="password"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
                  />
                  <InputSlot onPress={handleState} className="pr-3">
                    <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                  </InputSlot>
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertTriangle} />
              <FormControlErrorText>
                {errors?.password?.message ||
                  (!validated.passwordValid && "Password was incorrect")}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          {authErrors.length > 0 && (
            <VStack className="w-full" space="sm">
              <FlatList
                data={authErrors}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <Text className="text-red-500 text-sm">
                    {item.message}
                  </Text>
                )}
              />
            </VStack>
              )}  
          <HStack className="w-full justify-between ">
            <Controller
              name="rememberme"
              defaultValue={false}
              control={control}
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  size="sm"
                  value="Remember me"
                  isChecked={value}
                  onChange={onChange}
                  aria-label="Remember me"
                >
                  <CheckboxIndicator>
                    <CheckboxIcon as={CheckIcon} />
                  </CheckboxIndicator>
                  <CheckboxLabel>Remember me</CheckboxLabel>
                </Checkbox>
              )}
            />
            <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
                <LinkText className="font-medium text-sm text-primary-700 group-hover/link:text-primary-600">
                    Forgot Password?
                </LinkText>
            </Pressable>
          </HStack>
        </VStack>
        <VStack className='w-full my-7' space='lg'>
            <Button className="w-full" onPress={handleSubmit(onSubmit)}>
                <ButtonText className="font-medium">Log in</ButtonText>
            </Button>
        </VStack>
        <HStack className="self-center" space="sm">
          <Text size="md">Don't have an account?</Text>
            <Pressable onPress={() => router.push('/(auth)/signup')}>
                <LinkText className="font-medium text-sm text-primary-700 group-hover/link:text-primary-600">
                    Sign up
                </LinkText>
            </Pressable>
        </HStack>
      </VStack>
    </VStack>
  );
};