'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PageReveal } from '@/components/dashboard/PageReveal';
import {
    useProducts,
    useCreateProduct,
    useUpdateProduct,
    useDeleteProduct,
    useStockTransactions,
    useCreateStockTransaction,
    useDeleteStockTransaction,
} from '@/hooks/use-inventory';
import { useLocations } from '@/hooks/use-locations';
import { useLocationFilter } from '@/providers/location-context';
import type { BackendProduct } from '@/lib/api/inventory-api';
import {
    Package,
    Plus,
    Search,
    Trash2,
    Edit,
    Loader2,
    ArrowLeftRight,
    DollarSign,
} from 'lucide-react';

export default function InventoryPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [productOpen, setProductOpen] = useState(false);
    const [stockOpen, setStockOpen] = useState(false);
    const [editing, setEditing] = useState<BackendProduct | null>(null);
    const [form, setForm] = useState({
        name: '',
        sku: '',
        price: '',
        location: '',
    });
    const [stockForm, setStockForm] = useState({
        product: '',
        quantity: 1,
        transaction_type: 'restock',
        notes: '',
    });

    const { data: products, isLoading } = useProducts();
    const { data: transactions, isLoading: txLoading } = useStockTransactions();
    const { data: locations = [] } = useLocations();
    const { locationId, isAllLocations, resolveLocationId } = useLocationFilter();
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const deleteProduct = useDeleteProduct();
    const createTx = useCreateStockTransaction();
    const deleteTx = useDeleteStockTransaction();

    const locationNameById = useMemo(
        () => new Map(locations.map((l) => [l.id, l.name])),
        [locations]
    );

    const filteredProducts = useMemo(() => {
        return (products || []).filter((p) => {
            if (!isAllLocations && p.location && p.location !== locationId) return false;
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                p.name.toLowerCase().includes(q) ||
                p.sku.toLowerCase().includes(q) ||
                (locationNameById.get(p.location) || '').toLowerCase().includes(q)
            );
        });
    }, [products, isAllLocations, locationId, searchQuery, locationNameById]);

    const openCreate = () => {
        setEditing(null);
        setForm({
            name: '',
            sku: '',
            price: '',
            location: resolveLocationId() || locations[0]?.id || '',
        });
        setProductOpen(true);
    };

    const openEdit = (product: BackendProduct) => {
        setEditing(product);
        setForm({
            name: product.name,
            sku: product.sku,
            price: String(product.price),
            location: product.location,
        });
        setProductOpen(true);
    };

    return (
        <PageReveal className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-ink">Inventory</h1>
                    <p className="mt-1 text-sm text-ink-muted">
                        Products and stock movements by location.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => setStockOpen(true)}>
                        <ArrowLeftRight className="h-4 w-4" />
                        Stock move
                    </Button>
                    <Button className="gap-2 shadow-lg shadow-primary/20" onClick={openCreate}>
                        <Plus className="h-4 w-4" />
                        Add product
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                            <Package className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Products</p>
                            <p className="text-2xl font-bold text-ink">
                                {filteredProducts.length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                            <ArrowLeftRight className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Transactions</p>
                            <p className="text-2xl font-bold text-ink">
                                {transactions?.length ?? 0}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                            <DollarSign className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Catalog value</p>
                            <p className="text-2xl font-bold text-ink">
                                $
                                {filteredProducts
                                    .reduce((sum, p) => sum + (Number(p.price) || 0), 0)
                                    .toFixed(0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="products" className="space-y-4">
                <TabsList className="rounded-xl">
                    <TabsTrigger value="products" className="rounded-lg">
                        Products
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="rounded-lg">
                        Stock transactions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-4">
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                            <Input
                                type="search"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-canvas/50 hover:bg-canvas/50">
                                    <TableHead>Product</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead className="w-24" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 6 }).map((__, j) => (
                                                <TableCell key={j}>
                                                    <Skeleton className="h-4 w-20" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : filteredProducts.length > 0 ? (
                                    filteredProducts.map((p) => (
                                        <TableRow
                                            key={p.id}
                                            className="cursor-pointer"
                                            onClick={() =>
                                                router.push(`/dashboard/inventory/${p.id}`)
                                            }
                                        >
                                            <TableCell className="font-medium text-ink">
                                                {p.name}
                                            </TableCell>
                                            <TableCell className="text-sm text-ink-muted">
                                                {p.sku}
                                            </TableCell>
                                            <TableCell className="text-sm text-ink">
                                                ${Number(p.price).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-sm text-ink-muted">
                                                {p.location_name ||
                                                    locationNameById.get(p.location) ||
                                                    '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="rounded-lg">
                                                    {p.stock_quantity ??
                                                        p.quantity_on_hand ??
                                                        '—'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8"
                                                        onClick={() => openEdit(p)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-red-600"
                                                        onClick={() => deleteProduct.mutate(p.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-28 text-center text-sm text-ink-muted"
                                        >
                                            No products yet
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="transactions">
                    <div className="overflow-hidden rounded-2xl border border-border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-canvas/50 hover:bg-canvas/50">
                                    <TableHead>Product</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead>When</TableHead>
                                    <TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {txLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 6 }).map((__, j) => (
                                                <TableCell key={j}>
                                                    <Skeleton className="h-4 w-20" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (transactions || []).length > 0 ? (
                                    (transactions || []).map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="font-medium text-ink">
                                                {tx.product_name || tx.product}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className="rounded-lg capitalize"
                                                >
                                                    {tx.transaction_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-ink">
                                                {tx.quantity}
                                            </TableCell>
                                            <TableCell className="text-sm text-ink-muted">
                                                {tx.notes || '—'}
                                            </TableCell>
                                            <TableCell className="text-sm text-ink-muted">
                                                {tx.created_at
                                                    ? new Date(tx.created_at).toLocaleString()
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-red-600"
                                                    onClick={() => deleteTx.mutate(tx.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-28 text-center text-sm text-ink-muted"
                                        >
                                            No stock transactions
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={productOpen} onOpenChange={setProductOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit product' : 'Add product'}</DialogTitle>
                        <DialogDescription>
                            Products are scoped to a physical location.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>SKU</Label>
                            <Input
                                value={form.sku}
                                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Price</Label>
                            <Input
                                value={form.price}
                                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                                placeholder="45.99"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Select
                                value={form.location}
                                onValueChange={(v) => setForm((f) => ({ ...f, location: v }))}
                            >
                                <SelectTrigger className="w-full rounded-xl">
                                    <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map((l) => (
                                        <SelectItem key={l.id} value={l.id}>
                                            {l.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setProductOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={
                                    !form.name ||
                                    !form.sku ||
                                    !form.price ||
                                    !form.location ||
                                    createProduct.isPending ||
                                    updateProduct.isPending
                                }
                                onClick={async () => {
                                    if (editing) {
                                        await updateProduct.mutateAsync({
                                            id: editing.id,
                                            data: form,
                                        });
                                    } else {
                                        await createProduct.mutateAsync(form);
                                    }
                                    setProductOpen(false);
                                }}
                            >
                                {(createProduct.isPending || updateProduct.isPending) && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {editing ? 'Save' : 'Create'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={stockOpen} onOpenChange={setStockOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Record stock transaction</DialogTitle>
                        <DialogDescription>
                            Restock inventory or record an adjustment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label>Product</Label>
                            <Select
                                value={stockForm.product}
                                onValueChange={(v) =>
                                    setStockForm((f) => ({ ...f, product: v }))
                                }
                            >
                                <SelectTrigger className="w-full rounded-xl">
                                    <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(products || []).map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={stockForm.transaction_type}
                                onValueChange={(v) =>
                                    setStockForm((f) => ({ ...f, transaction_type: v }))
                                }
                            >
                                <SelectTrigger className="w-full rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="restock">Restock</SelectItem>
                                    <SelectItem value="adjustment">Adjustment</SelectItem>
                                    <SelectItem value="sale">Sale</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input
                                type="number"
                                value={stockForm.quantity}
                                onChange={(e) =>
                                    setStockForm((f) => ({
                                        ...f,
                                        quantity: Number(e.target.value),
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Input
                                value={stockForm.notes}
                                onChange={(e) =>
                                    setStockForm((f) => ({ ...f, notes: e.target.value }))
                                }
                                placeholder="Weekly inventory delivery"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setStockOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={!stockForm.product || createTx.isPending}
                                onClick={async () => {
                                    await createTx.mutateAsync(stockForm);
                                    setStockOpen(false);
                                }}
                            >
                                {createTx.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Record
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </PageReveal>
    );
}
