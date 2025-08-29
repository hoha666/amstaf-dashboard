// src/pages/admin/users.tsx
import { Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, TextField, DialogActions, MenuItem } from '@mui/material'
import DashboardLayout from '@/components/DashboardLayout'
import RoleGuard from '@/components/RoleGuard'
import { useState } from 'react'

type User = {
    id: string
    name: string
    role: string
    active: boolean
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([
        { id: '1', name: 'Admin', role: 'admin', active: true },
        { id: '2', name: 'Alice', role: 'sales manager', active: true },
        { id: '3', name: 'Bob', role: 'content manager', active: true },
    ])
    const [open, setOpen] = useState(false)
    const [newUser, setNewUser] = useState({ name: '', role: 'customer' })

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

    return (
        <RoleGuard roles={['Admin']}>
            <DashboardLayout>
                <Typography variant="h5" gutterBottom>
                    User Management
                </Typography>
                <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
                    Add New User
                </Button>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.active ? 'Active' : 'Disabled'}</TableCell>
                                <TableCell>
                                    {user.role !== 'admin' && (
                                        <Button size="small" color="secondary" onClick={() => handleDisable(user.id)}>
                                            Disable
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

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
