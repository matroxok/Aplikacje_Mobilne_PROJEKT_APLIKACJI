import { supabase } from '@/lib/supabase'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface Todo {
	id: string
	user_id: string
	text: string
	completed: boolean
	created_at: string
}

export default function EditTodoScreen() {
	const { id } = useLocalSearchParams<{ id: string }>()

	const [todo, setTodo] = useState<Todo | null>(null)
	const [text, setText] = useState('')
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		async function fetchTodo() {
			if (!id) return

			setLoading(true)

			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser()

			if (userError || !user) {
				Alert.alert('Błąd', 'Nie udało się pobrać użytkownika.')
				setLoading(false)
				return
			}

			const { data, error } = await supabase.from('todos').select('*').eq('id', id).eq('user_id', user.id).single()

			if (error) {
				console.error(error)
				Alert.alert('Błąd', 'Nie udało się pobrać zadania.')
				setLoading(false)
				return
			}

			setTodo(data)
			setText(data.text)
			setLoading(false)
		}

		fetchTodo()
	}, [id])

	const updateTodo = async () => {
		if (!todo || !text.trim()) return

		setSaving(true)

		const { error } = await supabase
			.from('todos')
			.update({
				text: text.trim(),
			})
			.eq('id', todo.id)
			.eq('user_id', todo.user_id)

		setSaving(false)

		if (error) {
			console.error(error)
			Alert.alert('Błąd', 'Nie udało się zapisać zmian.')
			return
		}

		router.back()
	}

	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-zinc-50 px-6">
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#18181b" />
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView className="flex-1 bg-zinc-50 px-6">
			<KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
				<View className="flex-1 pt-6">
					<View className="mb-8 flex-row items-center justify-between">
						<View>
							<Text className="text-[34px] font-extrabold tracking-[-0.8px] text-zinc-950">Edytuj</Text>

							<Text className="mt-1 text-[17px] text-zinc-500">Zmień treść swojego zadania.</Text>
						</View>

						<TouchableOpacity
							className="min-h-10 px-10  py-3 śitems-center justify-center rounded-full bg-gray-200"
							activeOpacity={0.75}
							onPress={() => router.back()}>
							<Text className="text-lg font-semibold text-zinc-700">Wróć</Text>
						</TouchableOpacity>
					</View>

					<View className="rounded-[28px] bg-white p-5">
						<Text className="mb-2 px-1 text-[13px] font-medium text-zinc-500">Nazwa</Text>

						<TextInput
							className="min-h-auto py-4 flex justify-center items-center rounded-2xl bg-zinc-100 px-4 text-[17px] text-zinc-950"
							placeholder="Wpisz treść zadania..."
							placeholderTextColor="#a1a1aa"
							value={text}
							onChangeText={setText}
							multiline
						/>

						<TouchableOpacity
							className={`
								mt-5 min-h-[52px] items-center justify-center rounded-2xl bg-zinc-950 px-4
								${saving || !text.trim() ? 'opacity-40' : ''}
							`}
							activeOpacity={0.75}
							onPress={updateTodo}
							disabled={saving || !text.trim()}>
							<Text className="text-base font-bold text-white">{saving ? 'Zapisywanie...' : 'Zapisz'}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}
