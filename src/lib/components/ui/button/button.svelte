<script lang="ts">
	import { tv } from 'tailwind-variants';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	const buttonVariants = tv({
		base: 'btn',
		variants: {
			variant: {
				primary: 'btn-primary',
				secondary: 'btn-secondary',
				ghost: 'btn-ghost'
			},
			size: {
				default: '',
				sm: 'btn-sm'
			}
		},
		defaultVariants: {
			variant: 'primary',
			size: 'default'
		}
	});

	let {
		variant = 'primary',
		size = 'default',
		href = undefined,
		class: className = '',
		children,
		...rest
	}: {
		variant?: 'primary' | 'secondary' | 'ghost';
		size?: 'default' | 'sm';
		href?: string;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

{#if href}
	<a {href} class={cn(buttonVariants({ variant, size }), className)} {...rest}>
		{@render children?.()}
	</a>
{:else}
	<button class={cn(buttonVariants({ variant, size }), className)} {...rest}>
		{@render children?.()}
	</button>
{/if}
