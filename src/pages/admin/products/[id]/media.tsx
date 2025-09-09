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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const errorToMessage = (err: unknown): string =>
        err instanceof Error ? err.message : "خطای ناشناخته رخ داد";

    const load = async () => {
        if (!id || Array.isArray(id)) return;
        try {
            setLoading(true);
            const data = await getProductById(id as string);
            setProduct(data);
            if (data.media && data.media.length > 0) {
                setSelectedImage(data.media[0].url);
            }
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
            await addMediaToProduct(id as string, file);
            await load();
            e.target.value = "";
        } catch (err: unknown) {
            setError(errorToMessage(err));
            setOpenError(true);
        }
    };

    const handleDelete = async (url: string) => {
        if (!id || Array.isArray(id)) return;
        try {
            await deleteMediaFromProduct(id as string, url);
            await load();
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
                        {/* Header with back + title + upload */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 3,
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<ArrowBackIcon />}
                                    onClick={() => router.back()}
                                >
                                    بازگشت
                                </Button>
                                <Typography variant="h5">{product.name}</Typography>
                            </Box>
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

                        {/* Two-column layout */}
                        <Box sx={{ display: "flex", gap: 3 }}>
                            {/* Thumbnails */}
                            <Box
                                sx={{
                                    flex: 1,
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 2,
                                    alignContent: "flex-start",
                                }}
                            >
                                {product.media && product.media.length > 0 ? (
                                    product.media.map((m, idx) => (
                                        <Paper
                                            key={idx}
                                            sx={{
                                                p: 1,
                                                width: 120,
                                                textAlign: "center",
                                                cursor: "pointer",
                                                border:
                                                    selectedImage === m.url
                                                        ? "2px solid #1976d2"
                                                        : "1px solid #ddd",
                                            }}
                                            onClick={() => setSelectedImage(m.url)}
                                        >
                                            <img
                                                src={m.url}
                                                alt="media"
                                                style={{
                                                    width: "100%",
                                                    height: 80,
                                                    objectFit: "cover",
                                                    borderRadius: 6,
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(m.url);
                                                }}
                                                sx={{ mt: 1 }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Paper>
                                    ))
                                ) : (
                                    <Typography>هیچ تصویری بارگذاری نشده است</Typography>
                                )}
                            </Box>

                            {/* Preview */}
                            <Box
                                sx={{
                                    flex: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "1px solid #ddd",
                                    borderRadius: 2,
                                    minHeight: 300,
                                    p: 2,
                                }}
                            >
                                {selectedImage ? (
                                    <img
                                        src={selectedImage}
                                        alt="selected"
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "100%",
                                            objectFit: "contain",
                                        }}
                                    />
                                ) : (
                                    <Typography>تصویری برای پیش‌نمایش انتخاب نشده است</Typography>
                                )}
                            </Box>
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
