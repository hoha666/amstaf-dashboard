// src/components/DashboardLayout.tsx
import { ReactNode } from 'react'
import { useRouter } from 'next/router'
import { Box, List, ListItemButton, ListItemText, Typography, IconButton } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '@/hooks/useAuth'

type Props = { children: ReactNode }

export default function DashboardLayout({ children }: Props) {
    const { user, logout } = useAuth()
    const router = useRouter()

    const menuItems = [
        { label: 'Dashboard', path: '/admin' },
        ...(user?.role === 'Admin' ? [{ label: 'User Management', path: '/admin/users' }] : []),
        // Add more role-specific links here
    ]

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <Box
                component="nav"
                sx={{
                    width: 200,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: 2,
                }}
            >
                {/* Menu items */}
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

                {/* Bottom fixed box with username and logout */}
                {user && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #ccc' }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            {user.email}
                        </Typography>
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
                    </Box>
                )}
            </Box>

            {/* Main content */}
            <Box component="main" sx={{ flex: 1, p: 3 }}>
                {children}
            </Box>
        </Box>
    )
}
