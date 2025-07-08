import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { TextInput } from 'react-native'; // Später durch FormControl ersetzen

import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { ArrowLeftIcon, Icon } from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";
import { Keyboard } from "react-native";
import { useForm, Controller, set } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Pressable } from "@/components/ui/pressable";

import { useEffect, useState } from "react";

// Authentication
import { useAuth, useSignIn } from '@clerk/clerk-expo';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email(),
});

type forgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {

  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState(''); 

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');

  const [successfulCreation, setSuccessfulCreation] = useState(false);

  const router = useRouter();
  
  // useEffect(() => {
  //   if (isSignedIn) {
  //     router.push('/(tabs)')
  //   }
  // })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<forgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const toast = useToast();

  const onReset = async () => {
    if (!isLoaded) return;
    
    try {
      const resetPasswordAttempt = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      })
      
      if (resetPasswordAttempt.status === 'needs_second_factor') {
        setSecondFactor(true);
        setError('');
        
      } else if (resetPasswordAttempt.status === 'complete') {
        setActive({ session: resetPasswordAttempt.createdSessionId });
        setError('');
      } else {
        console.error(JSON.stringify(resetPasswordAttempt, null, 2));}
      } catch (error) {
        console.error(JSON.stringify(error, null, 2));
        toast.show({
          placement: "bottom right",
          render: ({ id }) => {
            return (
              <Toast nativeID={id} variant="solid" action="error">
                <ToastTitle>Reset failed. Please try again.</ToastTitle>
              </Toast>
            );
          },
        });
      }
    }
      
      
  const onSubmit = async (_data: forgotPasswordSchemaType) => {

    if (!isLoaded) {
      return;
    }

    try {
      const requestCodeAttempt = await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: _data.email,
      })

      if (requestCodeAttempt.status === 'needs_first_factor') {
        setSuccessfulCreation(true)
        setError('')
      } else {
          // if the status isn't complete, check why. User might nieed to complete furhter steps.
          console.error(JSON.stringify(requestCodeAttempt, null, 2));
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
    } catch (error) {
      console.error(JSON.stringify(error, null, 2));
        toast.show({
        placement: "bottom right",
        render: ({ id }) => {
          return (
            <Toast nativeID={id} variant="solid" action="success">
            <ToastTitle>Link Sent Successfully</ToastTitle>
          </Toast>
        );
        },
      });
    }
  };

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  if (successfulCreation) {
    return (
      <VStack className="p-9 max-w-[440px] w-full space-y-6">
            <Heading size="2xl">Verify your email</Heading>
            <Text>Paste verification code sent by email</Text>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Verification code"
              keyboardType="number-pad"
              style={{
                padding: 12,
                fontSize: 18,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
              }}
            />
            <Text>Set new password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="New password"
              style={{
                padding: 12,
                fontSize: 18,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
              }}
            />
      
            {/* <Button onPress={onReset} isDisabled={loading || code.length < 6}> */}
            <Button onPress={onReset}>
              <ButtonText>Set new password</ButtonText>
            </Button>
      
            <Pressable onPress={() => router.replace("/(auth)/signup")}>
              <Text className="text-primary-600 text-center mt-4">
                Back to Signup
              </Text>
            </Pressable>
          </VStack>
    )
  }

  return (
   <VStack className="p-9 max-w-[440px] w-full" space="md">
      <VStack className="md:items-center" space="md">
        <VStack>
          <Heading className="md:text-center" size="3xl">
            Forgot Password?
          </Heading>
          <Text className="text-sm">
            Enter email ID associated with your account.
          </Text>
        </VStack>
      </VStack>

      <VStack space="xl" className="w-full ">
        <FormControl isInvalid={!!errors?.email} className="w-full">
          <FormControlLabel>
            <FormControlLabelText>Email</FormControlLabelText>
          </FormControlLabel>
          <Controller
            defaultValue=""
            name="email"
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await forgotPasswordSchema.parseAsync({ email: value });
                  return true;
                } catch (error: any) {
                  return error.message;
                }
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  placeholder="Enter email"
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
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>
              {errors?.email?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
        <Button className="w-full" onPress={handleSubmit(onSubmit)}>
          <ButtonText className="font-medium">Send Link</ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
};