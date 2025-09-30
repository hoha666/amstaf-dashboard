import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TablePagination,
    TextField,
    Button,
    Snackbar,
    Alert,
    Box,
    CircularProgress,
} from "@mui/material";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { adminSearchOrders } from "@/services/orders";
import type { OrderDto, PagedResult } from "@/types/orders";

export default function UnsentOrdersPage() {
    const [q, setQ] = useState("");
    const [page, setPage] = useState(0); // MUI is zero-based; backend is 1-based
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [data, setData] = useState<PagedResult<OrderDto>>();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ open: boolean; msg: string; sev: "success" | "error" | "info" }>({
        open: false,
        msg: "",
        sev: "info",
    });

    // StrictMode runs effects twice in dev — guard
    const didInit = useRef(false);

    const load = useCallback(
        async (signal?: AbortSignal) => {
            setLoading(true);
            try {
                const res = await adminSearchOrders(
                    {
                        isSentByPost: false,
                        q: q.trim() || undefined,
                        page: page + 1,
                        pageSize: rowsPerPage,
                    },
                    signal
                );
                setData(res);
            } catch (e: any) {
                if (e?.name === "CanceledError" || e?.name === "AbortError") return;
                // Log for diagnosis
                // eslint-disable-next-line no-console
                console.error("orders/unsent load error", {
                    status: e?.response?.status,
                    data: e?.response?.data,
                    message: e?.message,
                });
                setToast({
                    open: true,
                    msg: e?.response?.data ?? e?.message ?? "خطا در دریافت سفارش‌ها",
                    sev: "error",
                });
            } finally {
                setLoading(false);
            }
        },
        [q, page, rowsPerPage]
    );

    useEffect(() => {
        const ac = new AbortController();
        if (!didInit.current) {
            didInit.current = true;
            void load(ac.signal);
        } else {
            void load(ac.signal);
        }
        return () => ac.abort();
    }, [load]);

    return (
        <RoleGuard roles={["Admin", "Manager"]}>
            <DashboardLayout>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Typography variant="h5">سفارش‌های ارسال‌نشده</Typography>
                    {loading && <CircularProgress size={18} />}
                </Box>

                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <TextField
                        size="small"
                        placeholder="جستجو: شماره سفارش / نام / کدملی / ایمیل / موبایل"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        sx={{ width: 420 }}
                    />
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setPage(0);
                            const ac = new AbortController();
                            void load(ac.signal);
                        }}
                    >
                        جستجو
                    </Button>
                </Box>

                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>شماره سفارش</TableCell>
                            <TableCell>مشتری</TableCell>
                            <TableCell>موبایل</TableCell>
                            <TableCell>مبلغ</TableCell>
                            <TableCell>تاریخ</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.items.map((o) => (
                            <TableRow key={o.orderNo} hover>
                                <TableCell>{o.orderNo}</TableCell>
                                <TableCell>
                                    {o.shippingAddress.receiverName} {o.shippingAddress.receiverFamily}
                                </TableCell>
                                <TableCell>{o.shippingAddress.mobile}</TableCell>
                                <TableCell>{o.total.toLocaleString("fa-IR")}</TableCell>
                                <TableCell>{new Date(o.createdAt).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Link href={`/admin/orders/${encodeURIComponent(o.orderNo)}`}>جزئیات</Link>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!data || data.items.length === 0) && !loading && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                                    رکوردی یافت نشد
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <TablePagination
                    component="div"
                    count={data?.total ?? 0}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[10, 20, 50]}
                    labelRowsPerPage="تعداد در صفحه"
                />

                <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
                    <Alert severity={toast.sev} onClose={() => setToast({ ...toast, open: false })}>
                        {toast.msg}
                    </Alert>
                </Snackbar>
            </DashboardLayout>
        </RoleGuard>
    );
}