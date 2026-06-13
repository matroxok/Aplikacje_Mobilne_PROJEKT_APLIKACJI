import React, { useState } from 'react'
import { Text, TextInput, TextInputProps, View } from 'react-native'

type InputProps = TextInputProps & {
	label?: string
	error?: string
	helperText?: string
	className?: string
	containerClassName?: string
}

export default function FormTextInput({
	label,
	error,
	helperText,
	className,
	containerClassName,
	...props
}: InputProps) {
	const [isFocused, setIsFocused] = useState(false)

	return (
		<View className={`w-full ${containerClassName ?? ''}`}>
			{label && <Text className="mb-2 px-1 text-[13px] font-medium text-zinc-500">{label}</Text>}

			<View
				className={`
					w-full rounded-xl bg-zinc-100 px-4
					${isFocused ? 'bg-white border border-zinc-300' : 'border border-transparent'}
					${error ? 'bg-red-50 border-red-300' : ''}
				`}>
				<TextInput
					className={`
						min-h-[48px] text-[17px] text-zinc-950
						${className ?? ''}
					`}
					placeholderTextColor="#a1a1aa"
					selectionColor="#0a84ff"
					onFocus={event => {
						setIsFocused(true)
						props.onFocus?.(event)
					}}
					onBlur={event => {
						setIsFocused(false)
						props.onBlur?.(event)
					}}
					{...props}
				/>
			</View>

			{error ? (
				<Text className="mt-2 px-1 text-[13px] text-red-500">{error}</Text>
			) : helperText ? (
				<Text className="mt-2 px-1 text-[13px] text-zinc-500">{helperText}</Text>
			) : null}
		</View>
	)
}
