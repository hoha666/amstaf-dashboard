// src/pages/admin/sale-items/[id]/index.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
    Typography, Box, Button, Table, TableBody, TableCell, TableHead, TableRow,
    TablePagination, TextField, MenuItem, Stack, Dialog, DialogTitle, DialogContent,
    DialogActions
} from "@mui/material";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import {
    getSaleItem, listSaleEntities, addSaleEntity, updateSaleEntity, removeSaleEntity,
    type SaleEntity, type SaleEntityQuery, type SaleItem
} from "@/services/saleItems";

export default function SaleItemDetailsPage() {
    const router = useRouter();
    const { id } = router.query as { id: string };
    const [item, setItem] = useState<SaleItem | null>(null);

    // entities pagination/filters
    const [entities, setEntities] = useState<SaleEntity[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [hasMedia, setHasMedia] = useState<boolean | null>(null);
    const [color, setColor] = useState("");
    const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "price" | "stock" | "size">("updatedAt");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    // create/edit dialog
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<SaleEntity | null>(null);
    const [form, setForm] = useState<{price:number; stock:number; size:string; colors:string}>({price:0, stock:0, size:"", colors:""});

    const loadItem = async () => { if (!id) return; setItem(await getSaleItem(id)); };
    const loadEntities = async () => {
        if (!id) return;
        const q: SaleEntityQuery = {
            hasMedia: hasMedia === null ? undefined : hasMedia,
            color: color || undefined,
            sortBy, sortDir,
            page: page + 1,
            pageSize: rowsPerPage,
        };
        const res = await listSaleEntities(id, q);
        setEntities(res.items);
        setTotal(res.totalCount);
    };

    useEffect(()=>{ loadItem(); /* eslint-disable-next-line */}, [id]);
    useEffect(()=>{ loadEntities(); /* eslint-disable-next-line */}, [id, page, rowsPerPage, sortBy, sortDir]);
    useEffect(()=>{ setPage(0); loadEntities(); /* eslint-disable-next-line */}, [hasMedia, color]);

    const openCreate = () => { setEditing(null); setForm({price:0, stock:0, size:"", colors:""}); setOpen(true); };
    const openEdit = (e: SaleEntity) => {
        setEditing(e);
        setForm({price:e.price, stock:e.stock, size:e.size, colors: e.colors?.join(",") || ""});
        setOpen(true);
    };

    const save = async () => {
        if (!id) return;
        const payload = {
            price: Number(form.price)||0,
            stock: Number(form.stock)||0,
            size: form.size,
            colors: (form.colors || "").split(",").map(s=>s.trim()).filter(Boolean),
        };
        if (editing?.id) {
            await updateSaleEntity(id, editing.id, payload);
        } else {
            await addSaleEntity(id, payload);
        }
        setOpen(false);
        loadEntities();
    };

    const remove = async (entityId: string) => {
        if (!id) return;
        if (!confirm("حذف این مورد؟")) return;
        await removeSaleEntity(id, entityId);
        loadEntities();
    };

    return (
        <RoleGuard roles={["Admin","Manager"]}>
            <DashboardLayout>
                <Button onClick={()=>router.push("/admin/sale-items")}>← بازگشت</Button>
                <Typography variant="h5" gutterBottom>{item?.name} <Typography component="span" sx={{color:"text.secondary"}}>({item?.itemType})</Typography></Typography>

                {/* Filters for entities */}
                <Stack direction="row" spacing={2} sx={{ mb:2, flexWrap:"wrap" }}>
                    <TextField size="small" label="رنگ" value={color} onChange={e=>setColor(e.target.value)} />
                    <TextField size="small" select label="مرتب‌سازی" value={sortBy} onChange={e=>setSortBy(e.target.value as any)}>
                        <MenuItem value="updatedAt">تاریخ ویرایش</MenuItem>
                        <MenuItem value="createdAt">تاریخ ایجاد</MenuItem>
                        <MenuItem value="price">قیمت</MenuItem>
                        <MenuItem value="stock">موجودی</MenuItem>
                        <MenuItem value="size">سایز</MenuItem>
                    </TextField>
                    <TextField size="small" select label="جهت" value={sortDir} onChange={e=>setSortDir(e.target.value as any)}>
                        <MenuItem value="desc">نزولی</MenuItem>
                        <MenuItem value="asc">صعودی</MenuItem>
                    </TextField>
                    <TextField size="small" select label="دارای مدیا؟" value={hasMedia===null?"any":hasMedia? "yes":"no"} onChange={e=>{
                        const v = e.target.value; setHasMedia(v==="any" ? null : v==="yes");
                    }}>
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
                                <TableCell>{(e.colors||[]).join(", ")}</TableCell>
                                <TableCell>{e.media?.length ?? 0}</TableCell>
                                <TableCell align="right">
                                    <Button size="small" onClick={()=>openEdit(e)}>ویرایش</Button>
                                    <Button size="small" color="error" onClick={()=>remove(e.id!)}>حذف</Button>
                                    <Button size="small" onClick={()=>router.push(`/admin/sale-items/${id}/entities/${e.id}/media`)}>مدیریت مدیا</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={(_, p)=>setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={e=>{ setRowsPerPage(parseInt(e.target.value,10)); setPage(0); }}
                />

                {/* Create/Edit dialog */}
                <Dialog open={open} onClose={()=>setOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>{editing ? "ویرایش مورد" : "افزودن مورد جدید"}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{mt:1}}>
                            <TextField label="قیمت" type="number" value={form.price} onChange={e=>setForm({...form, price: Number(e.target.value)})}/>
                            <TextField label="موجودی" type="number" value={form.stock} onChange={e=>setForm({...form, stock: Number(e.target.value)})}/>
                            <TextField label="سایز" value={form.size} onChange={e=>setForm({...form, size: e.target.value})}/>
                            <TextField label="رنگ‌ها (با , جدا کنید)" value={form.colors} onChange={e=>setForm({...form, colors: e.target.value})}/>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={()=>setOpen(false)}>انصراف</Button>
                        <Button onClick={save} variant="contained">ذخیره</Button>
                    </DialogActions>
                </Dialog>
            </DashboardLayout>
        </RoleGuard>
    );
}
