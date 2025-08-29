import { useState } from 'react'
import { useRouter } from 'next/router'
import { Box, Button, Paper, TextField, Typography, Snackbar, Alert } from '@mui/material'
import { jwtDecode } from 'jwt-decode'

type LoginResponse = { token: string }

type TokenClaims = {
    sub: string
    exp: number
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string
}

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [openSnackbar, setOpenSnackbar] = useState(false)
    const router = useRouter()

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            setErrorMessage('نام کاربری و رمز عبور نباید خالی باشد')
            setOpenSnackbar(true)
            return
        }
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })

            if (!response.ok) {
                setErrorMessage('نام کاربری یا رمز اشتباه است')
                setOpenSnackbar(true)
                return
            }

            const data: LoginResponse = await response.json()

            // Decode JWT with correct typing
            const decoded: TokenClaims = jwtDecode<TokenClaims>(data.token)
            const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']

            if (!decoded.sub || !role || !decoded.exp) throw new Error('توکن نامعتبر است')
            if (decoded.exp * 1000 < Date.now()) throw new Error('توکن منقضی شده است')

            // Save token and user info
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify({ email: decoded.sub, role }))

            // Redirect to admin dashboard
            router.push('/admin')
        } catch (error) {
            console.error(error)
            setErrorMessage('خطا در ارتباط با سرور یا توکن نامعتبر است')
            setOpenSnackbar(true)
        }
    }

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Paper sx={{ p: 4, width: 300 }}>
                <Typography variant="h6" gutterBottom>
                    ورود به پنل مدیریت
                </Typography>
                <TextField
                    fullWidth
                    label="نام کاربری"
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                    fullWidth
                    label="رمز عبور"
                    type="password"
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleLogin}>
                    ورود
                </Button>
            </Paper>

            <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)}>
                <Alert severity="error" onClose={() => setOpenSnackbar(false)}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    )
}
