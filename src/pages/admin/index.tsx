import DashboardLayout from '@/components/DashboardLayout'
import { Typography } from '@mui/material'
import RoleGuard from '@/components/RoleGuard'

export default function AdminPage() {
    return (
        <RoleGuard roles={['Admin', 'Manager']}>
            <DashboardLayout>
                <Typography variant="h5" gutterBottom>
                    به پنل مدیریت خوش آمدید
                </Typography>
                <Typography variant="body1">
                    این صفحه اصلی پنل مدیریت است. از نوار کناری می‌توانید به بخش‌های دیگر مانند مدیریت کاربران دسترسی پیدا کنید.
                </Typography>
            </DashboardLayout>
        </RoleGuard>
    )
}
