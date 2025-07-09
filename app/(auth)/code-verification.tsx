import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useSignIn } from '@clerk/clerk-expo';

// UI Components
import {
  FormControl,
  FormControlLabel,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
} from '@/components/ui/form-control';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { LinkText } from '@/components/ui/link';


import { Keyboard, FlatList } from 'react-native';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icon';
import { AlertTriangle } from "lucide-react-native";


const resetPasswordSchema = z
  .object({
    code: z.string().length(6, 'Inavlid code'),         // Only contains numbers
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
      )
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: "Passwords do not match",
    path: ["confirmpassword"],
  });

type resetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;

export default function CodeVerification() {

  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const toast = useToast();

  const [authErrors, setAuthErrors] = useState<{ message: string }[]>([]);

  useEffect(() => {
    if (isSignedIn) {
      router.push('/(tabs)')
    }
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<resetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
  });

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


  const onSubmit = async (data: resetPasswordSchemaType) => {
    if (!isLoaded) return;
    try {
      const resetPasswordAttempt = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: data.code,
        password: data.password,
      })
      console.log('Reset Password Attempt:', resetPasswordAttempt.status);
      if (resetPasswordAttempt.status === 'needs_second_factor') {
        setSecondFactor(true);
        setError('');
      } else if (resetPasswordAttempt.status === 'complete') {
        setActive({ session: resetPasswordAttempt.createdSessionId });
        reset();
        router.replace('/(tabs)');
        setError('');
      } else {
        console.error(JSON.stringify(resetPasswordAttempt, null, 2));
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
  }

  return (
    <VStack className="p-9 pb-5 max-w-[440px] w-full" space='md'>
      <VStack className='md:items-center' space='md'>
        <VStack>
          <Heading className="md:text-center" size="3xl">Verify your email</Heading>
        </VStack>
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
            <FormControl isInvalid={!!errors.password}>
              <FormControlLabel>
                <FormControlLabelText>
                  New password
                </FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="password"
                defaultValue=''
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      className='text-sm'
                      placeholder='New password'
                      type={showPassword ? "text" : "password"}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={handleKeyPress}
                      returnKeyType='done'
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
          </VStack>
        </VStack>
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
        {/* <Button onPress={onReset} isDisabled={loading || code.length < 6}> */}
        <VStack className="w-full my-7" space="lg">
          <Button className="w-full" onPress={handleSubmit(onSubmit)}>
            <ButtonText className="font-medium">Set new password</ButtonText>
          </Button>
        </VStack>
        <HStack className="self-center" space="sm">
          <Text size="md">Remember your password?</Text>
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
}