// components/RoleGuard.tsx
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

type RoleGuardProps = {
    roles: string | string[]
    children: React.ReactNode
}

export default function RoleGuard({ roles, children }: RoleGuardProps) {
    const { user, hasRole } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (user && !hasRole(roles)) {
            router.replace('/unauthorized') // or '/' depending on your UX
        }
    }, [user])

    if (!user) return null // or loading spinner

    return hasRole(roles) ? <>{children}</> : null
}
