import { useEffect, useState } from "react";
import {
    Typography, Button, Table, TableBody, TableCell, TableHead, TableRow,
    TablePagination, TextField, Snackbar, Alert, MenuItem, FormControlLabel,
    Checkbox, Stack, Paper, Box, IconButton, Tooltip
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { useRouter } from "next/router";
import {
    searchSaleItems, createSaleItem, deleteSaleItem, updateSaleItem,
    type SaleItem, type SaleItemQuery
} from "@/services/saleItems";

const ITEM_TYPES = [
    { label: "شلوار",  value: "Pants"   },
    { label: "تیشرت",  value: "T-shirt" },
    { label: "پیراهن", value: "Shirt"   },
    { label: "شلوارک", value: "Shorts"  },
] as const;

const getTypeLabel = (v?: string) =>
    ITEM_TYPES.find(t => t.value === v)?.label ?? (v ?? "");

export default function SaleItemsListPage() {
    const router = useRouter();

    // table data
    const [items, setItems] = useState<SaleItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // filters
    const [filterName, setFilterName] = useState("");
    const [filterItemType, setFilterItemType] = useState<string>("");
    const [filterColor, setFilterColor] = useState<string>("");
    const [filterHasMedia, setFilterHasMedia] = useState<boolean | null>(null);
    const [sortBy, setSortBy] = useState<"name" | "createdAt" | "updatedAt">("updatedAt");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    // form (create/edit)
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formName, setFormName] = useState("");
    const [formItemType, setFormItemType] = useState("");

    // ui
    const [toast, setToast] = useState<{ open: boolean; msg: string; sev: "success" | "error" }>({
        open: false, msg: "", sev: "success"
    });
    const [saving, setSaving] = useState(false);

    const load = async () => {
        const q: SaleItemQuery = {
            name: filterName || undefined,
            itemType: filterItemType || undefined,
            color: filterColor || undefined,
            hasMedia: filterHasMedia === null ? undefined : filterHasMedia,
            sortBy, sortDir,
            page: page + 1,
            pageSize: rowsPerPage,
        };
        const res = await searchSaleItems(q);
        setItems(res.items);
        setTotal(res.totalCount);
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, rowsPerPage, sortBy, sortDir]);
    useEffect(() => { setPage(0); load(); /* eslint-disable-next-line */ }, [filterName, filterItemType, filterColor, filterHasMedia]);

    const resetForm = () => {
        setEditingId(null);
        setFormName("");
        setFormItemType("");
    };

    const handleSubmit = async () => {
        if (!formName.trim() || !formItemType.trim()) {
            setToast({ open: true, msg: "نام و نوع اجباری هستند", sev: "error" });
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                await updateSaleItem(editingId, { name: formName.trim(), itemType: formItemType.trim() });
                setToast({ open: true, msg: "آیتم به‌روزرسانی شد", sev: "success" });
            } else {
                await createSaleItem({ name: formName.trim(), itemType: formItemType.trim() });
                setToast({ open: true, msg: "آیتم جدید ثبت شد", sev: "success" });
            }
            resetForm();
            await load();
        } catch (e: any) {
            setToast({
                open: true,
                msg: e?.response?.data ?? e?.message ?? "خطا در ذخیره‌سازی",
                sev: "error",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (it: SaleItem) => {
        setEditingId(it.id);
        setFormName(it.name);
        setFormItemType(it.itemType);
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("حذف این آیتم؟")) return;
        await deleteSaleItem(id);
        setToast({ open: true, msg: "آیتم حذف شد", sev: "success" });
        load();
    };

    return (
        <RoleGuard roles={["Admin","Manager"]}>
            <DashboardLayout>
                <Typography variant="h5" gutterBottom>مدیریت آیتم‌های فروش</Typography>

                {/* Create/Edit form (responsive) */}
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        {editingId ? "ویرایش آیتم" : "افزودن آیتم جدید"}
                    </Typography>

                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        useFlexGap
                        sx={{ flexWrap: "wrap" }}
                    >
                        <TextField
                            label="نام"
                            size="small"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            fullWidth
                            sx={{ width: { xs: "100%", sm: 300 } }}
                        />

                        <TextField
                            label="نوع (ItemType)"
                            size="small"
                            select
                            value={formItemType}
                            onChange={(e) => setFormItemType(e.target.value)}
                            fullWidth
                            sx={{ width: { xs: "100%", sm: 300 } }}
                            SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 320 } } } }}
                        >
                            {ITEM_TYPES.map((t) => (
                                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                            ))}
                        </TextField>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={saving || !formName.trim() || !formItemType.trim()}
                            >
                                {editingId ? "ذخیره تغییرات" : "افزودن"}
                            </Button>
                            {editingId && (
                                <Button variant="text" color="inherit" onClick={resetForm}>
                                    انصراف
                                </Button>
                            )}
                        </Stack>
                    </Stack>
                </Paper>

                {/* Filters (responsive) */}
                <Stack
                    direction={{ xs: "column", lg: "row" }}
                    spacing={2}
                    useFlexGap
                    sx={{ mb: 2, flexWrap: "wrap" }}
                >
                    <TextField
                        size="small"
                        label="جستجو (نام)"
                        value={filterName}
                        onChange={e => setFilterName(e.target.value)}
                        fullWidth
                        sx={{ width: { xs: "100%", sm: 260 } }}
                    />

                    <TextField
                        size="small"
                        label="نوع"
                        select
                        value={filterItemType}
                        onChange={e => setFilterItemType(e.target.value)}
                        fullWidth
                        sx={{ width: { xs: "100%", sm: 260 } }}
                        SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 320 } } } }}
                    >
                        <MenuItem value="">همه</MenuItem>
                        {ITEM_TYPES.map((t) => (
                            <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        size="small"
                        label="رنگ"
                        value={filterColor}
                        onChange={e => setFilterColor(e.target.value)}
                        fullWidth
                        sx={{ width: { xs: "100%", sm: 200 } }}
                    />

                    <TextField
                        size="small"
                        select
                        label="مرتب‌سازی"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        fullWidth
                        sx={{ width: { xs: "100%", sm: 200 } }}
                    >
                        <MenuItem value="updatedAt">تاریخ ویرایش</MenuItem>
                        <MenuItem value="createdAt">تاریخ ایجاد</MenuItem>
                        <MenuItem value="name">نام</MenuItem>
                    </TextField>

                    <TextField
                        size="small"
                        select
                        label="جهت"
                        value={sortDir}
                        onChange={e => setSortDir(e.target.value as any)}
                        fullWidth
                        sx={{ width: { xs: "100%", sm: 160 } }}
                    >
                        <MenuItem value="desc">نزولی</MenuItem>
                        <MenuItem value="asc">صعودی</MenuItem>
                    </TextField>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={filterHasMedia === true}
                                indeterminate={filterHasMedia === null}
                                onChange={() => setFilterHasMedia(filterHasMedia === true ? null : true)}
                            />
                        }
                        label="دارای مدیا"
                        sx={{ ml: { xs: 0, lg: 1 } }}
                    />
                </Stack>

                {/* Table */}
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>شناسه</TableCell>
                            <TableCell>نام</TableCell>
                            <TableCell>نوع</TableCell>
                            <TableCell align="right">اعمال</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map(it => (
                            <TableRow key={it.id} hover>
                                <TableCell sx={{ whiteSpace: "nowrap" }}>
                                    <Box component="code" sx={{ fontFamily: "monospace", fontSize: "0.85rem", mr: 1 }}>
                                        {it.id}
                                    </Box>
                                    <Tooltip title="کپی شناسه">
                                        <IconButton
                                            size="small"
                                            onClick={() => navigator.clipboard.writeText(it.id)}
                                            aria-label="copy id"
                                        >
                                            <ContentCopyIcon fontSize="inherit" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>

                                <TableCell
                                    onClick={() => router.push(`/admin/sale-items/${it.id}`)}
                                    style={{ cursor: "pointer", fontWeight: 600 }}
                                    title="مشاهده جزئیات"
                                >
                                    {it.name}
                                </TableCell>

                                <TableCell>
                                    <Stack direction="row" spacing={1} alignItems="center" useFlexGap sx={{ flexWrap: "wrap" }}>
                                        <span>{getTypeLabel(it.itemType)}</span>
                                        <Box
                                            component="code"
                                            sx={{
                                                fontFamily: "monospace",
                                                fontSize: "0.75rem",
                                                bgcolor: "action.hover",
                                                px: 0.75,
                                                py: 0.25,
                                                borderRadius: 1,
                                            }}
                                            title="مقدار ذخیره‌شده در دیتابیس"
                                        >
                                            {it.itemType}
                                        </Box>
                                    </Stack>
                                </TableCell>

                                <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Button size="small" onClick={() => router.push(`/admin/sale-items/${it.id}`)}>جزئیات</Button>
                                        <Button size="small" onClick={() => handleEdit(it)}>ویرایش</Button>
                                        <Button size="small" color="error" onClick={() => handleDelete(it.id)}>حذف</Button>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />

                <Snackbar open={toast.open} onClose={() => setToast({ ...toast, open: false })} autoHideDuration={3000}>
                    <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.sev}>{toast.msg}</Alert>
                </Snackbar>
            </DashboardLayout>
        </RoleGuard>
    );
}
