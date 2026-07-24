import AsyncStorage from "@react-native-async-storage/async-storage";

const key = "@memo/hasSeenWelcome";

export async function getHasSeenWelcome(): Promise<boolean> {
  return (await AsyncStorage.getItem(key)) === "true";
}

//set the key
export async function setHasSeenWelcome() {
  await AsyncStorage.setItem(key, "true");
}
