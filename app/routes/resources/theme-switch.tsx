import { useHints } from '../../utils/client-hints'
import { useRequestInfo } from '../../utils/request-info'
import { setTheme, type Theme } from '../../utils/theme-server'
import { invariantResponse } from '@epic-web/invariant'
import { Monitor, Moon, Sun } from 'lucide-react'
import { data, redirect, useFetcher, useFetchers } from 'react-router'
import { ServerOnly } from 'remix-utils/server-only'
import type { Route } from './+types/theme-switch'
import type { ReactElement } from 'react'

const VALID_THEMES = ['system', 'light', 'dark'] as const
type ValidTheme = typeof VALID_THEMES[number]

function isValidTheme(value: unknown): value is ValidTheme {
    return typeof value === 'string' && VALID_THEMES.includes(value as ValidTheme)
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData()
    const theme = formData.get('theme')
    const redirectTo = formData.get('redirectTo')

    invariantResponse(
        isValidTheme(theme),
        'Invalid theme received. Must be one of: system, light, dark'
    )

    const responseInit = {
        headers: { 'set-cookie': setTheme(theme) },
    }

    if (redirectTo && typeof redirectTo === 'string') {
        return redirect(redirectTo, responseInit)
    } else {
        return data({ success: true, theme }, responseInit)
    }
}

export function ThemeSwitch({
    userPreference,
}: {
    userPreference?: Theme | 'system' | null
}) {
    const fetcher = useFetcher()
    const requestInfo = useRequestInfo()

    const optimisticMode = useOptimisticThemeMode()
    const mode = optimisticMode ?? userPreference ?? 'system'

    // Cycle through: system -> light -> dark -> system
    const nextMode =
        mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system'

    const size = 16
    const modeLabel: Record<ValidTheme | Theme, ReactElement> = {
        light: <Sun size={size} />,
        dark: <Moon size={size} />,
        system: <Monitor size={size} />,
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        // Apply theme immediately to prevent flicker
        if (typeof window !== 'undefined') {
            applyThemeImmediately(nextMode)
        }

        // Submit the form
        fetcher.submit(e.currentTarget, { method: 'POST' })
    }

    return (
        <fetcher.Form
            method="POST"
            action="/resources/theme-switch"
            className="aspect-square h-[20px]"
            onSubmit={handleSubmit}
        >
            <ServerOnly>
                {() => (
                    <input type="hidden" name="redirectTo" value={requestInfo.path} />
                )}
            </ServerOnly>
            <input type="hidden" name="theme" value={nextMode} />
            <button
                className="cursor-pointer"
                disabled={fetcher.state !== 'idle'}
                type="submit"
            >
                {modeLabel[mode as ValidTheme]}
            </button>
        </fetcher.Form>
    )
}

// Helper function to apply theme immediately to DOM (prevents flicker)
function applyThemeImmediately(theme: 'light' | 'dark' | 'system') {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    const hints = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const resolvedTheme = theme === 'system' ? hints : theme

    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
    root.setAttribute('data-theme', resolvedTheme)

    // Update meta tag
    const meta = document.querySelector('meta[name="color-scheme"]')
    if (meta) {
        meta.setAttribute('content', resolvedTheme === 'light' ? 'light' : 'dark')
    }
}

/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference. Always returns 'light' or 'dark', never 'system'.
 */
export function useTheme() {
    const hints = useHints()
    const requestInfo = useRequestInfo()
    const optimisticMode = useOptimisticThemeMode()

    if (optimisticMode) {
        // If optimistic mode is 'system', resolve to hints.theme
        // Otherwise return the optimistic mode (light or dark)
        return optimisticMode === 'system' ? hints.theme : optimisticMode
    }

    const userPref = requestInfo.userPrefs.theme
    // If user preference is 'system' or null, use hints.theme
    // Otherwise return the user preference (light or dark)
    return userPref === 'system' || !userPref ? hints.theme : userPref
}


export function useOptimisticThemeMode() {
    const fetchers = useFetchers()
    const themeFetcher = fetchers.find(
        (f) => f.formAction === '/resources/theme-switch'
    )

    // Use optimistic mode when the fetcher is actively submitting or loading
    // Also use it when the fetcher has completed successfully (idle with data)
    // This prevents flickering during navigation
    if (themeFetcher && themeFetcher.formData) {
        const theme = themeFetcher.formData.get('theme')
        if (isValidTheme(theme)) {
            // Use optimistic mode during submission/loading OR after successful completion
            // This ensures smooth transitions without flickering
            const state = themeFetcher.state
            const hasData = 'data' in themeFetcher && themeFetcher.data
            if (state === 'submitting' ||
                state === 'loading' ||
                (state === 'idle' && hasData)) {
                return theme as ValidTheme
            }
        }
    }

    return null
}
