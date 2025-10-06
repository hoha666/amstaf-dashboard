// src/pages/admin/sale-items/[id]/index.tsx
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {
    Typography, Button, Table, TableBody, TableCell, TableHead, TableRow,
    TablePagination, TextField, MenuItem, Stack, Dialog, DialogTitle, DialogContent,
    DialogActions, Checkbox, ListItemText, Chip, Box, Switch, FormControlLabel
} from "@mui/material";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import {
    getSaleItem, listSaleEntities, addSaleEntity, updateSaleEntity, removeSaleEntity,
    type SaleEntity, type SaleEntityQuery, type SaleItem
} from "@/services/saleItems";

// --- Dynamic size options based on SaleItem.itemType ---
const PANTS_SIZES_EU = [34, 36, 38, 40, 42, 44, 46, 48].map(String);
const TOP_SIZES_EU = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

// --- Color options (~10) ---
const COLOR_OPTIONS = [
    {label: "مشکی", value: "Black"},
    {label: "سفید", value: "White"},
    {label: "سرمه‌ای", value: "Navy"},
    {label: "آبی", value: "Blue"},
    {label: "قرمز", value: "Red"},
    {label: "سبز", value: "Green"},
    {label: "زیتونی", value: "Olive"},
    {label: "بژ", value: "Beige"},
    {label: "خاکستری", value: "Gray"},
    {label: "قهوه‌ای", value: "Brown"},
    {label: "عاجی", value: "Ivory"},
    {label: "کرمی", value: "Cream"},
    {label: "وانيلي", value: "Vanilla"},
    {label: "شامپاینی", value: "Champagne"},
] as const;

const getColorLabel = (v?: string) =>
    COLOR_OPTIONS.find(c => c.value === v)?.label ?? (v ?? "");

