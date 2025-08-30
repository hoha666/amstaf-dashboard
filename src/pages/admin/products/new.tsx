// src/pages/admin/products/new.tsx
import { useState } from "react";
import {
    Typography, TextField, MenuItem, Button, Box, Snackbar, Alert, Paper
} from "@mui/material";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { createProduct, CreateProductDTO } from "@/services/products";
import { useRouter } from "next/router";

export default function NewProductPage() {
    const router = useRouter();
    const [form, setForm] = useState<CreateProductDTO>({
        productType: "Pants",
        name: "",
        price: 0,
        stock: 0,
        size: "large",
        color: "green",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openError, setOpenError] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        try {
            setSaving(true);
            setError(null);

            await createProduct(form);
            setSuccess(true);
            router.replace("/admin/products");
        } catch (e: any) {
            setError(e?.message || "خطا در ایجاد محصول");
            setOpenError(true);
        } finally {
            setSaving(false);
        }
    };

    return (
        <RoleGuard roles={["Admin"]}>
            <DashboardLayout>
                <Typography variant="h5" gutterBottom>افزودن محصول جدید</Typography>

                <Paper sx={{ p: 2, maxWidth: 600 }}>
                    <Box sx={{ display: "grid", gap: 2 }}>
                        <TextField
                            label="نوع محصول"
                            value={form.productType}
                            onChange={(e) => setForm({ ...form, productType: e.target.value })}
                            select
                        >
                            <MenuItem value="Pants">Pants</MenuItem>
                            <MenuItem value="Shirt">Shirt</MenuItem>
                            <MenuItem value="Shoes">Shoes</MenuItem>
                        </TextField>

                        <TextField
                            label="نام"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />

                        <TextField
                            label="قیمت"
                            type="number"
                            inputProps={{ step: "0.01" }}
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                        />

                        <TextField
                            label="موجودی"
                            type="number"
                            value={form.stock}
                            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                        />

                        <TextField
                            label="سایز"
                            select
                            value={form.size}
                            onChange={(e) => setForm({ ...form, size: e.target.value })}
                        >
                            <MenuItem value="small">small</MenuItem>
                            <MenuItem value="medium">medium</MenuItem>
                            <MenuItem value="large">large</MenuItem>
                        </TextField>

                        <TextField
                            label="رنگ"
                            select
                            value={form.color}
                            onChange={(e) => setForm({ ...form, color: e.target.value })}
                        >
                            <MenuItem value="green">green</MenuItem>
                            <MenuItem value="red">red</MenuItem>
                            <MenuItem value="blue">blue</MenuItem>
                        </TextField>

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Button variant="contained" onClick={handleSubmit} disabled={saving || !form.name}>
                                {saving ? "در حال ذخیره..." : "ذخیره محصول"}
                            </Button>
                            <Button variant="text" onClick={() => router.back()} disabled={saving}>
                                انصراف
                            </Button>
                        </Box>
                    </Box>
                </Paper>

                <Snackbar open={openError} autoHideDuration={4000} onClose={() => setOpenError(false)}>
                    <Alert severity="error" onClose={() => setOpenError(false)}>
                        {error}
                    </Alert>
                </Snackbar>

                <Snackbar open={success} autoHideDuration={2500} onClose={() => setSuccess(false)}>
                    <Alert severity="success" onClose={() => setSuccess(false)}>
                        محصول با موفقیت ایجاد شد
                    </Alert>
                </Snackbar>
            </DashboardLayout>
        </RoleGuard>
    );
}
