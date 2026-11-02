import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 40;
const STROKE_WIDTH = 5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const HALF_SIZE = RADIUS + STROKE_WIDTH;

type CircularProgressProps = {
    percentage: number,
    duration: number,
    color: string,
    children?: React.ReactNode
}

function CircularProgress({ percentage = 75, duration = 1000, children, color }: CircularProgressProps) {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(percentage / 100, { duration });
    }, [percentage]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = CIRCUMFERENCE * (1 - progress.value);

        return {
            strokeDashoffset
        }
    });

    return <View style={styles.container}>

        <View className="absolute">
            {children}
        </View>
        <Svg
            width={HALF_SIZE * 2}
            height={HALF_SIZE * 2}
            viewBox={`0 0 ${HALF_SIZE * 2} ${HALF_SIZE * 2}`}
            style={{ transform: [{rotate: '-90deg'}]}}>

            <Circle
                cx={HALF_SIZE}
                cy={HALF_SIZE}
                r={RADIUS}
                stroke="#EAEAEA"
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
            />

            <AnimatedCircle
                cx={HALF_SIZE}
                cy={HALF_SIZE}
                r={RADIUS}
                stroke={color}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                animatedProps={animatedProps}
                strokeLinecap="round"
            />
        </Svg>



    </View>
}

export default CircularProgress;

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center'
    }
})
