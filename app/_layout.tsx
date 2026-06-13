import { useAuthContext } from '@/hooks/use-auth-context'
import AuthProvider from '@/providers/auth-provider'
import { Stack } from 'expo-router'
import '../global.css'

function RootNavigation() {
	const { isLoggedIn } = useAuthContext()

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Protected guard={isLoggedIn}>
				<Stack.Screen name="(home)/home" />
			</Stack.Protected>
			<Stack.Protected guard={!isLoggedIn}>
				<Stack.Screen name="(auth)" />
			</Stack.Protected>
		</Stack>
	)
}

export default function RootLayout() {
	return (
		<AuthProvider>
			<RootNavigation></RootNavigation>
		</AuthProvider>
	)
}
