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
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { ArrowLeftIcon, Icon } from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";
import { Keyboard } from "react-native";
import { useForm, Controller, set, Form } from "react-hook-form";
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

  const [successfulCreation, setSuccessfulCreation] = useState(false);
  
  const router = useRouter();
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<forgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  

  useEffect(() => {
    if (isSignedIn) {
      router.push('/(tabs)')
    }
  })

  const toast = useToast();

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  
      
      
  const onSubmit = async (data: forgotPasswordSchemaType) => {
    console.log('Send Link button pressed.')
    if (!isLoaded) {
      return;
    }
    try {
      const requestCodeAttempt = await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: data.email,
      })

      if (requestCodeAttempt.status === 'needs_first_factor') {
        setSuccessfulCreation(true)
        console.log("Verfication code sent successfully")
        setError('')
        router.push('/(auth)/code-verification')
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
              {errors?.email?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
        <Button className="w-full" onPress={handleSubmit(onSubmit)}>
          <ButtonText className="font-medium">Request reset code</ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
};