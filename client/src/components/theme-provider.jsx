import { ThemeProvider as NextThemesProvider } from "next-themes"

// next-themes is framework-agnostic, so this carries over as-is.
export function ThemeProvider({ children, ...props }) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
