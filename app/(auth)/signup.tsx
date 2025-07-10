import React, { useState } from "react";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Link, LinkText } from "@/components/ui/link";

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
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import { Redirect, useRouter } from "expo-router";

import { TextInput, TouchableOpacity, View } from 'react-native'


// Authentication
import { useSignUp } from '@clerk/clerk-expo';

const signUpSchema = z
  .object({
    email: z.string().min(1, "Email is required").email(),
    password: z
      .string()
      .min(6, "Must be at least 8 characters in length")
      .max(32, "Must be at most 32 characters in length")
      .regex(new RegExp(".*[A-Z].*"), "One uppercase character")
      .regex(new RegExp(".*[a-z].*"), "One lowercase character")
      .regex(new RegExp(".*\\d.*"), "One number")
      .regex(
        new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
        "One special character"
      ),
    confirmpassword: z
      .string()
      .min(6, "Must be at least 8 characters in length")
      .max(32, "Must be at most 32 characters in length")
      .regex(new RegExp(".*[A-Z].*"), "One uppercase character")
      .regex(new RegExp(".*[a-z].*"), "One lowercase character")
      .regex(new RegExp(".*\\d.*"), "One number")
      .regex(
        new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
        "One special character"
      ),
    rememberme: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: "Passwords do not match",
    path: ["confirmpassword"],
  });

type SignUpSchemaType = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
  });

  const toast = useToast();

  const { isLoaded, signUp, setActive } = useSignUp();
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [authErrors, setAuthErrors] = useState<{ message: string }[]>([]);

  // dodqUg-jobbi5-gyxquk
  const onSubmit = async (data: SignUpSchemaType) => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,

      })
      console.log("created signUp user", signUp.emailAddress, signUp.status)

      console.log("Created signUp user:", signUp);

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setPendingVerification(true);
      reset();

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code

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
  }

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleState = () => {
    setShowPassword((showState) => {
      return !showState;
    });
  };
  const handleConfirmPwState = () => {
    setShowConfirmPassword((showState) => {
      return !showState;
    });
  };
  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };
  const router = useRouter();

  if (pendingVerification) {
    return (
      <Redirect
        href={{
          pathname: "/(auth)/signup-code-verification",
          //params: { email: signUp.emailAddress },
        }}
      />
    );
  }


  return (
    <VStack className="p-9 pb-5 max-w-[440px] w-full" space="md">
      <VStack className="md:items-center" space="md">
        <VStack>
          <Heading className="md:text-center" size="3xl">
            Sign up
          </Heading>
          <Text>Sign up and become a member of the Sports & Business Club</Text>
        </VStack>
      </VStack>
      <VStack className="w-full">
        <VStack space="xl" className="w-full">
          <FormControl isInvalid={!!errors.email}>
            <FormControlLabel>
              <FormControlLabelText>Email</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="email"
              defaultValue=""
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    className="text-sm"
                    placeholder="Email"
                    type="text"
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
              <FormControlErrorIcon size="md" as={AlertTriangle} />
              <FormControlErrorText>
                {errors?.email?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          <FormControl isInvalid={!!errors.password}>
            <FormControlLabel>
              <FormControlLabelText>Password</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="password"
              defaultValue=""
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    className="text-sm"
                    placeholder="Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
                    type={showPassword ? "text" : "password"}
                  />
                  <InputSlot onPress={handleState} className="pr-3">
                    <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                  </InputSlot>
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon size="sm" as={AlertTriangle} />
              <FormControlErrorText>
                {errors?.password?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          <FormControl isInvalid={!!errors.confirmpassword}>
            <FormControlLabel>
              <FormControlLabelText>Confirm Password</FormControlLabelText>
            </FormControlLabel>
            <Controller
              defaultValue=""
              name="confirmpassword"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="Confirm Password"
                    className="text-sm"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
                    type={showConfirmPassword ? "text" : "password"}
                  />

                  <InputSlot onPress={handleConfirmPwState} className="pr-3">
                    <InputIcon
                      as={showConfirmPassword ? EyeIcon : EyeOffIcon}
                    />
                  </InputSlot>
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon size="sm" as={AlertTriangle} />
              <FormControlErrorText>
                {errors?.confirmpassword?.message}
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
                <CheckboxLabel>
                  I accept the Terms of Use & Privacy Policy
                </CheckboxLabel>
              </Checkbox>
            )}
          />
        </VStack>

        <VStack className="w-full my-7" space="lg">
          <Button className="w-full" onPress={handleSubmit(onSubmit)}>
            <ButtonText className="font-medium">Sign up</ButtonText>
          </Button>
        </VStack>
        <HStack className="self-center" space="sm">
          <Text size="md">Already have an account?</Text>
          <Pressable onPress={() => router.replace("/(auth)/signin")}>
            <LinkText
              className="font-medium text-primary-700 group-hover/link:text-primary-600 group-hover/pressed:text-primary-700"
              size="md"
            >
              Login
            </LinkText>
          </Pressable>
        </HStack>
      </VStack>
    </VStack>
  );
};