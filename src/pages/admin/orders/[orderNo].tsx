import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { adminGetOrder, adminMarkSent } from "@/services/orders";
import type { OrderDto } from "@/types/orders";
import {
    Typography, Box, Paper, List, ListItem, ListItemText, Divider,
    TextField, Button, Snackbar, Alert
} from "@mui/material";

export default function OrderDetailsPage() {
    const router = useRouter();
    const orderNo = typeof router.query.orderNo === "string" ? router.query.orderNo : "";
    const [o, setO] = useState<OrderDto | null>(null);
    const [tracking, setTracking] = useState("");
    const [toast, setToast] = useState<{open:boolean; msg:string; sev:"success"|"error"|"info"}>({open:false, msg:"", sev:"info"});

    async function load() {
        try {
            if (!orderNo) return;
            const data = await adminGetOrder(orderNo);
            setO(data);
            setTracking(data.trackingNumber ?? "");
        } catch (e:any) {
            setToast({ open: true, msg: e?.response?.data ?? e?.message ?? "خطا در دریافت سفارش", sev: "error" });
        }
    }

    useEffect(() => { void load(); /* eslint-disable-next-line */ }, [orderNo]);

    async function markSent() {
        try {
            if (!o) return;
            await adminMarkSent(o.orderNo, tracking.trim() || undefined);
            setToast({ open: true, msg: "به عنوان ارسال‌شده ثبت شد", sev: "success" });
            await load();
        } catch (e:any) {
            setToast({ open: true, msg: e?.response?.data ?? e?.message ?? "خطا در ثبت وضعیت ارسال", sev: "error" });
        }
    }

    return (
        <RoleGuard roles={['Admin', 'Manager']}>
            <DashboardLayout>
                {!o ? (
                    <Typography>در حال بارگذاری...</Typography>
                ) : (
                    <Box sx={{ display: "grid", gap: 2 }}>
                        <Typography variant="h6">سفارش {o.orderNo}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            وضعیت: {o.status} | ارسال با پست: {o.isSentByPost ? "بله" : "خیر"} {o.sentAt ? `• زمان ثبت ارسال: ${new Date(o.sentAt).toLocaleString()}` : ""}
                            {o.trackingNumber ? ` • کدرهگیری: ${o.trackingNumber}` : ""}
                        </Typography>

                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>اقلام</Typography>
                            <List dense>
                                {o.lines.map((l, idx) => (
                                    <div key={idx}>
                                        <ListItem>
                                            <ListItemText
                                                primary={`${l.name} × ${l.quantity}`}
                                                secondary={`واحد: ${l.unitPrice.toLocaleString("fa-IR")} • جمع: ${(l.unitPrice * l.quantity).toLocaleString("fa-IR")}`}
                                            />
                                        </ListItem>
                                        <Divider />
                                    </div>
                                ))}
                            </List>
                            <Box sx={{ mt: 1 }}>
                                <div>جمع جزء: {o.subtotal.toLocaleString("fa-IR")}</div>
                                <div>هزینه ارسال: {o.shipping.toLocaleString("fa-IR")}</div>
                                <div><b>مبلغ نهایی: {o.total.toLocaleString("fa-IR")}</b></div>
                            </Box>
                        </Paper>

                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>مشخصات گیرنده</Typography>
                            <div>{o.shippingAddress.receiverName} {o.shippingAddress.receiverFamily}</div>
                            <div>کد ملی: {o.shippingAddress.nationalId}</div>
                            <div>موبایل: {o.shippingAddress.mobile}</div>
                            <div>ایمیل: {o.shippingAddress.email}</div>
                            <div>{o.shippingAddress.province}، {o.shippingAddress.city}، {o.shippingAddress.address}</div>
                            <div>کدپستی: {o.shippingAddress.postalCode}</div>
                            {o.messageToShop && (<div style={{ marginTop: 8 }}>پیام مشتری: {o.messageToShop}</div>)}
                        </Paper>

                        {!o.isSentByPost && (
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>ثبت ارسال پستی</Typography>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <TextField
                                        size="small"
                                        label="کدرهگیری (اختیاری)"
                                        value={tracking}
                                        onChange={(e) => setTracking(e.target.value)}
                                    />
                                    <Button variant="contained" onClick={markSent}>ثبت ارسال</Button>
                                </Box>
                            </Paper>
                        )}

                        <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
                            <Alert severity={toast.sev} onClose={() => setToast({ ...toast, open: false })}>{toast.msg}</Alert>
                        </Snackbar>
                    </Box>
                )}
            </DashboardLayout>
        </RoleGuard>
    );
}
