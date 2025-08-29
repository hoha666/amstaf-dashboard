// src/pages/_app.tsx
import type {AppProps} from 'next/app'
import {CacheProvider} from '@emotion/react'
import createCache from '@emotion/cache'
import {prefixer} from 'stylis'
import rtlPlugin from 'stylis-plugin-rtl'
import {createTheme, ThemeProvider} from '@mui/material/styles'
import {GlobalStyles} from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'

// Create RTL cache
const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
})

// MUI theme with global font
const theme = createTheme({
    direction: 'rtl',
    typography: {
        fontFamily: 'IRANSansWeb, Arial, sans-serif',
    },
})

export default function App({Component, pageProps}: AppProps) {
    return (
        <CacheProvider value={cacheRtl}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <GlobalStyles
                    styles={`
            @font-face {
              font-family: 'IRANSansWeb';
              src: url('/fonts/IRANSansWeb.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
            }
          `}
                />
                <Component {...pageProps} />
            </ThemeProvider>
        </CacheProvider>
    )
}
