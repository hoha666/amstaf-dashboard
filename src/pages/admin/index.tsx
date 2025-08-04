// src/pages/admin/index.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/DashboardLayout'
import { Typography } from '@mui/material'
import { jwtDecode } from 'jwt-decode'

type TokenClaims = {
    sub: string
    role: string
    exp: number
}

export default function AdminPage() {
    const router = useRouter()
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.replace('/login')
            return
        }

        try {
            const decoded: TokenClaims = jwtDecode(token)
            const isExpired = decoded.exp * 1000 < Date.now()
            if (isExpired) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                router.replace('/login')
            } else {
                setAuthorized(true)
            }
        } catch {
            router.replace('/login')
        }
    }, [router])

    if (!authorized) return null

    return (
        <DashboardLayout>
            <Typography variant="h5" gutterBottom>
                به پنل مدیریت خوش آمدید
            </Typography>
        </DashboardLayout>
    )
}
