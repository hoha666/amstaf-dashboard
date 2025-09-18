import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Box, List, ListItemButton, ListItemText, Typography, IconButton } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '@/hooks/useAuth'

type Props = { children: ReactNode }

export default function DashboardLayout({ children }: Props) {
    const { user, isAuthenticated, logout, loading } = useAuth()
    const router = useRouter()

    // Redirect if logged out
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace('/login')
        }
    }, [loading, isAuthenticated, router])

    const menuItems = [
        { label: 'داشبورد', path: '/admin' },
        ...(user?.role === 'Admin' ? [{ label: 'مدیریت کاربران', path: '/admin/users' }] : []),
        ...(user?.role === 'Admin' ? [{ label: 'مدیریت کالا', path: '/admin/products' }] : []),
        ...(user?.role === 'Admin' ? [{ label: 'مدیریت آیتم‌های فروش', path: '/admin/sale-items' }] : []),
    ]

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar always renders */}
            <Box
                component="nav"
                sx={{
                    width: 250,
                    bgcolor: (theme) => theme.palette.grey[100],
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: 2,
                }}
            >
                <List>
                    {menuItems.map((item) => (
                        <ListItemButton
                            key={item.path}
                            selected={router.pathname === item.path}
                            onClick={() => router.push(item.path)}
                        >
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    ))}
                </List>

                {user && (
                    <Box
                        sx={{
                            mt: 2,
                            pt: 2,
                            borderTop: '1px solid #ccc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between', // logout left, username right
                        }}
                    >
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                                logout()
                                router.push('/login')
                            }}
                        >
                            <LogoutIcon />
                        </IconButton>
                        <Typography variant="body2">{user.email}</Typography>
                    </Box>
                )}

            </Box>

            {/* Main content: only render if authorized */}
            <Box component="main" sx={{ flex: 1, p: 3 }}>
                {loading ? <div>Loading...</div> : isAuthenticated ? children : null}
            </Box>
        </Box>
    )
}
