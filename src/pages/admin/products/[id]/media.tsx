import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
    Typography,
    Button,
    Box,
    Snackbar,
    Alert,
    Paper,
    IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import {
    getProductById,
    addMediaToProduct,
    deleteMediaFromProduct,
    Product,
} from "@/services/products";

export default function ProductMediaPage() {
    const router = useRouter();
    const { id } = router.query;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openError, setOpenError] = useState(false);

    const errorToMessage = (err: unknown): string =>
        err instanceof Error ? err.message : "خطای ناشناخته رخ داد";

    // Load product with media
    const load = async () => {
        if (!id || Array.isArray(id)) return;
        try {
            setLoading(true);
            const data = await getProductById(id); // <- Product service returns product + media
            setProduct(data);
        } catch (err: unknown) {
            setError(errorToMessage(err));
            setOpenError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) void load();
    }, [id]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!id || Array.isArray(id)) return;
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            await addMediaToProduct(id, file); // one image per call
            await load(); // refresh product
            e.target.value = ""; // reset input
        } catch (err: unknown) {
            setError(errorToMessage(err));
            setOpenError(true);
        }
    };

    const handleDelete = async (url: string) => {
        if (!id || Array.isArray(id)) return;
        try {
            await deleteMediaFromProduct(id, url);
            await load(); // refresh
        } catch (err: unknown) {
            setError(errorToMessage(err));
            setOpenError(true);
        }
    };

    return (
        <RoleGuard roles={["Admin"]}>
            <DashboardLayout>
                {loading ? (
                    <Typography>در حال بارگذاری...</Typography>
                ) : !product ? (
                    <Typography>محصول پیدا نشد</Typography>
                ) : (
                    <Box>
                        {/* Header row with product name + upload */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 3,
                            }}
                        >
                            <Typography variant="h5">{product.name}</Typography>
                            <Button variant="contained" component="label">
                                بارگذاری تصویر جدید
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                            </Button>
                        </Box>

                        {/* Media gallery */}
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                            {product.media && product.media.length > 0 ? (
                                product.media.map((m, idx) => (
                                    <Paper
                                        key={idx}
                                        sx={{
                                            p: 1,
                                            width: 160,
                                            textAlign: "center",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                        }}
                                    >
                                        <img
                                            src={m.url}
                                            alt="media"
                                            style={{
                                                width: "100%",
                                                height: 120,
                                                objectFit: "cover",
                                                borderRadius: 6,
                                            }}
                                        />
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(m.url)}
                                            sx={{ mt: 1 }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Paper>
                                ))
                            ) : (
                                <Typography>هیچ تصویری بارگذاری نشده است</Typography>
                            )}
                        </Box>
                    </Box>
                )}

                <Snackbar
                    open={openError}
                    autoHideDuration={4000}
                    onClose={() => setOpenError(false)}
                >
                    <Alert severity="error" onClose={() => setOpenError(false)}>
                        {error}
                    </Alert>
                </Snackbar>
            </DashboardLayout>
        </RoleGuard>
    );
}
