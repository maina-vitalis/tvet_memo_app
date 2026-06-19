import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background-0 px-6">
      <Text className="text-3xl font-bold text-typography-900">TVET Memo</Text>
      <Text className="mt-2 text-center text-typography-500">
        Your app is ready. Start building here.
      </Text>
    </View>
  );
}
