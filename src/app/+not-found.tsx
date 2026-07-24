import { Link, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenStatusBar } from "@/src/shared/components/screen-status-bar";
import { Box } from "@/src/shared/components/ui/box";
import { Button, ButtonText } from "@/src/shared/components/ui/button";
import { Heading } from "@/src/shared/components/ui/heading";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScreenStatusBar style="dark" backgroundColor="#ffffff" />
        <Box className="flex-1 items-center justify-center bg-background px-6">
          <VStack className="max-w-sm items-center gap-4">
            <Heading
              size="2xl"
              className="text-center font-bold text-foreground"
            >
              Page not found
            </Heading>
            <Text className="text-center text-base text-muted-foreground">
              The page you are looking for does not exist or may have been
              moved.
            </Text>
            <Link href="/(tabs)/home" asChild>
              <Button className="mt-2">
                <ButtonText>Go to home</ButtonText>
              </Button>
            </Link>
          </VStack>
        </Box>
      </SafeAreaView>
    </>
  );
}
