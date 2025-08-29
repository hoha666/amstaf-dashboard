// src/pages/admin/users.tsx
import { useState, useMemo } from 'react'
import { Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, TextField, DialogActions, MenuItem, TablePagination } from '@mui/material'
import DashboardLayout from '@/components/DashboardLayout'
import RoleGuard from '@/components/RoleGuard'

type User = {
    id: string
    name: string
    role: string
    active: boolean
}

export default function UserManagement() {
    // 15 sample users
    const initialUsers: User[] = [
        { id: '1', name: 'Admin', role: 'admin', active: true },
        { id: '2', name: 'Alice', role: 'sales manager', active: true },
        { id: '3', name: 'Bob', role: 'content manager', active: true },
        { id: '4', name: 'Charlie', role: 'customer', active: true },
        { id: '5', name: 'David', role: 'customer', active: true },
        { id: '6', name: 'Eve', role: 'sales manager', active: true },
        { id: '7', name: 'Frank', role: 'content manager', active: true },
        { id: '8', name: 'Grace', role: 'customer', active: true },
        { id: '9', name: 'Hank', role: 'sales manager', active: true },
        { id: '10', name: 'Ivy', role: 'customer', active: true },
        { id: '11', name: 'Jack', role: 'customer', active: true },
        { id: '12', name: 'Karen', role: 'sales manager', active: true },
        { id: '13', name: 'Leo', role: 'content manager', active: true },
        { id: '14', name: 'Mia', role: 'customer', active: true },
        { id: '15', name: 'Nick', role: 'customer', active: true },
    ]

    const [users, setUsers] = useState<User[]>(initialUsers)
    const [open, setOpen] = useState(false)
    const [newUser, setNewUser] = useState({ name: '', role: 'customer' })
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [search, setSearch] = useState('')

    const handleAddUser = () => {
        if (!newUser.name) return
        setUsers([
            ...users,
            { id: (users.length + 1).toString(), name: newUser.name, role: newUser.role, active: true },
        ])
        setNewUser({ name: '', role: 'customer' })
        setOpen(false)
    }

    const handleDisable = (id: string) => {
        setUsers(users.map((u) => (u.id === id ? { ...u, active: false } : u)))
    }

    const filteredUsers = useMemo(
        () => users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase())),
        [users, search]
    )

    const paginatedUsers = useMemo(
        () => filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [filteredUsers, page, rowsPerPage]
    )

    return (
        <RoleGuard roles={['Admin']}>
            <DashboardLayout>
                <Typography variant="h5" gutterBottom>
                    مدیریت کاربران
                </Typography>

                <TextField
                    placeholder="جستجو بر اساس نام"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ mb: 2 }}
                    fullWidth
                />

                <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
                    اضافه کردن کاربر جدید
                </Button>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>شناسه کاربری</TableCell>
                            <TableCell>نام</TableCell>
                            <TableCell>نقش</TableCell>
                            <TableCell>وضعیت</TableCell>
                            <TableCell>اعمال</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.active ? 'Active' : 'Disabled'}</TableCell>
                                <TableCell>
                                    {user.role !== 'admin' && (
                                        <Button size="small" color="secondary" onClick={() => handleDisable(user.id)}>
                                            غیر فعال کردن
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <TablePagination
                    component="div"
                    count={filteredUsers.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10))
                        setPage(0)
                    }}
                    rowsPerPageOptions={[5, 10, 15]}
                />

                <Dialog open={open} onClose={() => setOpen(false)}>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Name"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            select
                            label="Role"
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            fullWidth
                        >
                            <MenuItem value="sales manager">Sales Manager</MenuItem>
                            <MenuItem value="content manager">Content Manager</MenuItem>
                            <MenuItem value="customer">Customer</MenuItem>
                        </TextField>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleAddUser}>
                            Add
                        </Button>
                    </DialogActions>
                </Dialog>
            </DashboardLayout>
        </RoleGuard>
    )
}
