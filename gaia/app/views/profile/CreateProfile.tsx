import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserIdAutoIncrement, addItemToList } from "data/Storage";
import { styles } from "../../../style/style";
import CustomButton from "../../components/Buttons/CustomButton";
import AllergySelector from "../../components/Pickers/AllergySelector";
import GaiaInput from "../../components/Inputs/GaiaInput";
import GaiaDateTimePicker from "../../components/Pickers/GaiaDateTimePicker";
import GaiaPicker from "../../components/GaiaPicker";

interface ICreateProps {
  navigation: NavigationProp<ParamListBase>;
}

export default function CreateProfile({ navigation }: ICreateProps) {
  // FORM DU USER
  const [lastname, setLastname] = useState("");
  const [firstname, setFirstname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [weight, setWeight] = useState<number>();
  const [gender, setGender] = useState("");
  const [preference, setPreference] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // TUTORIEL
  const [firstConnection, setFirstConnection] = useState("");
  const [tutoStep, setTutoStep] = useState(0);
  const [TutoCreate, setTutoCreate] = useState("1");

  // VALIDATION DU FORMULAIRE
  const [isValidFirstname, setIsValidFirstname] = useState(true);
  const [isValidLastname, setIsValidLastname] = useState(true);
  const [isValidWeight, setIsValidWeight] = useState(true);
  const [validFirstPart, setValidFirstPart] = useState(false);
  // SELECTION DES ALLERGIES
  const [isAllergySelectorValid, setIsAllergySelectorValid] = useState(false);

  const isFirstFormEmpty = !firstname || !lastname || !gender;

  const isFormEmpty =
    !firstname ||
    !lastname ||
    !gender ||
    !dateOfBirth ||
    !weight ||
    !isValidWeight;

  const validateFirstname = () => {
    setIsValidFirstname(firstname.length >= 2);
  };

  const validateLastname = () => {
    setIsValidLastname(lastname.length >= 2);
  };

  const validateWeight = () => {
    if (weight > 0 || weight <= 999) {
      setIsValidWeight(true);
    } else {
      setIsValidWeight(false);
    }
  };

  const handleAllergySelectorValidation = (isValid) => {
    setIsAllergySelectorValid(isValid);
  };

  // FORMATE UNE DATE
  function formatDateToDDMMYYYY(date: Date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;
    const formattedDate = `${formattedDay}/${formattedMonth}/${year}`;

    return formattedDate;
  }

  // INITIALISE: RECUPERE LES INFORMATIONS POUR SAVOIR SI PREMIERE CONNEXION
  const init = async () => {
    setFirstConnection(await AsyncStorage.getItem("isFirstConnection"));
    setTutoCreate(await AsyncStorage.getItem("TutoCreate"));
  };

  useEffect(() => {
    init();
  }, []);

  // GERE LES ETAPES DU TUTORIEL
  const handleTuto = (isClicked, step) => {
    if (isClicked) {
      if (step === 2) {
        setTutoStep(2);
      } else if (tutoStep < 1) {
        setTutoStep(tutoStep + 1);
      }
    }
  };

  // GERE LA PREMIERE PARTIE DU FORMULAIRE
  const handleFirstSumbit = () => {
    if (validFirstPart) {
      setValidFirstPart(false);
    } else {
      if (!isValidFirstname || !isValidLastname || isFirstFormEmpty) {
        console.log(`error not valid`);
      } else {
        setValidFirstPart(true);
        handleTuto(true, 2);
      }
    }
  };

  const handleDateChange = (setDate) => (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // GERE LA VALIDATION DU FORMULAIRE ET MISE EN STOCKAGE DU PROIFL
  const handleSumbit = async () => {
    if (!isValidFirstname || !isValidLastname || isFormEmpty) {
      console.log(`error not valid`);
    } else {
      try {
        if (firstConnection === "true") {
          await AsyncStorage.setItem("isFirstConnection", "false");
          await AsyncStorage.setItem("TutoCreate", "1");
        }
        const user: User = {
          id: await UserIdAutoIncrement(),
          firstname,
          lastname,
          dateOfBirth,
          weight,
          gender,
          preference,
          avatar:"man",
          bgcolor:"#ffeea1"
        };

        await addItemToList("users", user);
        await AsyncStorage.setItem("currentUser", JSON.stringify(user.id));
        navigation.navigate("Home");
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <SafeAreaView className="w-full h-full bg-grey-100 flex-column justify-between">

      <View className="items-center justify-center items-start flex-column py-4 px-6">
        <Text className="text-left text-green-100 text-subtitle text-bold font-bold mt-10">
          Parlez nous un peu de vous...
        </Text>

      </View>

      {!validFirstPart && (
        <>
          {/* <Input
            label="Prénom"
            labelStyle={styles.label}
            placeholder="Entrez votre prénom"
            placeholderTextColor={"#dedede"}
            onChangeText={(text) =>
              setFirstname(text.charAt(0).toUpperCase() + text.slice(1))
            }
            onBlur={validateFirstname}
            value={firstname}
            renderErrorMessage={isValidFirstname}
          /> */}
          <GaiaInput
            value={lastname}
            onChangeText={(text) =>
              setLastname(text.charAt(0).toUpperCase() + text.slice(1))
            }
            placeholder={"Nom"}
            width={{ width: "80%" }}
          />
          {!isValidLastname && (
            <Text style={{color: "red", marginBottom: 10}}>
              Le nom doit comporter au moins 1 caractères.
            </Text>
          )}


          <GaiaInput
            value={firstname}
            onChangeText={(text) =>
              setFirstname(text.charAt(0).toUpperCase() + text.slice(1))
            }
            placeholder={"Prénom"}
            width={{ width: "80%" }}
          />
          {!isValidFirstname && (
            <Text style={{color: "red", marginBottom: 10}}>
              Le prénom doit comporter au moins 1 caractères.
            </Text>
          )}
          {/* <RNPickerSelect
            placeholder={{ label: "Sélectionner le genre", value: "" }}
            onValueChange={(value) => setGender(value)}
            value={gender}
            items={[
              { label: "Masculin", value: "male" },
              { label: "Feminin", value: "female" },
              { label: "Autre", value: "other" },
            ]}
          /> */}
          <GaiaPicker
            placeholder={"genre"}
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            items={[
              { label: "Masculin", value: "male" },
              { label: "Feminin", value: "female" },
              { label: "Autre", value: "other" },
            ]}
            width={null}
          />

          <View className=" flex items-center justify-center mt-auto mb-2">
            <CustomButton
              title="Suivant"
              onPress={handleFirstSumbit}
              disabled={isFirstFormEmpty}
              color={"#9CDE00"}
            />
          </View>
        </>
      )}

      {validFirstPart && (
        <>
          {!isAllergySelectorValid && (
            <>
              <Text className=" m-4 text-gray-300 text-lg">
                {firstname} {lastname}
              </Text>
              <Text style={styles.label} className="m-2">
                Date de naissance
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                {dateOfBirth && (
                  <View className="flex items-center">
                    <Text className="text-white text-center font-semibold bg-lime-400 rounded-lg w-[80%] m-4 p-2 ">
                      {formatDateToDDMMYYYY(dateOfBirth)}
                    </Text>
                  </View>
                )}
                {!dateOfBirth && (
                  <View className="flex items-center">
                    <Text className="text-white text-center font-semibold bg-blue-400 rounded-lg w-[80%] m-4 p-2 ">
                      Choisir la date de naissance
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              {showDatePicker && (
                <GaiaDateTimePicker
                  date={dateOfBirth}
                  onDateChange={handleDateChange(setDateOfBirth)}
                  onLongPress={undefined}
                  buttonPlaceholder={"Date de naissance"}
                  buttonDisabled={false} 
                  mode={"date"}              
                />
              )}
              {/* <Input
                label="Poids (kg)"
                labelStyle={styles.label}
                placeholder="Votre poids en kg"
                placeholderTextColor={"#dedede"}
                onChangeText={(text) => setWeight(parseInt(text))}
                onBlur={validateWeight}
                value={weight ? weight.toString() : ""}
                maxLength={4}
                renderErrorMessage={isValidWeight}
                keyboardType="numeric"
              ></Input> */}
              <GaiaInput
                className={undefined}
                editable={true}
                value={weight ? weight.toString() : ""}
                onChangeText={(text) => setWeight(parseInt(text))}
                placeholder={"Poids (kg)"}
                width={{ width: "80%" }}
              />

              {!isValidWeight && (
                <Text style={{color: "red", marginBottom: 10}}>
                  Le poids doit être contenu entre 1 et 999kg.
                </Text>
              )}

              <TouchableOpacity
                onPress={() => {
                  setIsAllergySelectorValid(true);
                }}
              >
                <View className="flex items-center">
                  <Text className="text-lime-400 text-center font-semibold bg-lime-100 rounded-lg w-[80%] p-1 ">
                    Choisir vos allergies médicamenteuses
                  </Text>
                </View>
              </TouchableOpacity>

              <FlatList
                className=" m-3 min-h-[40px] max-h-[40px]"
                horizontal={true}
                data={preference}
                keyExtractor={(_item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View className=" bg-blue-200 m-1 p-1 rounded-lg flex flex-row justify-center align-middle">
                    <Text className=" text-blue-400">{item}</Text>
                  </View>
                )}
              />

              <View className=" flex items-center justify-center mt-auto mb-2">
                <View className=" m-3 w-max ">
                  <CustomButton
                    title="Retour"
                    onPress={handleFirstSumbit}
                    disabled={false}
                    color={"#4296E4"}
                  />
                </View>
                <CustomButton
                  title="Enregistrer le profil"
                  onPress={handleSumbit}
                  disabled={false}
                  color={"#9CDE00"}
                />
              </View>
            </>
          )}
          {isAllergySelectorValid && (
            <AllergySelector
              isAllergySelectorValid={handleAllergySelectorValidation}
              preference={preference}
              onPreferenceChange={setPreference}
            ></AllergySelector>
          )}
        </>
      )}
    </SafeAreaView>
  );
}
