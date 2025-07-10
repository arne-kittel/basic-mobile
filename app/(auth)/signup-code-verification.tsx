import React, { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Link, LinkText } from "@/components/ui/link";
import { AlertTriangle } from "lucide-react-native";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";

import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";

import { Keyboard, FlatList } from 'react-native';

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";


const verifySignUpCodeSchema = z.object({
  code: z.string().length(6, "Verification code must have 6 digits"),
});

type verifySignUpCodeSchemaType = z.infer<typeof verifySignUpCodeSchema>;

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, isLoaded, setActive } = useSignUp();

  const [authErrors, setAuthErrors] = useState<{ message: string }[]>([]);

  const router = useRouter();
  const toast = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<verifySignUpCodeSchemaType>({
    resolver: zodResolver(verifySignUpCodeSchema),
  });

  const onSubmit = async (data: verifySignUpCodeSchemaType) => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: data.code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        reset();
        router.replace('/')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
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
    reset();
  }

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  return (
    <VStack className="p-9 max-w-[440px] w-full" space="md">
      <Heading size="3xl">Verify your email</Heading>
      <Text>
        {email
          ? `We've sent a verification code to ${email}`
          : "Enter the verification code you received via email."}
      </Text>

      <VStack className="w-full">
        <VStack space="xl" className="w-full">
          <FormControl isInvalid={!!errors.code}>
            <FormControlLabel>
              <FormControlLabelText>Verfication code</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="code"
              defaultValue=''
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    className='text-sm'
                    placeholder='Code'
                    type="text"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType='done'
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon size="md" as={AlertTriangle} />
              <FormControlErrorText>
                {errors?.code?.message}
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
        </VStack>
      </VStack>
      <VStack className="w-full my-7" space="lg">
        <Button className="w-full" onPress={handleSubmit(onSubmit)}>
          <ButtonText className="font-medium">Verify</ButtonText>
        </Button>
      </VStack>
      <HStack className="self-center" space="sm">
        <Text size="md">Already have an account?</Text>
        <Pressable onPress={() => router.replace("/(auth)/signup")}>
          <LinkText
            className="font-medium text-primary-700 group-hover/link:text-primary-600 group-hover/pressed:text-primary-700"
            size="md"
          >
            Login
          </LinkText>
        </Pressable>
      </HStack>
    </VStack>
  );
}
