import { useIsFocused } from "@react-navigation/native";
import * as Icon from "react-native-feather";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getATCLabel,
  getAllSameCompOfCIS,
  getComposition,
  getIMfromMed,
  getMedbyCIS,
  getPAfromMed,
} from "../../../data/Meds";
import {
  addItemToList,
  readList,
  removeItemFromStock,
} from "../../../data/Storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../../components/Loading";
import { styles } from "../../../style/style";
import ModalComponent from "../../components/Modal";
import MedIconByType from "../../components/MedIconByType";
import { useColorScheme } from "nativewind";

export default function Drug({ route, navigation }) {
  const { user, drugCIS } = route.params as {
    user: User;
    drugCIS: number;
  };

  const [drugModalVisible, setDrugModalVisible] = useState(false);
  const isFocused = useIsFocused();
  const { colorScheme } = useColorScheme();
  const [showMore, setShowMore] = useState(5);
  const [stock, setStock] = useState(null);
  const [allergique, setAllergique] = useState(false);
  const [iM, setIM] = useState([]);
  const [significationATC, setSignificationATC] = useState([]);
  const [sameComp, setSameComp] = useState([]);
  const [drug, setDrug] = useState(null);

  const [tutoMedic, setTutoMedic] = useState(null);
  const [tutoStep, setTutoStep] = useState(0);

  useEffect(() => {
    const init = async () => {
      const data = getMedbyCIS(drugCIS);
      setDrug(data);
      setTutoMedic(await AsyncStorage.getItem("TutoMedic"));
      const stockList = await readList("stock");
      setSameComp(getAllSameCompOfCIS(drugCIS));
      setIM(getIMfromMed(drugCIS));
      setStock(
        stockList.filter(
          (item) => item.idUser == user.id && item.CIS == drugCIS
        )
      );
    }
    init();

  }, [drugCIS, user]);

  useEffect(() => {
    if (user?.allergies?.length && drugCIS) {
      const activeIngredients = Array.from(getPAfromMed(drugCIS) || []);
      const isAllergic = user.allergies.some((allergie) =>
        activeIngredients.includes(allergie)
      );
      setAllergique(isAllergic);
    } else {
      setAllergique(false);
    }
  }, [user, drugCIS]);

  useEffect(() => {
    if (drug && drug.ATC && drug.ATC !== "inconnue\nCode") {
      setSignificationATC(getATCLabel(drug.ATC));
    }
  }, [drug]);

  const updateStock = async (cis, cip, addQte) => {
    try {
      const product = stock.find((stockItem) => stockItem.CIP === cip);
      if (product) {
        await removeItemFromStock(cis, cip, user.id);
        if (product.qte + addQte > 0) {
          const addstock: Stock = {
            idUser: user.id,
            CIP: cip,
            CIS: cis,
            qte: product.qte + addQte,
          };
          console.log(addstock);

          await addItemToList("stock", addstock);
        }
      } else {
        const addstock: Stock = {
          idUser: user.id,
          CIP: cip,
          CIS: cis,
          qte: 1,
        };
        console.log(addstock);

        await addItemToList("stock", addstock);
      }
      init();
    } catch (e) {
      console.log(e);
    }
  };

  const handlePress = useCallback(async () => {
    await Linking.openURL(
      "https://base-donnees-publique.medicaments.gouv.fr/affichageDoc.php?specid=" +
      drugCIS +
      "&typedoc=N"
    );
  }, []);

  const handleTuto = (isClicked, step) => {
    if (isClicked) {
      setTutoStep(tutoStep + 1);
      if (tutoStep === 3) {
        AsyncStorage.setItem("TutoMedic", "1");
        navigation.navigate("Home");
      }
    }
  };

  return (
    <SafeAreaView className=" flex bg-white w-full h-full dark:bg-[#131f24]">
      {drug && stock && user && (
        <>
          <ScrollView className="gap-2" showsVerticalScrollIndicator={false}>
            <View className="flex-row justify-between pt-4 px-6">
              <Icon.ArrowLeft
                color={colorScheme == "dark" ? "#fff" : "#363636"}
                onPress={() => navigation.goBack()}
              />
              <Icon.AlertCircle
                className=" z-10"
                color={colorScheme == "dark" ? "#fff" : "#363636"}
                onPress={handlePress}
              />
            </View>
            <View className="flex-row justify-center">
              <MedIconByType type={drug.Shape} size={"h-24 w-24"} />
            </View>
            <View className="pt-10 flex px-6">
              <View className="flex-row justify-between items-center">
                <Text className=" dark:text-slate-50 text-base font-light">
                  {drug.CIS}
                </Text>
                {drug.Marketed == "Commercialisée" ? (
                  <View className="flex-row items-center">
                    <View
                      style={{
                        width: 17,
                        height: 17,
                        borderRadius: 10,
                        borderColor: "#4efc34",
                        marginTop: 2,
                        borderWidth: 3,
                        marginRight: 6,
                      }}
                    ></View>
                    <Text className=" dark:text-slate-50 text-base font-bold text-[#4efc34]">
                      Disponible
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <View
                      style={{
                        width: 17,
                        height: 17,
                        borderRadius: 10,
                        borderColor: "#EE5E5E",
                        marginTop: 2,
                        borderWidth: 3,
                        marginRight: 6,
                      }}
                    ></View>
                    <Text className=" dark:text-slate-50 text-base font-bold text-[#EE5E5E]">
                      Indisponible
                    </Text>
                  </View>
                )}
              </View>

              <Text className=" dark:text-slate-50 text-5xl font-bold">
                {drug.Name.split(" ")[0].charAt(0).toUpperCase() +
                  drug.Name.split(" ")[0].slice(1).toLowerCase()}
              </Text>
              <Text className=" dark:text-slate-50 text-lg mb-4">
                {drug.Name.split(" ").slice(1).join(" ")}
              </Text>

              <TouchableOpacity onPress={() => navigation.navigate("LaboratoirePage", { labo: drug.Titulaire, user: user })}>
                <Text className="dark:text-slate-50">
                  Titulaire:{" "}
                  <Text className=" dark:text-slate-50 text-[#9CDE00]">
                    {drug.Titulaire}
                  </Text>
                </Text>
              </TouchableOpacity>
              <Text className="dark:text-slate-50">
                Administration:{" "}
                <Text className=" dark:text-slate-50  font-light">
                  {drug.Administration_way}
                </Text>
              </Text>

              {drug.ATC && drug.ATC != "inconnue\nCode" && (
                <TouchableOpacity onPress={() => navigation.navigate("AtcPage", { significationATC: significationATC })}>
                  <Text className=" dark:text-slate-50 ">
                    Code ATC:{" "}
                    <Text className=" dark:text-slate-50 text-[#9CDE00]">
                      {drug.ATC}
                    </Text>
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {allergique && (
              <View className=" flex-row px-6">
                <Image
                  className={"h-5 w-5"}
                  source={require("../../../assets/allergy.png")}
                />
                <Text className=" dark:text-slate-50 ml-2 text-red-500 font-bold">
                  Vous êtes allergique à ce produit
                </Text>
              </View>
            )}
            {drug.Indications_therapeutiques && (
              <View className="px-6">
                <Text className=" dark:text-slate-50 ">
                  🔬 Indication thérapeutique
                </Text>
                <Text className=" dark:text-slate-50 text-xs mt-[-5px]">
                  {drug.Indications_therapeutiques.includes(drug.ATC)
                    ? drug.Indications_therapeutiques.split(
                      drug.ATC
                    )[1].replaceAll("\u0092", "'")
                    : drug.Indications_therapeutiques.includes(
                      "\t\t\t\t\r\n\t\t\t\t\t\t"
                    )
                      ? "Vous trouverez les indications thérapeutiques dans la notice en cliquant sur le bouton en haut à droite"
                      : drug.Indications_therapeutiques.replaceAll("\u0092", "'")}
                </Text>
              </View>
            )}
            <Text className=" dark:text-slate-50 px-6">
              🏷 Boite(s) disponible(s)
            </Text>
            <View className=" px-6">
              {drug.Values &&
                drug.Values.map((item, index) => {
                  const alreadyStocked =
                    stock.find((stockItem) => stockItem.CIP === item.CIP) !=
                    null;

                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setDrugModalVisible(!drugModalVisible);
                      }}
                      key={index}
                      className=" -mb-[1px] pb-2 border-t border-b border-gray-300"
                    >
                      <Text className=" dark:text-slate-50  font-light">
                        {item.CIP}
                      </Text>
                      <Text className=" dark:text-slate-50  text-xs">
                        {item.Denomination}
                      </Text>
                      <View className=" -mt-1">
                        {drug.Marketed == "Commercialisée" ? (
                          item.Price_with_taxes ? (
                            <>
                              <Text className=" dark:text-slate-50 font-bold text-right">
                                {item.Price_with_taxes}€
                              </Text>
                              <Text className=" dark:text-slate-50 text-right text-xs">
                                (Remboursement: {item.Remboursement})
                              </Text>
                            </>
                          ) : (
                            <>
                              <Text className=" dark:text-slate-50 text-right text-xs font-bold">
                                Prix libre
                              </Text>
                              <Text className=" dark:text-slate-50 text-right text-xs">
                                (Non remboursable)
                              </Text>
                            </>
                          )
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </View>
            <Text className=" dark:text-slate-50  px-6 pt-4">
              💊 Composition
            </Text>
            {Object.keys(getComposition(drug.Composition)).map((type) => (
              <View className=" px-6" key={type}>
                <Text className=" dark:text-slate-50  text-xs">
                  Type: {type} (Composition pour{" "}
                  {getComposition(drug.Composition)[type][0]["Quantite"]})
                </Text>
                {getComposition(drug.Composition)[type].map(
                  (comprime, index) => (
                    <View key={index}>
                      <Text className=" dark:text-slate-50  text-xs">
                        {"> "}
                        {comprime.Dosage} {"-"} {comprime.PrincipeActif}
                      </Text>
                    </View>
                  )
                )}
              </View>
            ))}
            {iM.length > 0 && (
              <View className="px-0">
                <Text className=" dark:text-slate-50  px-6 pt-4 text-orange-400">
                  🚫 Interactions médicamenteuses
                </Text>
                {iM.map((item, index) => (
                  <View className=" px-6" key={index}>
                    <Text className=" dark:text-slate-50  text-xs">
                      - {item.interacting_substance}
                    </Text>
                    <Text className=" dark:text-slate-50 px-3 text-xs">
                      {item.association}
                    </Text>
                    <Text className=" dark:text-slate-50 px-3 text-xs">
                      {item.details}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            {sameComp.length > 0 && (
              <View className="px-0">
                <Text className=" dark:text-slate-50  px-6 py-4">
                  🧬 Meme composition
                </Text>
                <View>
                  {sameComp.slice(0, showMore).map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.listItem}
                      className="-mb-[1px] flex justify-start align-middle border-b-[#e5e5e5] dark:border-b-[#37464f]"
                      onPress={() =>
                        navigation.push("Drug", { drugCIS: item.CIS })
                      }
                    >
                      <MedIconByType type={item.Shape} />
                      <View className="ml-4 flex-1 flex-row justify-between items-center">
                        <Text className=" dark:text-slate-50 flex-1">
                          {item.Name}
                        </Text>
                        {user.allergies
                          .map((allergie) =>
                            Array.from(getPAfromMed(item.CIS)).includes(
                              allergie
                            )
                          )
                          .some((bool) => bool) && (
                            <View className=" items-center">
                              <Image
                                className={"h-5 w-5 ml-1"}
                                source={require("../../../assets/allergy.png")}
                              />
                              <Text className=" dark:text-slate-50 ml-2 text-red-500 font-bold">
                                Allergie
                              </Text>
                            </View>
                          )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                {showMore < sameComp.length && (
                  <TouchableOpacity
                    onPress={() => {
                      setShowMore(showMore + 5);
                    }}
                  >
                    <Text className=" dark:text-slate-50 text-center text-[#9CDE00] mt-3 font-bold">
                      Afficher plus
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            <View className={"mb-24"} />
          </ScrollView>

          {stock.find((stockItem) => stockItem.CIS === drugCIS) != null ? (
            <>
              <TouchableOpacity
                className=" bg-[#688f4b] rounded-[19px] absolute bottom-8 left-6 right-6"
                onPress={() => {
                  setDrugModalVisible(true);
                }}
              >
                <Text className="text-center text-[#9CDE00] text-lg py-3 pt-2">
                  Modifier
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              className=" bg-[#9CDE00] rounded-[19px] absolute bottom-8 left-6 right-6"
              onPress={() => {
                setDrugModalVisible(true);
              }}
            >
              <Text className="text-center text-white text-2xl font-bold py-3 pt-2">
                Ajouter
              </Text>
            </TouchableOpacity>
          )}

          <ModalComponent
            visible={drugModalVisible}
            onClose={() => setDrugModalVisible(!drugModalVisible)}
          >
            <View className="w-full pb-2 px-4">
              {drug.Values &&
                drug.Values.map((item, index) => {
                  const alreadyStocked =
                    stock.find((stockItem) => stockItem.CIP === item.CIP) !=
                    null;
                  return (
                    <View
                      key={index}
                      className="flex py-2 flex-row items-center justify-between border-b border-gray-200"
                    >
                      <View className="flex flex-1">
                        <Text className=" dark:text-slate-50  font-light">
                          {item.CIP}
                        </Text>
                        <Text className=" dark:text-slate-50  text-xs">
                          {item.Denomination}
                        </Text>
                      </View>

                      {alreadyStocked ? (
                        <>
                          <TouchableOpacity
                            className="px-2"
                            onPress={() => {
                              updateStock(item.CIS, item.CIP, +1);
                            }}
                          >
                            <Text className=" dark:text-slate-50 ">➕</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="px-2"
                            onPress={() => updateStock(item.CIS, item.CIP, -1)}
                          >
                            <Text className=" dark:text-slate-50 ">❌</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <TouchableOpacity
                            className="px-2"
                            onPress={() => {
                              updateStock(item.CIS, item.CIP, +1);
                            }}
                          >
                            <Text className=" dark:text-slate-50 ">➕</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  );
                })}
              <View className="mt-4">
                {stock.length > 0 && (
                  <Text className=" dark:text-slate-50  text-xs">
                    Dans le Stock:
                  </Text>
                )}
                {stock.map((item, index) => {
                  return (
                    <View key={index} className="flex-row">
                      <Text className=" dark:text-slate-50  text-xs">
                        x{item.qte} -{" "}
                        {
                          drug.Values.find((prod) => prod.CIP == item.CIP)
                            .Denomination
                        }
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                setDrugModalVisible(!drugModalVisible);
              }}
            >
              <Text className=" dark:text-slate-50 text-red-500">Fermer</Text>
            </TouchableOpacity>
          </ModalComponent>
        </>
      )}
      {(!drug || !stock || !user) && <Loading />}
    </SafeAreaView>
  );
}
