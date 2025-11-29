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

    return (
        <fetcher.Form
            method="POST"
            action="/resources/theme-switch"
            className="aspect-square h-[20px]"
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
        (f) => f.formAction === '/resources/theme-switch',
    )

    if (themeFetcher && themeFetcher.formData) {
        const theme = themeFetcher.formData.get('theme')
        if (isValidTheme(theme)) {
            return theme
        }
    }

    return null
}
