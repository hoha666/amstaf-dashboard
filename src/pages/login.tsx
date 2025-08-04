// src/pages/login.tsx
import {useState} from 'react'
import {useRouter} from 'next/router'
import {
    Box,
    Button,
    Paper,
    TextField,
    Typography
} from '@mui/material'
import {jwtDecode} from 'jwt-decode'

type LoginResponse = { token: string }
type TokenClaims = {
    sub: string
    role: string
    exp: number
}

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()

    const handleLogin = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, password}),
            })

            if (!response.ok) {
                alert('نام کاربری یا رمز اشتباه است')
                return
            }

            const data: LoginResponse = await response.json()
            const decoded: TokenClaims = jwtDecode(data.token)

            // Save token and user info
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify({
                email: decoded.sub,
                role: decoded.role,
            }))

            router.push('/admin')
        } catch (error) {
            alert('خطا در ارتباط با سرور')
            console.error(error)
        }
    }

    return (
        <Box sx={{minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Paper sx={{p: 4, width: 300}}>
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
                <Button variant="contained" fullWidth onClick={handleLogin}>
                    ورود
                </Button>
            </Paper>
        </Box>
    )
}
