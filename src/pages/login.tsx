// src/pages/login.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import {
    Box,
    Button,
    Paper,
    TextField,
    Typography
} from '@mui/material'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()

    const handleLogin = () => {
        if (username === 'admin' && password === 'admin') {
            localStorage.setItem('auth', 'true')
            router.push('/admin')
        } else {
            alert('نام کاربری یا رمز عبور اشتباه است')
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
                    margin="normal"
                    type="password"
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
