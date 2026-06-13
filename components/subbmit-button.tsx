import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native'

type ButtonProps = TouchableOpacityProps & {
	title: string
	loading?: boolean
	variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
	size?: 'md' | 'lg'
	textClassName?: string
}

export default function FormButton({
	title,
	loading = false,
	variant = 'primary',
	size = 'lg',
	disabled,
	className,
	textClassName,
	...props
}: ButtonProps) {
	const isDisabled = disabled || loading

	const variants = {
		primary: 'bg-zinc-950',
		secondary: 'bg-zinc-100',
		ghost: 'bg-transparent',
		destructive: 'bg-red-500',
	}

	const textVariants = {
		primary: 'text-white',
		secondary: 'text-zinc-950',
		ghost: 'text-zinc-500',
		destructive: 'text-white',
	}

	const sizes = {
		md: 'min-h-[44px] px-4',
		lg: 'min-h-[52px] px-5',
	}

	return (
		<TouchableOpacity
			activeOpacity={0.72}
			disabled={isDisabled}
			className={`
				w-full items-center justify-center rounded-xl
				${sizes[size]}
				${variants[variant]}
				${isDisabled ? 'opacity-50' : ''}
				${className ?? ''}
			`}
			{...props}>
			{loading ? (
				<ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? '#18181b' : '#ffffff'} />
			) : (
				<Text
					className={`
						text-[17px] font-semibold
						${textVariants[variant]}
						${textClassName ?? ''}
					`}>
					{title}
				</Text>
			)}
		</TouchableOpacity>
	)
}
