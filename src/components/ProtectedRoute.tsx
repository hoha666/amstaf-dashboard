import { useRouter } from 'next/router'
import { useEffect, ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'

type TokenClaims = {
    sub: string
    role: string
    exp: number
}

type ProtectedRouteProps = {
    children: ReactNode
    requiredRole?: string
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.replace('/login')
            return
        }

        try {
            const decoded: TokenClaims = jwtDecode(token)
            const isExpired = decoded.exp * 1000 < Date.now()
            if (isExpired || (requiredRole && decoded.role !== requiredRole)) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                router.replace('/login')
            }
        } catch {
            router.replace('/login')
        }
    }, [router, requiredRole])

    return <>{children}</>
}