export default function SaleItemDetailsPage() {
    const router = useRouter();
    const {id} = router.query as { id: string };
    const [item, setItem] = useState<SaleItem | null>(null);

    // entities pagination/filters
    const [entities, setEntities] = useState<SaleEntity[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [hasMedia, setHasMedia] = useState<boolean | null>(null);
    const [color, setColor] = useState("");
    const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "price" | "stock" | "size">("createdAt");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [published, setPublished] = useState<boolean | null>(null); // ✅ filter

    // create/edit dialog
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<SaleEntity | null>(null);

    // keep fields as STRINGS (price/stock) + colors as string[]
    const [form, setForm] = useState<{
        price: string;
        stock: string;
        size: string;
        colors: string[];
        isPublished: boolean
    }>({
        price: "", stock: "", size: "", colors: [], isPublished: false
    });

    // live validation
    const priceInvalid = form.price.trim() !== "" && Number.isNaN(Number(form.price));
    const stockInvalid = form.stock.trim() !== "" && !/^\d+$/.test(form.stock.trim());

    const loadItem = async () => {
        if (!id) return;
        setItem(await getSaleItem(id));
    };
    const loadEntities = async () => {
        if (!id) return;
        const q: SaleEntityQuery = {
            hasMedia: hasMedia === null ? undefined : hasMedia,
            color: color || undefined,
            sortBy, sortDir,
            page: page + 1,
            pageSize: rowsPerPage,
            published: published === null ? undefined : published
        };
        const res = await listSaleEntities(id, q);
        setEntities(res.items);
        setTotal(res.totalCount);
    };

    useEffect(() => {
        loadItem(); /* eslint-disable-next-line */
    }, [id]);
    useEffect(() => {
        loadEntities(); /* eslint-disable-next-line */
    }, [id, page, rowsPerPage, sortBy, sortDir]);
    // 🔁 also reload when these filters change
    useEffect(() => {
        setPage(0);
        loadEntities(); /* eslint-disable-next-line */
    }, [hasMedia, color, published]);

    const openCreate = () => {
        setEditing(null);
        setForm({price: "", stock: "", size: "", colors: [], isPublished: false});
        setOpen(true);
    };

    const openEdit = (e: SaleEntity) => {
        setEditing(e);
        setForm({
            price: e.price != null ? String(e.price) : "",
            stock: e.stock != null ? String(e.stock) : "",
            size: e.size ?? "",
            colors: e.colors ?? [],
            isPublished: !!e.isPublished,
        });
        setOpen(true);
    };

    const save = async () => {
        if (!id) return;

        const priceNum = form.price.trim() === "" ? NaN : Number(form.price);
        const stockNum = form.stock.trim() === "" ? NaN : Number.parseInt(form.stock, 10);
        if (Number.isNaN(priceNum) || Number.isNaN(stockNum)) {
            alert("قیمت و موجودی باید عدد باشند.");
            return;
        }

        const payload = {
            price: priceNum,
            stock: stockNum,
            size: form.size.trim(),
            colors: form.colors, // already string[]
            isPublished: form.isPublished,
        };

        if (editing?.id) {
            await updateSaleEntity(id, editing.id, payload);
        } else {
            await addSaleEntity(id, payload);
        }
        setOpen(false);
        await loadEntities();
    };

    const remove = async (entityId: string) => {
        if (!id) return;
        if (!confirm("حذف این مورد؟")) return;
        await removeSaleEntity(id, entityId);
        await loadEntities();
    };

    // infer size mode from parent item type
    const isPantsOrShorts = item?.itemType === "Pants" || item?.itemType === "Shorts";
    const isShirtOrTee = item?.itemType === "Shirt" || item?.itemType === "T-shirt";

    return (
        <RoleGuard roles={["Admin", "Manager"]}>
            <DashboardLayout>
                <Button onClick={() => router.push(`/admin/sale-items`)}>← بازگشت</Button>
                <Typography variant="h5" gutterBottom>
                    {item?.name} <Typography component="span"
                                             sx={{color: "text.secondary"}}>({item?.itemType})</Typography>
                </Typography>

                {/* Filters for entities */}
                <Stack direction="row" spacing={2} sx={{mb: 2, flexWrap: "wrap"}}>
                    <TextField size="small" label="رنگ" value={color} onChange={e => setColor(e.target.value)}/>
                    <TextField size="small" select label="مرتب‌سازی" value={sortBy} onChange={e=>setSortBy(e.target.value as any)}>
                        <MenuItem value="createdAt">ترتیب افزودن (قدیمی→جدید)</MenuItem>
                        <MenuItem value="updatedAt">تاریخ ویرایش</MenuItem>
                        <MenuItem value="price">قیمت</MenuItem>
                        <MenuItem value="stock">موجودی</MenuItem>
                        <MenuItem value="size">سایز</MenuItem>
                    </TextField>
                    <TextField size="small" select label="جهت" value={sortDir} onChange={e=>setSortDir(e.target.value as any)}>
                        <MenuItem value="asc">صعودی</MenuItem>
                        <MenuItem value="desc">نزولی</MenuItem>
                    </TextField>
                    <TextField
                        size="small"
                        select
                        label="انتشار"
                        value={published === null ? "any" : (published ? "yes" : "no")}
                        onChange={(e) => {
                            const v = e.target.value;
                            setPublished(v === "any" ? null : v === "yes");
                        }}
                    >
                        <MenuItem value="any">همه</MenuItem>
                        <MenuItem value="yes">منتشر شده</MenuItem>
                        <MenuItem value="no">پیش‌نویس</MenuItem>
                    </TextField>
                    <TextField
                        size="small"
                        select
                        label="دارای مدیا؟"
                        value={hasMedia === null ? "any" : hasMedia ? "yes" : "no"}
                        onChange={e => {
                            const v = e.target.value;
                            setHasMedia(v === "any" ? null : v === "yes");
                        }}
                    >
                        <MenuItem value="any">همه</MenuItem>
                        <MenuItem value="yes">بله</MenuItem>
                        <MenuItem value="no">خیر</MenuItem>
                    </TextField>

                    <Button variant="contained" onClick={openCreate}>+ مورد جدید</Button>
                </Stack>

                {/* Entities table */}
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>قیمت</TableCell>
                            <TableCell>موجودی</TableCell>
                            <TableCell>سایز</TableCell>
                            <TableCell>رنگ‌ها</TableCell>
                            <TableCell>وضعیت</TableCell>
                            <TableCell>مدیا</TableCell>
                            <TableCell align="right">اعمال</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {entities.map(e => (
                            <TableRow key={e.id} hover>
                                <TableCell>{e.price}</TableCell>
                                <TableCell>{e.stock}</TableCell>
                                <TableCell>{e.size}</TableCell>
                                <TableCell>{(e.colors || []).map(getColorLabel).join(", ")}</TableCell>
                                <TableCell>
                                    {e.isPublished ? "منتشر شده" : "پیش‌نویس"}
                                </TableCell>
                                <TableCell>{e.media?.length ?? 0}</TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        {/* ✅ Quick toggle publish */}
                                        <Button
                                            size="small"
                                            variant={e.isPublished ? "outlined" : "contained"}
                                            onClick={async () => {
                                                await updateSaleEntity(id, e.id!, {
                                                    price: e.price,
                                                    stock: e.stock,
                                                    size: e.size,
                                                    colors: e.colors ?? [],
                                                    isPublished: !e.isPublished,
                                                });
                                                await loadEntities();
                                            }}
                                        >
                                            {e.isPublished ? "لغو انتشار" : "انتشار"}
                                        </Button>

                                        <Button size="small" onClick={() => openEdit(e)}>ویرایش</Button>
                                        <Button size="small" color="error" onClick={() => remove(e.id!)}>حذف</Button>
                                        <Button size="small"
                                                onClick={() => router.push(`/admin/sale-items/${id}/entities/${e.id}/media`)}>مدیریت
                                            مدیا</Button>
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
                    onRowsPerPageChange={e => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />

                {/* Create/Edit dialog */}
                <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="lg">
                    <DialogTitle>{editing ? "ویرایش مورد" : "افزودن مورد جدید"}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{mt: 1}}>
                            <TextField
                                label="قیمت"
                                inputMode="decimal"
                                value={form.price}
                                onChange={e => setForm({...form, price: e.target.value})}
                                error={priceInvalid}
                                helperText={priceInvalid ? "عدد معتبر وارد کنید" : undefined}
                            />
                            <TextField
                                label="موجودی"
                                inputMode="numeric"
                                value={form.stock}
                                onChange={e => setForm({...form, stock: e.target.value})}
                                error={stockInvalid}
                                helperText={stockInvalid ? "فقط اعداد صحیح" : undefined}
                            />

                            {/* ✅ Published switch */}
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={form.isPublished}
                                        onChange={(e) => setForm({...form, isPublished: e.target.checked})}
                                    />
                                }
                                label="منتشر شود"
                            />

                            {/* Dynamic SIZE field */}
                            {isPantsOrShorts ? (
                                <TextField
                                    label="سایز (EU)"
                                    select
                                    value={form.size}
                                    onChange={e => setForm({...form, size: e.target.value})}
                                >
                                    {PANTS_SIZES_EU.map(s => (
                                        <MenuItem key={s} value={s}>{s}</MenuItem>
                                    ))}
                                </TextField>
                            ) : isShirtOrTee ? (
                                <TextField
                                    label="سایز"
                                    select
                                    value={form.size}
                                    onChange={e => setForm({...form, size: e.target.value})}
                                >
                                    {TOP_SIZES_EU.map(s => (
                                        <MenuItem key={s} value={s}>{s}</MenuItem>
                                    ))}
                                </TextField>
                            ) : (
                                <TextField
                                    label="سایز"
                                    value={form.size}
                                    onChange={e => setForm({...form, size: e.target.value})}
                                />
                            )}

                            {/* Colors multi-select */}
                            <TextField
                                label="رنگ‌های بکار رفته روی یک محصول(اگر محصول در رنگ های مختلف تولید می شود باید جداگانه اضافه شود)"
                                select
                                value={form.colors}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setForm({
                                        ...form,
                                        colors: typeof val === "string" ? val.split(",") : (val as string[]),
                                    });
                                }}
                                SelectProps={{
                                    multiple: true,
                                    renderValue: (selected) => (
                                        <Box sx={{display: "flex", flexWrap: "wrap", gap: 0.5}}>
                                            {(selected as string[]).map((v) => (
                                                <Chip key={v} label={getColorLabel(v)}/>
                                            ))}
                                        </Box>
                                    ),
                                }}
                            >
                                {COLOR_OPTIONS.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        <Checkbox checked={form.colors.indexOf(opt.value) > -1}/>
                                        <ListItemText primary={opt.label}/>
                                    </MenuItem>
                                ))}
                            </TextField>

                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>انصراف</Button>
                        <Button
                            onClick={save}
                            variant="contained"
                            disabled={
                                form.price.trim() === "" ||
                                form.stock.trim() === "" ||
                                priceInvalid ||
                                stockInvalid
                            }
                        >
                            ذخیره
                        </Button>
                    </DialogActions>
                </Dialog>
            </DashboardLayout>
        </RoleGuard>
    );
}
