import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";


export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp, isLoaded, setActive } = useSignUp();

  const handleVerify = async () => {
    if (!isLoaded || !code) return;

    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/");
      } else {
        console.warn("Verification incomplete:", result);
      }
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack className="p-9 max-w-[440px] w-full space-y-6">
      <Heading size="2xl">Verify your email</Heading>
      <Text>
        {email
          ? `We've sent a verification code to ${email}`
          : "Enter the verification code you received via email."}
      </Text>

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

      <Button onPress={handleVerify} isDisabled={loading || code.length < 6}>
        <ButtonText>{loading ? "Verifying..." : "Verify"}</ButtonText>
      </Button>

      <TouchableOpacity onPress={() => router.replace("/(auth)/signup")}>
        <Text className="text-primary-600 text-center mt-4">
          Back to Signup
        </Text>
      </TouchableOpacity>
    </VStack>
  );
}
