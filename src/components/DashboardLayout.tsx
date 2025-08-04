// src/components/DashboardLayout.tsx
import { Box } from '@mui/material'
import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <Box sx={{ p: 4 }}>
            {children}
        </Box>
    )
}
