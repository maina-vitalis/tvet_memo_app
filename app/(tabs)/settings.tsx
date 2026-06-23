import { router } from "expo-router";
import {
  Bell,
  ChevronRight,
  Cloud,
  Info,
  KeyRound,
  LogOut,
  Pencil,
  ScanFace,
  School,
  Shield,
  Trash2,
} from "lucide-react-native";
import { useState } from "react";
import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, AvatarImage } from "@/src/components/ui/avatar";
import { Box } from "@/src/components/ui/box";
import { Card } from "@/src/components/ui/card";
import { Divider } from "@/src/components/ui/divider";
import { Heading } from "@/src/components/ui/heading";
import { HStack } from "@/src/components/ui/hstack";
import { Pressable } from "@/src/components/ui/pressable";
import { ScrollView } from "@/src/components/ui/scroll-view";
import { Switch } from "@/src/components/ui/switch";
import { Text } from "@/src/components/ui/text";
import { VStack } from "@/src/components/ui/vstack";
import { ScreenHeader } from "@/src/components/screen-header";
import { useAuth } from "@/src/lib/auth-context";

const PROFILE_AVATAR_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuABQZaAwedUgXA5VgbCkwYf_G84rE21w_hOJSspZrwsWSwJ74b0blOw41di6I6SRospLCEsde9WWJiWGJujyBdSmO6xgEb8SFI6tlHumbaacAGPYlS08iQDF1LEo14AT4vhBTm4iZauzKebPquhlW6omgL9NODXe_TodVLowJIW3DgONw5qrWlT3LkBUxOpFeVJAZzKCxygbHV8EME0TeEjJ2BPg_gOi-6JIEjynYCh9if22rHy6g1V1OVUTsko0BwwDPlwpjqJSlu2";

const MOCK_PROFILE = {
  name: "Dr. Sarah Jenkins",
  role: "Senior Instructor, Engineering",
  initials: "IL",
};

type SettingsRowProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  subtitleClassName?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  showDivider?: boolean;
};

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <VStack className="gap-2">
      <Text className="px-2 text-sm font-semibold uppercase tracking-wider text-primary">
        {title}
      </Text>
      <Card className="gap-0 overflow-hidden border-0 p-0 shadow-sm">
        {children}
      </Card>
    </VStack>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  subtitleClassName,
  trailing,
  onPress,
  showDivider = true,
}: SettingsRowProps) {
  const content = (
    <HStack className="min-h-12 items-center justify-between px-4 py-3">
      <HStack className="flex-1 items-center gap-3">
        <Box className="h-10 w-10 items-center justify-center rounded-full bg-muted">
          {icon}
        </Box>
        <VStack className="flex-1">
          <Text className="text-base font-medium text-foreground">{title}</Text>
          {subtitle ? (
            <Text
              className={`text-xs ${subtitleClassName ?? "text-muted-foreground"}`}
            >
              {subtitle}
            </Text>
          ) : null}
        </VStack>
      </HStack>
      {trailing}
    </HStack>
  );

  return (
    <Box>
      {onPress ? (
        <Pressable
          onPress={onPress}
          className="data-[active=true]:bg-accent"
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
      {showDivider ? <Divider className="bg-border" /> : null}
    </Box>
  );
}

export default function SettingsScreen() {
  const { institution, clearInstitution } = useAuth();
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  const institutionName =
    institution?.name ?? "Metro Technical Institute";

  const handleLogout = () => {
    clearInstitution();
    router.replace("/(auth)/tenant-discovery");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Box className="flex-1 bg-background">
        <ScreenHeader title="Settings" />

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-6 px-4 pb-8 pt-6"
          showsVerticalScrollIndicator={false}
        >
          <VStack className="items-center gap-4">
            <Box className="relative">
              <Avatar className="h-24 w-24 border-4 border-card shadow-sm">
                <AvatarImage source={{ uri: PROFILE_AVATAR_URI }} />
              </Avatar>
              <Pressable className="absolute right-0 bottom-0 h-8 w-8 items-center justify-center rounded-full bg-primary data-[active=true]:opacity-90">
                <Pencil className="h-4 w-4 text-primary-foreground" />
              </Pressable>
            </Box>

            <VStack className="items-center gap-1">
              <Heading size="xl" className="text-center font-bold text-primary">
                {MOCK_PROFILE.name}
              </Heading>
              <Text className="text-base text-muted-foreground">
                {MOCK_PROFILE.role}
              </Text>
              <HStack className="mt-2 items-center gap-1 rounded-md border border-border bg-accent px-2 py-1">
                <School className="h-4 w-4 text-primary" />
                <Text className="text-xs font-medium text-primary">
                  {institutionName}
                </Text>
              </HStack>
            </VStack>
          </VStack>

          <SettingsSection title="Security">
            <SettingsRow
              icon={<ScanFace className="h-5 w-5 text-primary" />}
              title="Face ID / Biometrics"
              subtitle="Unlock app instantly"
              trailing={
                <Switch
                  value={biometricsEnabled}
                  onValueChange={setBiometricsEnabled}
                />
              }
              showDivider
            />
            <SettingsRow
              icon={<KeyRound className="h-5 w-5 text-primary" />}
              title="Change Password"
              subtitle="Last updated 3 months ago"
              trailing={
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              }
              onPress={() => {}}
              showDivider
            />
            <SettingsRow
              icon={<Shield className="h-5 w-5 text-primary" />}
              title="Two-Factor Authentication"
              subtitle="Action recommended"
              subtitleClassName="text-secondary"
              trailing={
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              }
              onPress={() => {}}
              showDivider={false}
            />
          </SettingsSection>

          <SettingsSection title="Data & Storage">
            <SettingsRow
              icon={<Cloud className="h-5 w-5 text-primary" />}
              title="Sync Preferences"
              subtitle="Wi-Fi only"
              trailing={
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              }
              onPress={() => {}}
              showDivider
            />
            <SettingsRow
              icon={<Trash2 className="h-5 w-5 text-primary" />}
              title="Clear Cache"
              trailing={
                <Text className="text-sm text-muted-foreground">142 MB</Text>
              }
              onPress={() => {}}
              showDivider={false}
            />
          </SettingsSection>

          <SettingsSection title="App Settings">
            <SettingsRow
              icon={<Bell className="h-5 w-5 text-primary" />}
              title="Push Notifications"
              trailing={
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              }
              onPress={() => {}}
              showDivider
            />
            <SettingsRow
              icon={<Info className="h-5 w-5 text-primary" />}
              title="About TVET Connect"
              subtitle="Version 2.4.1"
              trailing={
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              }
              onPress={() => {}}
              showDivider={false}
            />
          </SettingsSection>

          <Pressable
            onPress={handleLogout}
            className="flex-row items-center justify-center gap-2 rounded-lg border border-destructive bg-card py-3 shadow-sm active:scale-[0.98] data-[active=true]:bg-destructive/10"
          >
            <LogOut className="h-5 w-5 text-destructive" />
            <Text className="text-sm font-semibold text-destructive">
              Log Out securely
            </Text>
          </Pressable>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}
