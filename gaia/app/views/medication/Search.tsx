import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { searchMed } from "../../../data/Search";
import { styles } from "../../../style/style";
import MedIconByType from "../../components/MedIconByType";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput } from "react-native-paper";

export default function Search({ route, navigation }) {
  const { user } = route.params as {
    user: User;
  };

  const textInputRef = React.useRef(null);

  const [tutoSearch, setTutoSearch] = useState("1");

  useEffect(() => {
    console.log("Search Page");
    console.log("USER", user);

    if (textInputRef.current) {
      setTimeout(() => textInputRef.current.focus(), 200);
    }
  }, []);
  const [search, setSearch] = useState([]);
  const isFocused = useIsFocused();

  const init = async () => {
    setTutoSearch(await AsyncStorage.getItem("TutoSearch"));
  };
  useEffect(() => {
    if (isFocused) {
      console.log("Nav on Search Page");
      init();
    }
  }, [isFocused]);

  const handleTuto = (isClicked: boolean) => {
    if (isClicked) {
      AsyncStorage.setItem("TutoSearch", "1");
      navigation.navigate("Drug", { drugCIS: 63283736 });
    }
  };

  return (
    <SafeAreaView className=" flex bg-white w-full h-full dark:bg-[#131f24]">
      <View style={styles.searchBarwQR} className="mt-3 px-4">
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchBarInput}
            ref={textInputRef}
            placeholder="Doliprane, Aspirine ..."
            placeholderTextColor="#9CDE00"
            onChangeText={(text) => {
              const newSearch = searchMed(text);
              if (newSearch.length > 0) {
                setSearch(newSearch);
              } else {
                setSearch(searchMed("E"));
              }
            }}
          />
        </View>
      </View>
      {search.length<1&&<View className="flex w-full h-80 justify-center items-center">
        <Image className="w-24 h-24 -mt-4" source={require("../../../assets/composition.png")} />
      </View>}
      <FlatList
        data={search}
        keyExtractor={(_item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            className="bg-white border-b-[#e5e5e5] flex justify-start align-middle dark:bg-[#131f24] dark:border-b-[#37464f]"
            onPress={() => navigation.navigate("Drug", { user: user, drugCIS: item.CIS })}
          >
            <MedIconByType type={item.type} />
            <View className="ml-4 flex-1 flex-row justify-between items-center">
              <Text className="flex-1 dark:text-slate-50">{item.Name}</Text>
              {/* {user.allergies.map((allergie) =>
                  Array.from(getPAfromMed(item.CIS)).includes(allergie)
                )
                .some((bool) => bool) && (
                <View className=" items-center">
                  <Image
                    className={"h-5 w-5 ml-1"}
                    source={require("../../assets/allergy.png")}
                  />
                  <Text className="ml-2 text-red-500 font-bold">Allergie</Text>
                </View>
              )} */}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
