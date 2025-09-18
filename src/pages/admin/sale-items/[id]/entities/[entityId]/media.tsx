import { useRouter } from "next/router";
import { useEffect, useState, type ChangeEvent } from "react";
import {
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
    Grid, // ✅ MUI v7 Grid v2 (no `item`, use `size`)
} from "@mui/material";

import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import {
    getSaleItem,
    uploadSaleEntityMedia,
    deleteSaleEntityMedia,
    type SaleItem,
} from "@/services/saleItems";

export default function SaleEntityMediaPage() {
    const router = useRouter();
    const { id, entityId } = router.query as { id: string; entityId: string };
    const [item, setItem] = useState<SaleItem | null>(null);

    const load = async () => {
        if (!id) return;
        const it = await getSaleItem(id);
        setItem(it);
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const entity = item?.saleEntities?.find((e) => e.id === entityId);

    const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!id || !entityId) return;
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadSaleEntityMedia(id, entityId, file);
        await load();
    };

    const onDelete = async (url: string) => {
        if (!id || !entityId) return;
        if (!confirm("حذف فایل؟")) return;
        await deleteSaleEntityMedia(id, entityId, url);
        await load();
    };

    return (
        <RoleGuard roles={["Admin", "Manager"]}>
            <DashboardLayout>
                <Button onClick={() => router.push(`/admin/sale-items/${id}`)}>
                    ← بازگشت
                </Button>
                <Typography variant="h5" gutterBottom>
                    مدیای {item?.name} / Entity: {entityId}
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <Button variant="contained" component="label">
                        آپلود فایل
                        <input type="file" hidden onChange={onUpload} />
                    </Button>
                </Box>

                <Grid container spacing={2}>
                    {(entity?.media ?? []).map((m) => (
                        <Grid key={m.url} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <Card>
                                <CardContent>
                                    {m.mimeType.startsWith("image/") ? (
                                        // static export + unoptimized images: use <img>
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={m.url}
                                            alt=""
                                            style={{ width: "100%", borderRadius: 8 }}
                                        />
                                    ) : m.mimeType.startsWith("video/") ? (
                                        <video
                                            src={m.url}
                                            controls
                                            style={{ width: "100%", borderRadius: 8 }}
                                        />
                                    ) : (
                                        <a href={m.url} target="_blank" rel="noreferrer">
                                            دانلود فایل
                                        </a>
                                    )}
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        {m.mimeType} · {Math.round((m.size || 0) / 1024)} KB
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button color="error" onClick={() => onDelete(m.url)}>
                                        حذف
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </DashboardLayout>
        </RoleGuard>
    );
}
