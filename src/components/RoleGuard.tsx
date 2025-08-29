import { ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'

type Props = {
    roles: string[]
    children: ReactNode
}

export default function RoleGuard({ roles, children }: Props) {
    const { user, hasRole, loading } = useAuth()
    const router = useRouter()

    // Show nothing while loading
    if (loading) return null

    // Not logged in
    if (!user) {
        if (typeof window !== 'undefined') router.replace('/login')
        return null
    }

    // Logged in but no allowed role
    if (!hasRole(roles)) {
        if (typeof window !== 'undefined') router.replace('/unauthorized')
        return null
    }

    return <>{children}</>
}
