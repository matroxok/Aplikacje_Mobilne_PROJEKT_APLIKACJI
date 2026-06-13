import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Animated, Button, Image, Text, View } from 'react-native'

export default function App() {
	const [status, setStatus] = useState('')
	const debug = false

	const opacity = useRef(new Animated.Value(0)).current
	const scale = useRef(new Animated.Value(0.8)).current

	useEffect(() => {
		Animated.parallel([
			Animated.timing(opacity, {
				toValue: 1,
				duration: 1000,
				useNativeDriver: true,
			}),
			Animated.sequence([
				Animated.timing(scale, {
					toValue: 1.15,
					duration: 500,
					useNativeDriver: true,
				}),
				Animated.timing(scale, {
					toValue: 1,
					duration: 250,
					useNativeDriver: true,
				}),
			]),
		]).start()
	}, [])

	const statusOpacity = useRef(new Animated.Value(0)).current
	const statusTranslateY = useRef(new Animated.Value(10)).current

	useEffect(() => {
		if (!status) return

		statusOpacity.setValue(0)
		statusTranslateY.setValue(10)

		Animated.parallel([
			Animated.timing(statusOpacity, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}),
			Animated.timing(statusTranslateY, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}),
		]).start()
	}, [status])

	useEffect(() => {
		async function checkSession() {
			await new Promise(timer => setTimeout(timer, 1000))
			const { data, error } = await supabase.auth.getSession()

			if (error) {
				console.log(error.message)
				setStatus(`Error: ${error.message}`)
				return
			}

			if (data.session) {
				setStatus('Ładowanie...')

				if (!debug) {
					await new Promise(timer => setTimeout(timer, 1000))
					router.replace('/home')
				}

				return
			}

			setStatus('Przekierowywanie...')

			if (!debug) {
				await new Promise(timer => setTimeout(timer, 1000))
				router.replace('/(auth)/login')
			}
		}

		checkSession()
	}, [])

	return (
		<View className="w-full h-full flex flex-col items-center justify-center px-6 bg-white">
			<Animated.View
				className=" bg-slate-800/30 rounded-3xl flex items-center justify-center p-4"
				style={{
					opacity,
					transform: [{ scale }],
				}}>
				<Image resizeMode="contain" source={require('../assets/logotype_md.png')} className="w-20 h-20" />
			</Animated.View>
			{status && (
				<Animated.View
					style={{
						opacity: statusOpacity,
						transform: [{ translateY: statusTranslateY }],
					}}>
					<Text className="text-lg text-black mt-4">{status}</Text>
				</Animated.View>
			)}

			{debug && <Button title="Auth" onPress={() => router.push('/(auth)/login')} />}
		</View>
	)
}
