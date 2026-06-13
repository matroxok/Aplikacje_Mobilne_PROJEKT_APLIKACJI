import FormPasswordInput from '@/components/password-input'
import FormButton from '@/components/subbmit-button'
import FormTextInput from '@/components/text-input'
import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Auth() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)

	const { width, height } = useWindowDimensions()
	const isLandscape = width > height

	async function signInWithEmail() {
		setLoading(true)

		const { error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
		})

		if (error) {
			console.error('Error signing in:', error)
		}

		setLoading(false)
	}

	return (
		<SafeAreaView className="flex-1 bg-zinc-50">
			<KeyboardAvoidingView
				className="flex-1"
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
				<ScrollView
					className="flex-1"
					contentContainerClassName={`
						flex-grow px-6 py-6
						${isLandscape ? 'justify-center' : ''}
					`}
					keyboardShouldPersistTaps="handled"
					keyboardDismissMode="on-drag"
					showsVerticalScrollIndicator={false}>
					<View
						className={`
							w-full max-w-md self-center
							${isLandscape ? 'max-w-none flex-row items-center gap-10' : 'gap-10'}
						`}>
						<View className={`${isLandscape ? 'flex-1' : ''}`}>
							<View>
								<Image source={require('@/assets/logotype_md.png')} resizeMode="contain" className="mb-8 h-16 w-16" />

								<Text className="text-[34px] font-bold tracking-tight text-zinc-950">Dzień dobry,</Text>

								<Text className="mt-3 text-[17px] leading-6 text-zinc-500">
									Proszę zalogować się do swojego konta, aby kontynuować.
								</Text>
							</View>
						</View>

						<View className={`${isLandscape ? 'flex-1 max-w-md' : 'w-full'}`}>
							<View className="gap-4">
								<FormTextInput
									label="Email"
									placeholder="np. 281801@student.pwr.edu.pl"
									value={email}
									onChangeText={setEmail}
									autoCapitalize="none"
									keyboardType="email-address"
								/>

								<FormPasswordInput
									label="Hasło"
									placeholder="Wpisz hasło"
									value={password}
									onChangeText={setPassword}
									autoCapitalize="none"
								/>
							</View>

							<View className="mt-6 gap-3">
								<FormButton title="Zaloguj się" loading={loading} onPress={signInWithEmail} />
							</View>
						</View>

						{!isLandscape && (
							<View className="w-full pb-4">
								<View className="border-t border-zinc-200 pt-5">
									<Text className="text-center text-sm text-zinc-500">Nie masz jeszcze konta?</Text>

									<FormButton
										className="mt-2"
										title="Utwórz konto"
										variant="ghost"
										onPress={() => router.push('/(auth)/register')}
									/>
								</View>
							</View>
						)}
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}
