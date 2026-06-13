import FormPasswordInput from '@/components/password-input'
import FormButton from '@/components/subbmit-button'
import FormTextInput from '@/components/text-input'
import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, useWindowDimensions, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Auth() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [name, setName] = useState('')
	const [loading, setLoading] = useState(false)

	const { width, height } = useWindowDimensions()
	const isLandscape = width > height

	async function signUpWithEmail() {
		setLoading(true)
		const { error } = await supabase.auth.signUp({
			email: email,
			password: password,
			options: {
				data: {
					full_name: name,
				},
			},
		})

		if (error) {
			console.error('Error signing in:', error)
		}
		setLoading(false)
	}

	return (
		<SafeAreaView className="flex-1 bg-zinc-50">
			<KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
				<ScrollView
					className="flex-1"
					contentContainerClassName="flex-grow px-6 py-6"
					keyboardShouldPersistTaps="handled">
					<View
						className={`
                                    flex-1 w-full max-w-md self-center
                                    ${isLandscape ? 'max-w-none flex-row items-center gap-10' : 'gap-10'}
                                `}>
						<View className={`${isLandscape ? 'flex-1' : 'pt-6'}`}>
							<View className="mb-8">
								<Image source={require('@/assets/logotype_md.png')} resizeMode="contain" className="mb-8 h-16 w-16" />

								<Text className="text-[34px] font-bold tracking-tight text-zinc-950">Rejestracja</Text>

								<Text className="mt-3 text-[17px] leading-6 text-zinc-500">
									Opowiedz troche o sobie, wypełnij formularz aby się zarejestrować.
								</Text>
							</View>
						</View>

						<View className={`${isLandscape ? 'flex-1 max-w-md' : 'w-full'}`}>
							<View className="gap-4">
								<FormTextInput
									label="Imię i nazwisko"
									placeholder="np. Mateusz Kozera"
									value={name}
									onChangeText={setName}
									autoCapitalize="words"
								/>
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
								<FormButton title="Utwrórz konto" loading={loading} onPress={signUpWithEmail} />
							</View>
						</View>

						{!isLandscape && (
							<View className="w-full pb-6">
								<View className="border-t border-zinc-200 pt-5">
									<Text className="text-center text-sm text-zinc-500">Masz ju konto?</Text>

									<FormButton
										className="mt-2"
										title="Zaloguj się"
										variant="ghost"
										onPress={() => router.push('/(auth)/login')}
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
