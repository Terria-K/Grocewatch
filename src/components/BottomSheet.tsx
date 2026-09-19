import React, { useCallback, useImperativeHandle } from "react";
import { Dimensions, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

type BottomSheetType = {
    activeHeight: number;
    children?: React.ReactNode,
    backdropColor: string,
    backgroundColor: string,
    ref: React.Ref<BottomSheetHandle>
}

export type BottomSheetHandle = {
    openSheet: () => void,
    closeSheet: () => void
}

function BottomSheet({ activeHeight, children, backdropColor, backgroundColor, ref }: BottomSheetType) {
    const safeAreaInsets = useSafeAreaInsets();
    const { height: screenHeight } = Dimensions.get('screen');
    const closedPositionY = screenHeight;
    const openPositionY = screenHeight - activeHeight

    const sheetPositionY = useSharedValue(closedPositionY);
    const gestureStartPositionY = useSharedValue(0);

    const openSheet = useCallback(() => {
        sheetPositionY.value = withSpring(openPositionY, {
            damping: 50,
            stiffness: 150,
            mass: 0.5
        })
    }, [openPositionY])

    const closeSheet = useCallback(() => {
        sheetPositionY.value = withSpring(closedPositionY, {
            damping: 50,
            stiffness: 150,
            mass: 0.5
        })
    }, [closedPositionY])

    useImperativeHandle(
        ref, () => ({
            openSheet,
            closeSheet
        })
    )

    const sheetStyle = useAnimatedStyle(() => ({
        top: sheetPositionY.value
    }));

    const backdropStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            sheetPositionY.value,
            [closedPositionY, openPositionY],
            [0, 0.5]
        )
        return {
            opacity,
            display: opacity === 0 ? 'none' : 'flex'
        }
    })

    const panGestureHandler = usePanGesture({
        onBegin: () => {
            gestureStartPositionY.value = sheetPositionY.value;
        },
        onUpdate: (e) => {
            const newPositionY = gestureStartPositionY.value + e.translationY;
            sheetPositionY.value = Math.min(Math.max(newPositionY, openPositionY), closedPositionY)
        },
        onFinalize: () => {
            if (sheetPositionY.value > openPositionY + 50) {
                sheetPositionY.value = withSpring(closedPositionY, {
                    damping: 50,
                    stiffness: 150,
                    mass: 0.5
                })
            } else {
                sheetPositionY.value = withSpring(openPositionY, {
                    damping: 50,
                    stiffness: 150,
                    mass: 0.5
                })
            }
        }
    });

    return (
        <>
        <TouchableWithoutFeedback>
            <Animated.View style={[
                styles.backdrop,
                backdropStyle,
                {backgroundColor: backdropColor}
            ]}/>
        </TouchableWithoutFeedback>
        
        <GestureDetector gesture={panGestureHandler}>
            <Animated.View style={
                [
                    styles.container,
                    sheetStyle,
                    {
                        height: activeHeight,
                        backgroundColor,
                        paddingBottom: safeAreaInsets.bottom
                    },
                ]
            }>
                <View style={styles.lineContainer}>
                    <View style={styles.line}/>
                </View>
                {children}
            </Animated.View>
        </GestureDetector>
        </>
    )
}

export default BottomSheet;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        left: 0,
        right: 0,
        bottom: 0
    },

    lineContainer: {
        marginVertical: 10,
        alignItems: 'center'
    },

    line: {
        width: 50,
        height: 4,
        backgroundColor: 'black',
        borderRadius: 20
    },

    backdrop: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        position: 'absolute'
    }
})
