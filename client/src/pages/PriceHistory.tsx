import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../components/NavigationBar";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Fragment, useMemo, useState } from "react";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import Lucide from "@react-native-vector-icons/lucide";
import { images, ProductImage, useProducts } from "../context/products";

type DataPoint = {
    value: number,
    date: string
}

type PriceHistoryProps = NativeStackScreenProps<RootStackParamList, 'ProductHistory'>;

function PriceHistory({ route }: PriceHistoryProps) {
    const p = route.params;
    const productID = p?.productID;
    
    const product = useProducts(x => x.products.filter(x => x.productID === productID).at(0));

    if (!product) {
        return <View>???</View>
    }


    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [days, setDays] = useState<"7D" | "30D" | "90D">('7D')
    const [chartWidth, setChartWidth] = useState(0); 

    const [selectedDot, setSelectedDot] = useState<number | null>(null);


    const lastDate = new Date(product.priceHistory.at(product.priceHistory.length - 1)!.date)
        .toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    });

    const lowestPriceDate = useMemo(() => {
        let lowest = product.priceHistory.at(product.priceHistory.length - 1)?.prevailing_price ?? 0;
        let currentDate = "";

        for (let history of product.priceHistory) {
            if (history.prevailing_price < lowest) {
                lowest = history.prevailing_price;
                currentDate = history.date;
            }
        }

        return new Date(currentDate).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'           
        });
    }, []);

    const highestPriceDate = useMemo(() => {
        let highest = 0;
        let currentDate = "";

        for (let history of product.priceHistory) {
            if (history.prevailing_price > highest) {
                highest = history.prevailing_price;
                currentDate = history.date;
            }
        }

        return new Date(currentDate).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'           
        });
    }, []);

    const data = useMemo(() => {
        const priceHistory = product.priceHistory;
        const daysInt = parseInt(days, 10);

        const last = priceHistory.at(priceHistory.length - 1);
        if (!last) {
            return [];
        }

        const targetDate = new Date(last.date);
        targetDate.setDate(targetDate.getDate() - daysInt);
        
        return priceHistory
            .filter((x) => new Date(x.date) >= targetDate)
            .map((x) => {
            return {
                value: x.prevailing_price as number,
                date: x.date
            } as DataPoint
        })
    }, [days])

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

        return { x, y, value: item.value, date: item.date}
    });

    function handleTouchAtX(xCoord: number) {
        if (xCoord < Number.EPSILON) {
            return;
        }
        if (stepX === 0 || points.length === 0) { return; }

        const rawIndex = Math.round(xCoord / stepX);
        const clampedIndex = Math.max(0, Math.min(rawIndex, points.length - 1));
        setSelectedDot(clampedIndex);
    }

    const tickCount = 5;

    const yAxisTicks = useMemo(() => {
        const range = maxValue - minValue;

        return Array.from({ length: tickCount}).map((_, index) => {
                const ratio = 1 - (index / (tickCount - 1));
                const rawValue = minValue + ratio * range;
                
                let value: number;
                if (range <= 1) {
                    value = Number(rawValue.toFixed(2))
                } else if (range <= 10) {
                    value = Number(rawValue.toFixed(1))
                } else if (range <= 40) {
                    value = Math.round(rawValue)
                } else {
                    value = Math.round(rawValue / 5) * 5;
                }

                const normalizedY = ((value - minValue) / (range || 1)) * chartHeight;
                const y = height - paddingY - normalizedY;
                return { value, y };
            });

    }, [minValue, maxValue, chartHeight]);

    const activePoint = selectedDot !== null ? points[selectedDot] : null;

    return <View className="px-2 pt-10 gap-8 flex-1">
            <View className="flex-row gap-2">
                <TouchableOpacity className="justify-center" onPress={() => navigation.goBack()}>
                    <MaterialDesignIcons name="chevron-left" size={26}/>
                </TouchableOpacity>
                <Text className="font-bold text-2xl">Price History</Text>
            </View>

            <View className="border border-slate-400 rounded-2xl p-4 gap-4">
                <View className="flex-row items-center gap-4">
                    <View>
                        <Image 
                            source={images[productID as ProductImage]}
                            className="rounded-xl w-20 h-20"
                        />
                    </View>

                    <View>
                        <Text className="text-2xl font-bold">{product?.name}</Text>
                        <Text className="text-lg font-bold text-gray-500">1 {product?.unit}</Text>
                    </View>
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
                        <Text className="text-xs text-green-700 font-semibold">
                        {lastDate}</Text>
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
                                ₱{tick.value}
                            </Text>
                        ))}
                    </View>
                    
                    <View 
                        style={{ height }} 
                        className="flex-1 w-full border border-slate-300 relative"
                        onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
                        onStartShouldSetResponder={() => true}
                        onResponderGrant={(e) => handleTouchAtX(e.nativeEvent.locationX)}
                        onResponderMove={(e) => handleTouchAtX(e.nativeEvent.locationX)}>

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

                        {points.map((point, index) => {
                            const isSelected = selectedDot === index;
                            return (
                            <Fragment key={`point-${index}`}>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setSelectedDot(index)}
                                    style={[
                                        styles.dot,
                                        {
                                            position: 'absolute',
                                            left: point.x - 8,
                                            top: point.y - 8,
                                            width: 16,
                                            height: 16,
                                            borderRadius: 8,
                                            backgroundColor: 'transparent',
                                            zIndex: isSelected ? 10 : 1,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }
                                    ]}>
                                    <View
                                        style={
                                            {
                                                width: isSelected ? 10 : 6,
                                                height: isSelected ? 10 : 6,
                                                borderRadius: 5,
                                                backgroundColor: "green"
                                            }
                                        }/>
                                </TouchableOpacity>


                            </Fragment>
                        )})}

                        {activePoint && (
                            <>
                            <View
                                style={{
                                    position: 'absolute',
                                    left: activePoint.x - 0.5,
                                    top: 0,
                                    bottom: 0,
                                    width: 0,
                                    borderColor:'#16a34a',
                                    borderWidth: 1,
                                    borderStyle: 'dashed',
                                    opacity: 0.5,
                                }}
                                />
                            <View
                                style={{
                                    position: 'absolute',
                                    left: activePoint.x - 5,
                                    top: activePoint.y - 5,
                                    width: 10,
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: '#16a34a',
                                    borderWidth: 2,
                                    borderColor: 'white',
                                }}
                                />
                            <View>

                                <View style={
                                    {
                                        left: activePoint.x - 50,
                                        top: activePoint.y - 50,
                                        position: 'absolute',
                                        zIndex: 20,
                                        backgroundColor: '#15803d',
                                        paddingHorizontal: 4,
                                        paddingVertical: 2,
                                        borderRadius: 4,
                                        overflow: 'hidden',
                                        borderWidth: 1,
                                        borderColor: '#cbd5e1'
                                    }
                                }>
                                    <Text style={styles.valueLabel}>
                                        {new Date(activePoint.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </Text>

                                    <Text style={styles.valueLabel}>
                                        ₱{activePoint.value}
                                    </Text>
                                </View>

                            </View>
                            </>
                        )}
                    </View>
                </View>

                <View className="border border-slate-400 rounded-2xl p-4 gap-4 flex-row justify-center">
                    <View className="gap-2">
                        <View>
                            <FontAwesome5 name="arrow-circle-down" iconStyle="solid" size={20}/>
                        </View>

                        <View>
                            <Text className="text-green-700 font-bold text-sm">Lowest Price</Text>
                            <Text className="text-green-700 font-bold">₱{product.currentPrices.lowest_price}</Text>
                        </View>

                        <View>
                            <Text className="text-green-700 font-bold text-sm">{lowestPriceDate}</Text>
                        </View>
                    </View>

                    <View className="gap-2">
                        <View>
                            <FontAwesome5 name="arrow-circle-up" iconStyle="solid" size={20}/>
                        </View>

                        <View>
                            <Text className="text-green-700 font-bold text-sm">Highest Price</Text>
                            <Text className="text-green-700 font-bold">₱{product.currentPrices.highest_price}</Text>
                        </View>

                        <View>
                            <Text className="text-green-700 font-bold text-sm">{highestPriceDate}</Text>
                        </View>
                    </View>

                    <View className="gap-2">
                        <View className="justify-center w-6 h-6 bg-blue-500 rounded-full items-center">
                            <Lucide name="arrow-down-up" color="#FFFFFF" size={20} style={{transform: [{ rotate: "90deg" }] }}/>
                        </View>

                        <View>
                            <Text className="text-green-700 font-bold text-sm">Prevailing Price</Text>
                            <Text className="text-green-700 font-bold">₱{product.currentPrices.prevailing_price}</Text>
                        </View>

                        <View>
                            <Text className="text-green-700 font-bold text-sm">{lastDate}</Text>
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
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center'
    },
    yAxisLabel: {
        position: 'absolute',
        right: 4,
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
})
