// hooks/useAuth.ts
import { useState, useEffect } from 'react'

export type User = {
    email: string
    role: string
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const stored = localStorage.getItem('user')
        if (stored) setUser(JSON.parse(stored))
    }, [])

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        window.location.href = '/login'
    }

    const hasRole = (roles: string | string[]) => {
        if (!user) return false
        if (typeof roles === 'string') return user.role === roles
        return roles.includes(user.role)
    }

    return { user, logout, hasRole }
}
