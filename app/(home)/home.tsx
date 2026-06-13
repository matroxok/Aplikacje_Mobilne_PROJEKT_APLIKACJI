import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Image,
	RefreshControl,
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

interface Profile {
	id: string
	full_name: string | null
}

export default function HomeScreen() {
	const [todos, setTodos] = useState<Todo[]>([])
	const [inputText, setInputText] = useState('')
	const [loading, setLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false)
	const [userId, setUserId] = useState<string | null>(null)
	const [profile, setProfile] = useState<Profile | null>(null)

	const getCurrentUser = async () => {
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser()

		if (error || !user) {
			Alert.alert('Błąd', 'Nie udało się pobrać użytkownika.')
			return null
		}

		return user
	}

	const fetchProfile = async (id: string) => {
		const { data, error } = await supabase.from('profiles').select('id, full_name').eq('id', id).single()

		if (error) {
			console.error(error)
			return
		}

		setProfile(data)
	}

	const fetchTodos = async (isRefreshing = false, id = userId) => {
		if (!id) {
			setLoading(false)
			setRefreshing(false)
			return
		}

		if (isRefreshing) {
			setRefreshing(true)
		} else {
			setLoading(true)
		}

		const { data, error } = await supabase
			.from('todos')
			.select('*')
			.eq('user_id', id)
			.order('created_at', { ascending: false })

		if (error) {
			console.error(error)
			Alert.alert('Błąd', 'Nie udało się załadować zadań.')
		} else {
			setTodos(data || [])
		}

		setLoading(false)
		setRefreshing(false)
	}

	useEffect(() => {
		let channel: ReturnType<typeof supabase.channel> | null = null

		async function init() {
			const user = await getCurrentUser()

			if (!user) {
				setLoading(false)
				return
			}

			setUserId(user.id)

			await fetchProfile(user.id)
			await fetchTodos(false, user.id)

			channel = supabase
				.channel(`public:todos:${user.id}`)
				.on(
					'postgres_changes',
					{
						event: '*',
						schema: 'public',
						table: 'todos',
						filter: `user_id=eq.${user.id}`,
					},
					payload => {
						setTodos(current => {
							const newNode = payload.new as Todo
							const oldNode = payload.old as { id: string }

							switch (payload.eventType) {
								case 'INSERT':
									return current.some(todo => todo.id === newNode.id) ? current : [newNode, ...current]

								case 'UPDATE':
									return current.map(todo => (todo.id === newNode.id ? newNode : todo))

								case 'DELETE':
									return current.filter(todo => todo.id !== oldNode.id)

								default:
									return current
							}
						})
					},
				)
				.subscribe()
		}

		init()

		return () => {
			if (channel) {
				supabase.removeChannel(channel)
			}
		}
	}, [])

	const createTodo = async () => {
		if (!inputText.trim() || !userId) return

		const newTodoText = inputText.trim()

		setInputText('')

		const { data, error } = await supabase
			.from('todos')
			.insert([
				{
					text: newTodoText,
					completed: false,
					user_id: userId,
				},
			])
			.select()
			.single()

		if (error) {
			console.error(error)
			Alert.alert('Błąd', 'Nie udało się dodać zadania.')
			setInputText(newTodoText)
			return
		}

		setTodos(current => {
			const createdTodo = data as Todo

			if (current.some(todo => todo.id === createdTodo.id)) {
				return current
			}

			return [createdTodo, ...current]
		})
	}

	const toggleTodo = async (id: string, completed: boolean) => {
		setTodos(current => current.map(todo => (todo.id === id ? { ...todo, completed: !completed } : todo)))

		const { error } = await supabase.from('todos').update({ completed: !completed }).eq('id', id).eq('user_id', userId)

		if (error) {
			setTodos(current => current.map(todo => (todo.id === id ? { ...todo, completed } : todo)))

			console.error(error)
			Alert.alert('Błąd', 'Nie udało się zaktualizować zadania.')
		}
	}

	const deleteTodo = async (id: string) => {
		Alert.alert('Usuń zadanie', 'Czy na pewno chcesz usunąć to zadanie?', [
			{
				text: 'Anuluj',
				style: 'cancel',
			},
			{
				text: 'Usuń',
				style: 'destructive',
				onPress: async () => {
					const previousTodos = todos

					setTodos(current => current.filter(todo => todo.id !== id))

					const { error } = await supabase.from('todos').delete().eq('id', id).eq('user_id', userId)

					if (error) {
						setTodos(previousTodos)
						console.error(error)
						Alert.alert('Błąd', 'Nie udało się usunąć zadania.')
					}
				},
			},
		])
	}

	const signOut = async () => {
		const { error } = await supabase.auth.signOut()

		if (error) {
			Alert.alert('Błąd', 'Nie udało się wylogować.')
			return
		}

		router.replace('/(auth)/login')
	}

	const completedCount = todos.filter(todo => todo.completed).length
	const userName = profile?.full_name || 'Użytkowniku'

	const renderItem = ({ item }: { item: Todo }) => (
		<View className="mb-3 rounded-[20px] bg-white p-4">
			<TouchableOpacity
				className="flex-row items-center gap-3"
				activeOpacity={0.75}
				onPress={() => toggleTodo(item.id, item.completed)}>
				<View
					className={`
					h-[26px] w-[26px] items-center justify-center rounded-lg border-2
					${item.completed ? 'border-zinc-950 bg-zinc-950' : 'border-zinc-300 bg-transparent'}
				`}>
					{item.completed && <Text className="text-[15px] font-extrabold text-white">✓</Text>}
				</View>

				<Text
					className={`
					flex-1 text-[17px] leading-[22px]
					${item.completed ? 'text-zinc-400 line-through' : 'text-zinc-900'}
				`}
					numberOfLines={2}>
					{item.text}
				</Text>
			</TouchableOpacity>

			<View className="mt-4 flex-row justify-end gap-4 border-t border-zinc-100 pt-3">
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() =>
						router.push({
							pathname: '/(home)/todo/[id]',
							params: { id: item.id },
						})
					}>
					<Text className="text-sm font-semibold text-zinc-600">Edytuj</Text>
				</TouchableOpacity>

				<TouchableOpacity activeOpacity={0.7} onPress={() => deleteTodo(item.id)}>
					<Text className="text-sm font-semibold text-red-500">Usuń</Text>
				</TouchableOpacity>
			</View>
		</View>
	)

	return (
		<SafeAreaView className="flex-1 bg-zinc-50 px-6">
			<View className="mb-6 pt-4">
				<View className="flex-row items-start justify-between gap-4">
					<View className="flex-1">
						<Text className="mb-1 text-[17px] text-zinc-500">Dzień dobry,</Text>

						<Text className="text-[34px] font-extrabold tracking-[-0.8px] text-zinc-950" numberOfLines={1}>
							{userName}
						</Text>
					</View>

					<TouchableOpacity
						className="min-h-10 items-center justify-center rounded-full bg-red-200 px-4"
						activeOpacity={0.75}
						onPress={signOut}>
						<Text className="text-sm font-semibold text-zinc-700">Wyloguj</Text>
					</TouchableOpacity>
				</View>

				<View className="mt-6 rounded-[28px] bg-white p-5">
					<Text className="text-[22px] font-bold tracking-[-0.3px] text-zinc-950">Twoje zadania</Text>

					<Text className="mt-1.5 text-base text-zinc-500">
						Ukończono {completedCount} z {todos.length}
					</Text>
				</View>
			</View>

			<View className="mb-5 flex-row items-center gap-2.5">
				<TextInput
					className="min-h-auto py-4 flex-1 rounded-2xl bg-zinc-100 px-4 text-[17px] text-zinc-950"
					placeholder="Dodaj nowe zadanie..."
					placeholderTextColor="#a1a1aa"
					value={inputText}
					onChangeText={setInputText}
					onSubmitEditing={createTodo}
					returnKeyType="done"
				/>

				<TouchableOpacity
					className={`
						min-h-auto py-3 px-5 items-center justify-center rounded-2xl bg-gray-500
						${!inputText.trim() ? 'opacity-40' : 'bg-green-500'}
					`}
					activeOpacity={0.75}
					onPress={createTodo}
					disabled={!inputText.trim()}>
					<Text className="text-base font-bold text-white">Dodaj</Text>
				</TouchableOpacity>
			</View>

			{loading && !refreshing ? (
				<View className="flex-1 justify-center">
					<ActivityIndicator size="large" color="#18181b" />
				</View>
			) : (
				<FlatList
					data={todos}
					keyExtractor={item => item.id}
					renderItem={renderItem}
					contentContainerStyle={{
						paddingBottom: 24,
						flexGrow: todos.length === 0 ? 1 : undefined,
					}}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={() => fetchTodos(true)} tintColor="#18181b" />
					}
					ListEmptyComponent={
						<View className="flex-1 items-center justify-center pb-20">
							{/* <Text className="text-[22px] font-bold text-zinc-900">Brak zadań</Text>

							<Text className="mt-2 text-center text-base text-zinc-500">Dodaj pierwsze zadanie, aby rozpocząć.</Text> */}
							<Image source={require('@/assets/undraw_no-data_ig65.png')} resizeMode="contain" className="h-64 w-64" />
							<Text className="mt-6 text-[22px] font-bold text-zinc-900">Brak zadań</Text>
						</View>
					}
				/>
			)}
		</SafeAreaView>
	)
}
