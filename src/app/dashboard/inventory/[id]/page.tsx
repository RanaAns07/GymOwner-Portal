'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    DetailHero,
    DetailPageShell,
} from '@/components/layout/detail-page-shell';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    useProducts,
    useUpdateProduct,
    useStockTransactions,
    useCreateStockTransaction,
} from '@/hooks/use-inventory';
import { useLocations } from '@/hooks/use-locations';
import {
    ArrowLeft,
    ArrowLeftRight,
    Loader2,
    MapPin,
    Package,
    Pencil,
} from 'lucide-react';

export default function InventoryDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { data: products, isLoading } = useProducts();
    const { data: transactions } = useStockTransactions();
    const { data: locations = [] } = useLocations();
    const updateProduct = useUpdateProduct();
    const createTx = useCreateStockTransaction();

    const [editOpen, setEditOpen] = useState(false);
    const [stockOpen, setStockOpen] = useState(false);
    const [form, setForm] = useState({ name: '', sku: '', price: '', location: '' });
    const [stockForm, setStockForm] = useState({
        quantity: 1,
        transaction_type: 'restock',
        notes: '',
    });

    const product = useMemo(() => products?.find((p) => p.id === id), [products, id]);
    const locationName =
        product?.location_name ||
        locations.find((l) => l.id === product?.location)?.name;
    const productTx = useMemo(
        () => (transactions || []).filter((t) => t.product === id),
        [transactions, id]
    );

    if (isLoading) {
        return (
            <div className="-m-6 bg-[#0b1220] px-6 py-10 lg:-m-8">
                <Skeleton className="h-10 w-56 bg-white/10" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
                <p className="text-lg font-semibold text-ink">Product not found</p>
                <Button asChild className="gap-2 rounded-xl">
                    <Link href="/dashboard/inventory">
                        <ArrowLeft className="h-4 w-4" />
                        Back to inventory
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <>
            <DetailPageShell
                backHref="/dashboard/inventory"
                backLabel="Back to inventory"
                actions={
                    <>
                        <Button
                            variant="outline"
                            className="gap-2 rounded-xl"
                            onClick={() => setStockOpen(true)}
                        >
                            <ArrowLeftRight className="h-4 w-4" />
                            Stock move
                        </Button>
                        <Button
                            className="gap-2 rounded-xl shadow-lg shadow-primary/20"
                            onClick={() => {
                                setForm({
                                    name: product.name,
                                    sku: product.sku,
                                    price: String(product.price),
                                    location: product.location,
                                });
                                setEditOpen(true);
                            }}
                        >
                            <Pencil className="h-4 w-4" />
                            Edit
                        </Button>
                    </>
                }
                hero={
                    <DetailHero
                        eyebrow="Product"
                        title={product.name}
                        meta={
                            <>
                                <Badge className="rounded-lg bg-primary/20 text-primary hover:bg-primary/20">
                                    {product.sku}
                                </Badge>
                                {locationName ? (
                                    <span className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1 text-sm text-white/90">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {locationName}
                                    </span>
                                ) : null}
                            </>
                        }
                        stats={
                            <div className="grid grid-cols-2 gap-3 lg:min-w-[220px]">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                                        Price
                                    </p>
                                    <p className="mt-1 text-2xl font-extrabold text-primary">
                                        ${Number(product.price).toFixed(2)}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                                        Stock
                                    </p>
                                    <p className="mt-1 text-2xl font-extrabold text-primary">
                                        {product.stock_quantity ??
                                            product.quantity_on_hand ??
                                            '—'}
                                    </p>
                                </div>
                            </div>
                        }
                    />
                }
            >
                <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                            Product info
                        </h2>
                        <Separator className="my-4" />
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center gap-3">
                                <Package className="h-4 w-4 text-accent-foreground" />
                                <span className="font-medium text-ink">{product.name}</span>
                            </li>
                            <li>
                                <p className="text-xs text-ink-muted">SKU</p>
                                <p className="font-medium text-ink">{product.sku}</p>
                            </li>
                            {product.location ? (
                                <li>
                                    <p className="text-xs text-ink-muted">Location</p>
                                    <Link
                                        href={`/dashboard/locations/${product.location}`}
                                        className="font-medium text-accent-foreground hover:underline"
                                    >
                                        {locationName || product.location}
                                    </Link>
                                </li>
                            ) : null}
                        </ul>
                    </section>

                    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                            Recent stock moves
                        </h2>
                        <Separator className="my-4" />
                        {productTx.length > 0 ? (
                            <ul className="space-y-2">
                                {productTx.slice(0, 10).map((tx) => (
                                    <li
                                        key={tx.id}
                                        className="flex items-center justify-between rounded-xl border border-border bg-canvas/40 px-3 py-2.5 text-sm"
                                    >
                                        <div>
                                            <Badge
                                                variant="secondary"
                                                className="rounded-lg capitalize"
                                            >
                                                {tx.transaction_type}
                                            </Badge>
                                            <p className="mt-1 text-xs text-ink-muted">
                                                {tx.notes || 'No notes'}
                                            </p>
                                        </div>
                                        <span className="font-semibold text-ink">
                                            {tx.quantity > 0 ? '+' : ''}
                                            {tx.quantity}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-ink-muted">No stock transactions yet.</p>
                        )}
                    </section>
                </div>
            </DetailPageShell>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit product</DialogTitle>
                        <DialogDescription>Update catalog fields for this SKU.</DialogDescription>
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
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Select
                                value={form.location}
                                onValueChange={(v) => setForm((f) => ({ ...f, location: v }))}
                            >
                                <SelectTrigger className="w-full rounded-xl">
                                    <SelectValue />
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
                            <Button variant="outline" onClick={() => setEditOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={updateProduct.isPending}
                                onClick={async () => {
                                    await updateProduct.mutateAsync({
                                        id: product.id,
                                        data: form,
                                    });
                                    setEditOpen(false);
                                }}
                            >
                                {updateProduct.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Save
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={stockOpen} onOpenChange={setStockOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Stock transaction</DialogTitle>
                        <DialogDescription>
                            Record a restock or adjustment for {product.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
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
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setStockOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={createTx.isPending}
                                onClick={async () => {
                                    await createTx.mutateAsync({
                                        product: product.id,
                                        ...stockForm,
                                    });
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
        </>
    );
}
