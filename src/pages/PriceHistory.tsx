import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../components/NavigationBar";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Fragment, useState } from "react";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import Lucide from "@react-native-vector-icons/lucide";
import { useProducts } from "../context/products";

type DataPoint = {
    value: number
}

type PriceHistoryProps = NativeStackScreenProps<RootStackParamList, 'ProductHistory'>;

function PriceHistory({ route }: PriceHistoryProps) {
    const p = route.params;
    const productID = p?.productID;
    
    const product = useProducts(x => x.products.filter(x => x.productID === productID).at(0));

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [days, setDays] = useState<"7D" | "30D" | "90D">('7D')
    const [chartWidth, setChartWidth] = useState(0); 

    const data: DataPoint[] = [{ value: 180}, { value: 70}, { value: 300 }, { value: 40 }, { value: 10 }];
    const height = 200;
    const paddingY = 20;

    const chartHeight = height - paddingY * 2;

    const values = data.map(d => d.value);

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    const width = chartWidth > 0 ? chartWidth : 1;

    const stepX = width / (data.length - 1 || 1);

    const points = data.map((item, index) => {
        const x = index * stepX;
        const normalizedY = ((item.value - minValue) / valueRange) * chartHeight;
        const y = height - paddingY - normalizedY

        return { x, y, value: item.value}
    });

    const tickCount = 5;
    const yAxisTicks = Array.from({ length: tickCount}).map((_, index) => {
        const ratio = index / (tickCount - 1);
        const rawValue = Math.round(minValue + ratio * (maxValue - minValue));
        
        let value: number;
        if (index == 0) {
            value = minValue;
        } else if (index == tickCount - 1) {
            value = maxValue;
        } else {
            value = Math.round(rawValue / 10) * 10;
        }

        const y = (height - paddingY) - ratio * chartHeight;
        return { value, y };
    });

    return <View className="px-2 pt-10 gap-8 flex-1">
            <View className="flex-row gap-2">
                <TouchableOpacity className="justify-center" onPress={() => navigation.goBack()}>
                    <MaterialDesignIcons name="chevron-left" size={26}/>
                </TouchableOpacity>
                <Text className="font-bold text-2xl">Price History</Text>
            </View>

            <View className="border border-slate-400 rounded-2xl p-4 gap-4">
                <View>
                    <Text className="text-2xl font-bold">{product?.name}</Text>
                    <Text className="text-lg font-bold text-gray-500">1 {product?.unit}</Text>
                </View>


                <View className="flex-row items-center gap-1">
                    <View>
                        <View className="rounded-full bg-green-300 px-1 py-1 flex-row gap-2">
                            <TouchableOpacity className="py-2 px-2 rounded-full w-[64px]" style={{backgroundColor: days === "7D" ? "#16a34a" : null}} 
                                onPress={() => setDays('7D')}>
                                <Text 
                                    style={{color: days === "7D" ? "white" : "#16a34a"}}
                                    className="text-white text-center text-sm font-semibold">7D</Text>
                            </TouchableOpacity>

                            <TouchableOpacity className="py-2 px-4 rounded-full w-[64px]" style={{backgroundColor: days === "30D" ? "#16a34a" : null}}
                                onPress={() => setDays('30D')}>
                                <Text 
                                    style={{color: days === "30D" ? "white" : "#16a34a"}}
                                    className="text-white text-center text-sm font-semibold">30D</Text>
                            </TouchableOpacity>

                            <TouchableOpacity className="py-2 px-4 rounded-full w-[64px]" style={{backgroundColor: days === "90D" ? "#16a34a" : null}}
                                onPress={() => setDays('90D')}>
                                <Text 
                                    style={{color: days === "90D" ? "white" : "#16a34a"}}
                                    className="text-white text-center text-sm font-semibold">90D</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="flex-1 flex-row items-center justify-end gap-1">
                        <MaterialDesignIcons name="calendar" color="#15803d" size={20}/>
                        <Text className="text-xs text-green-700 font-semibold">Last 90 Days</Text>
                    </View>
                </View>


                <View className="border border-slate-400 rounded-2xl p-4 gap-4 flex-row">
                    <View style={{ height, width: 40 }} className="relative">
                        {yAxisTicks.map((tick, index) => (
                            <Text
                                key={`label-${index}`}
                                style={[
                                    styles.yAxisLabel,
                                    {top: tick.y - 10}
                                ]}>
                                {tick.value}
                            </Text>
                        ))}
                    </View>
                    
                    <View style={{ height }} className="flex-1 w-full border border-slate-300"
                        onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
                        {points.map((point, index) => {
                            if (index === points.length - 1) { return null; }

                            const nextPoint = points[index + 1];
                            const dx = nextPoint.x - point.x;
                            const dy = nextPoint.y - point.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            const angle = Math.atan2(dy, dx);

                            return (
                                <View
                                    key={`line-${index}`}
                                    style={[
                                        styles.lineSegment,
                                        {
                                            left: point.x,
                                            top: point.y,
                                            width: distance,
                                            transform: [{ rotate: `${angle}rad`}],
                                            backgroundColor: "green"
                                        }
                                    ]}
                                />
                            )
                        })}

                        {points.map((point, index) => (
                            <Fragment key={`point-${index}`}>
                                <View
                                    style={[
                                        styles.dot,
                                        {
                                            left: point.x - 4,
                                            top: point.y - 3,
                                            backgroundColor: "green"
                                        }
                                    ]}/>

                                <View>
                                    <Text
                                        style={[
                                            styles.valueLabel,
                                            {
                                                left: point.x,
                                                top: point.y - 15
                                            }
                                        ]}>
                                        {point.value}
                                    </Text>
                                </View>

                            </Fragment>
                        ))}
                    </View>
                </View>

                <View className="border border-slate-400 rounded-2xl p-4 gap-4 flex-row justify-center">
                    <View className="gap-2">
                        <View>
                            <FontAwesome5 name="arrow-circle-down" iconStyle="solid" size={20}/>
                        </View>

                        <View>
                            <Text className="text-green-700 font-bold text-sm">Lowest Price</Text>
                            <Text className="text-green-700 font-bold">₱85</Text>
                        </View>
                    </View>

                    <View className="gap-2">
                        <View>
                            <FontAwesome5 name="arrow-circle-up" iconStyle="solid" size={20}/>
                        </View>

                        <View>
                            <Text className="text-green-700 font-bold text-sm">Highest Price</Text>
                            <Text className="text-green-700 font-bold">₱165</Text>
                        </View>
                    </View>

                    <View className="gap-2">
                        <View className="justify-center w-6 h-6 bg-blue-500 rounded-full items-center">
                            <Lucide name="arrow-down-up" color="#FFFFFF" size={20} style={{transform: [{ rotate: "90deg" }] }}/>
                        </View>

                        <View>
                            <Text className="text-green-700 font-bold text-sm">Prevailing Price</Text>
                            <Text className="text-green-700 font-bold">₱120</Text>
                        </View>
                    </View>

                </View>
            </View>
    </View>
}

export default PriceHistory;

const styles = StyleSheet.create({
    lineSegment: {
        position: 'absolute',
        height: 2,
        transformOrigin: 'top left'
    },
    dot: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        zIndex: 2
    },
    valueLabel: {
        position: 'absolute',
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        zIndex: 3
    },
    yAxisLabel: {
        position: 'absolute',
        right: 4,
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
})
