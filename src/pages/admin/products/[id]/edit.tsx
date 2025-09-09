import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
    Typography,
    TextField,
    MenuItem,
    Button,
    Box,
    Paper,
    Snackbar,
    Alert,
} from "@mui/material";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import {
    getProductById,
    updateProduct,
    Product,
} from "@/services/products";

export default function EditProductPage() {
    const router = useRouter();
    const { id } = router.query;

    const [form, setForm] = useState<Partial<Product>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!id || Array.isArray(id)) return;
        const load = async () => {
            try {
                const product = await getProductById(id);
                setForm(product);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "خطا در دریافت محصول");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleSave = async () => {
        if (!id || Array.isArray(id)) return;
        try {
            setSaving(true);
            await updateProduct(id, {
                productType: form.productType,  // 👈 must be included
                name: form.name,
                price: form.price,
                stock: form.stock,
                size: form.size,
                color: form.color,
            });
            setSuccess(true);
            router.push("/admin/products");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "خطا در ویرایش محصول");
        } finally {
            setSaving(false);
        }
    };

    return (
        <RoleGuard roles={["Admin"]}>
            <DashboardLayout>
                <Typography variant="h5" gutterBottom>
                    ویرایش محصول
                </Typography>

                {loading ? (
                    <Typography>در حال بارگذاری...</Typography>
                ) : (
                    <Paper sx={{ p: 2, maxWidth: 600 }}>
                        <Box sx={{ display: "grid", gap: 2 }}>
                            <TextField
                                label="نام"
                                value={form.name || ""}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />

                            <TextField
                                label="قیمت"
                                type="number"
                                value={form.price ?? ""}
                                onChange={(e) =>
                                    setForm({ ...form, price: Number(e.target.value) })
                                }
                            />

                            <TextField
                                label="موجودی"
                                type="number"
                                value={form.stock ?? ""}
                                onChange={(e) =>
                                    setForm({ ...form, stock: Number(e.target.value) })
                                }
                            />

                            <TextField
                                label="سایز"
                                select
                                value={form.size || ""}
                                onChange={(e) => setForm({ ...form, size: e.target.value })}
                            >
                                <MenuItem value="small">small</MenuItem>
                                <MenuItem value="medium">medium</MenuItem>
                                <MenuItem value="large">large</MenuItem>
                            </TextField>

                            <TextField
                                label="رنگ"
                                select
                                value={form.color || ""}
                                onChange={(e) => setForm({ ...form, color: e.target.value })}
                            >
                                <MenuItem value="green">green</MenuItem>
                                <MenuItem value="red">red</MenuItem>
                                <MenuItem value="blue">blue</MenuItem>
                            </TextField>

                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    ذخیره تغییرات
                                </Button>
                                <Button variant="outlined" onClick={() => router.back()}>
                                    بازگشت
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                )}

                <Snackbar
                    open={!!error}
                    autoHideDuration={4000}
                    onClose={() => setError(null)}
                >
                    <Alert severity="error">{error}</Alert>
                </Snackbar>

                <Snackbar
                    open={success}
                    autoHideDuration={2500}
                    onClose={() => setSuccess(false)}
                >
                    <Alert severity="success">تغییرات ذخیره شد</Alert>
                </Snackbar>
            </DashboardLayout>
        </RoleGuard>
    );
}
