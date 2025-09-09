// src/pages/admin/products/index.tsx
import { useEffect, useMemo, useState } from "react";
import {
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Box,
    Snackbar,
    Alert,
} from "@mui/material";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import {duplicateProduct, deleteProduct, getProducts, Product} from "@/services/products";
import { useRouter } from "next/router";

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openError, setOpenError] = useState(false);

    // table state
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Load products
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await getProducts();
                setProducts(data);
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : "خطا در دریافت محصولات";
                setError(message);
                setOpenError(true);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Filter by name
    const filtered = useMemo(() => {
        const s = search.trim().toLowerCase();
        return s ? products.filter((p) => p.name.toLowerCase().includes(s)) : products;
    }, [products, search]);

    // Paginate
    const paginated = useMemo(() => {
        const start = page * rowsPerPage;
        return filtered.slice(start, start + rowsPerPage);
    }, [filtered, page, rowsPerPage]);

    // Reset to first page on search
    useEffect(() => setPage(0), [search]);

    return (
        <RoleGuard roles={["Admin", "Manager"]}>
            <DashboardLayout>
                <Typography variant="h5" gutterBottom>
                    مدیریت محصولات
                </Typography>

                <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                    <TextField
                        placeholder="جستجو بر اساس نام"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="small"
                    />
                    <Button variant="contained" onClick={() => router.push("/admin/products/new")}>
                        افزودن محصول جدید
                    </Button>
                </Box>

                {loading ? (
                    <Typography>در حال بارگذاری...</Typography>
                ) : (
                    <>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>نام</TableCell>
                                    <TableCell>قیمت</TableCell>
                                    <TableCell>موجودی</TableCell>
                                    <TableCell>سایز</TableCell>
                                    <TableCell>رنگ</TableCell>
                                    <TableCell>اعمال</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginated.map((p) => (
                                    <TableRow key={p.id} hover>
                                        <TableCell>{p.name}</TableCell>
                                        <TableCell>{p.price}</TableCell>
                                        <TableCell>{p.stock}</TableCell>
                                        <TableCell>{p.size}</TableCell>
                                        <TableCell>{p.color}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => router.push(`/admin/products/${p.id}/media`)}
                                            >
                                                مدیریت تصاویر
                                            </Button>

                                            <Button
                                                size="small"
                                                sx={{ ml: 1 }}
                                                variant="outlined"
                                                onClick={() => router.push(`/admin/products/${p.id}/edit`)}
                                            >
                                                ویرایش
                                            </Button>

                                            <Button
                                                size="small"
                                                sx={{ ml: 1 }}
                                                variant="outlined"
                                                onClick={async () => {
                                                    try {
                                                        const clone = await duplicateProduct(p.id);
                                                        // Add the new clone to UI (prepend to keep it visible)
                                                        setProducts((prev) => [clone, ...prev]);
                                                    } catch {
                                                        alert("خطا در کپی کردن محصول");
                                                    }
                                                }}
                                            >
                                                کپی
                                            </Button>

                                            <Button
                                                size="small"
                                                color="error"
                                                sx={{ ml: 1 }}
                                                onClick={async () => {
                                                    if (confirm(`آیا مطمئن هستید که می‌خواهید "${p.name}" را حذف کنید؟`)) {
                                                        try {
                                                            await deleteProduct(p.id);
                                                            setProducts(products.filter((prod) => prod.id !== p.id));
                                                        } catch (err) {
                                                            alert("خطا در حذف محصول");
                                                        }
                                                    }
                                                }}
                                            >
                                                حذف
                                            </Button>
                                        </TableCell>

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <TablePagination
                            component="div"
                            count={filtered.length}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            rowsPerPageOptions={[5, 10, 15]}
                        />
                    </>
                )}

                <Snackbar open={openError} autoHideDuration={4000} onClose={() => setOpenError(false)}>
                    <Alert severity="error" onClose={() => setOpenError(false)}>
                        {error}
                    </Alert>
                </Snackbar>
            </DashboardLayout>
        </RoleGuard>
    );
}
