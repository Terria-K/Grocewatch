import Lucide from "@react-native-vector-icons/lucide";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import Decimal from "decimal.js";
import { Button, Dimensions, ScrollView, Text, TouchableNativeFeedback, TouchableOpacity, View } from "react-native";
import SearchBar from "../../components/SearchBar";
import { useRef } from "react";
import BottomSheet, { BottomSheetHandle } from "../../components/BottomSheet";
import NavigationBar from "../../components/NavigationBar";
import CreateGroceryList from "./CreateGroceryList";
import { useGroceryList } from "../../context/grocerylist";
import Popover from "react-native-popover-view";
import { Placement } from "react-native-popover-view/dist/Types";

const { height: screenHeight} = Dimensions.get('screen');

function Grocery(props: {
    name: string,
    count: number,
    budget: Decimal,
    spent: Decimal,
    remove: (id: string) => void
}) {
    const percentage = (1-((props.budget.sub(props.spent)).div(props.budget).toNumber())) * 100;


    return (
        <TouchableNativeFeedback>
            <View className="bg-gray-100 rounded-xl border-2 border-gray-400 p-4 px-6 shadow-sm shadow-black elevation-xl flex-row justify-between">
                <View className="flex-1 gap-4">
                    <View>
                        <Text className="font-bold text-xl">{props.name}</Text>
                        <Text className="color-gray-400">{props.count} items</Text>
                    </View>

                    <View className="gap-1" style={{opacity: props.budget.equals(new Decimal(0)) ? 0 : 1}}>

                        <View className="flex-row justify-between max-w-96">
                            <View className="flex-row gap-3">
                                <Text className="color-gray-400">Budget:</Text> 
                                <Text className="font-semibold color-green-600">₱{props.budget.toFixed(2)}</Text>
                            </View>

                            <View className="flex-row gap-3">
                                <Text className="color-gray-400">Spent:</Text> 
                                <Text className="color-red-600 font-semibold">₱{props.spent.toFixed(2)}</Text>
                            </View>
                        </View>
                        <View className="h-2 bg-gray-300 w-full rounded" >
                            <View className="h-2 bg-green-600 rounded" style={{
                                width: `${percentage}%`,
                            }}/>
                        </View>
                    </View>
                </View>

                <View className="left-4 flex-col justify-between items-end">
                    <Popover
                        placement={Placement.BOTTOM}
                        offset={-50}
                        backgroundStyle={{backgroundColor: 'transparent'}}
                        arrowSize={{ width: 0, height: 0}}
                        from={(
                            <TouchableOpacity className="h-[30px] w-[30px] items-end">
                                <Lucide name="ellipsis-vertical" size={16}/>
                            </TouchableOpacity>
                        )}>
                        <View style={{padding: 16}}>
                            <Button title="Edit Grocery List"/>
                            <Button title="Delete Grocery List" onPress={() => props.remove(props.name)}/>
                        </View>

                    </Popover>

                    <Text className="top-4 text-sm font-bold" style={{
                        opacity: props.budget.equals(new Decimal(0)) ? 0 : 1
                    }}>{!Number.isNaN(percentage) ? percentage.toFixed(0) : 0}%</Text>
                </View>
            </View>
        </TouchableNativeFeedback>
    );
}


function GroceryList() {
    const bottomSheetRef = useRef<BottomSheetHandle>(null);

    const groceryList = useGroceryList();

    const removeGroceryList = (id: string) => {
        groceryList.remove(id)
    }

    return (
        <>
        <View className="bg-green-600 h-32 absolute top-0 left-0 right-0 z-0 rounded-b-[30%]" />

        <View className="px-4 pt-10 gap-8 flex-1">
            <View className="flex flex-row justify-between">
                <View>
                    <Text className="font-bold text-white text-2xl">Grocewatch</Text>
                    <Text>Welcome, User!</Text>
                </View>
                <TouchableOpacity className="w-10 h-10 rounded justify-center items-center">
                    <Lucide name="bell" size={25} color="#FFFFFF"/>
                </TouchableOpacity>
            </View>

            <View> 
                <Text className="font-bold text-2xl">My Grocery List</Text>

                <View className="flex-row items-center gap-2 justify-center">
                    <SearchBar placeholder="Search grocery lists..."/>

                    <TouchableOpacity className="rounded-lg bg-green-300 border-green-600 border-2 border-solid shadow-sm shadow-black elevation-2xl" 
                        onPress={() => {
                        if (bottomSheetRef.current) {
                            bottomSheetRef.current.openSheet();
                        }
                    }}>
                        <MaterialDesignIcons name="plus" size={30} color="#16a34a"/>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerClassName="gap-4 pb-40" className="rounded-xl flex-1" showsVerticalScrollIndicator={false}>
                {groceryList.groceryList.map((x, i) => (
                    <Grocery key={i} name={x.name} count={0} budget={x.budgetLimit} spent={new Decimal(0)} remove={removeGroceryList}/>
                ))}

            </ScrollView>
        </View>

        <BottomSheet
            ref={bottomSheetRef}
            activeHeight={screenHeight * 0.95}
            backdropColor="rgba(0,0,0,0.5)"
            closeHeight={150}
            backgroundColor="white"
        >   
            <CreateGroceryList bs={bottomSheetRef}/>
        </BottomSheet>


        <NavigationBar currentRoute="List"/>
        </>
    )
}

export default GroceryList;
