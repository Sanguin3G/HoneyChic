<?php

namespace App\Support;

use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class CartManager
{
    public function raw(): array
    {
        return session()->get('cart', []);
    }

    public function items(): Collection
    {
        $raw = $this->raw();
        $products = Product::query()->whereIn('id', array_keys($raw))->get()->keyBy('id');

        return collect($raw)->map(function (array $item, $id) use ($products): ?array {
            $product = $products->get((int) ($item['product_id'] ?? $id));

            if (! $product) {
                return null;
            }

            $quantity = max(1, (int) ($item['quantity'] ?? 1));

            return [
                'product_id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'price' => (float) $product->price,
                'image' => $product->image,
                'stock_quantity' => $product->stock_quantity,
                'quantity' => $quantity,
                'line_total' => (float) $product->price * $quantity,
                'product' => $product,
            ];
        })->filter()->values();
    }

    public function add(Product $product, int $quantity = 1): void
    {
        abort_unless($product->is_published, 404);

        $cart = $this->raw();
        $newQuantity = (int) ($cart[$product->id]['quantity'] ?? 0) + $quantity;

        if ($quantity < 1 || $newQuantity > $product->stock_quantity) {
            throw ValidationException::withMessages([
                'cart' => "Only {$product->stock_quantity} units of {$product->name} are currently available.",
            ]);
        }

        $cart[$product->id] = $this->snapshot($product, $newQuantity);
        session()->put('cart', $cart);
    }

    public function update(int $productId, int $quantity): void
    {
        $product = Product::find($productId);

        if (! $product || ! isset($this->raw()[$productId])) {
            throw ValidationException::withMessages(['cart' => 'That cart item is no longer available.']);
        }

        if ($quantity < 1 || $quantity > $product->stock_quantity) {
            throw ValidationException::withMessages(['cart' => "Only {$product->stock_quantity} units of {$product->name} are currently available."]);
        }

        $cart = $this->raw();
        $cart[$productId] = $this->snapshot($product, $quantity);
        session()->put('cart', $cart);
    }

    public function remove(int $productId): void
    {
        $cart = $this->raw();
        unset($cart[$productId]);
        session()->put('cart', $cart);
    }

    public function clear(): void
    {
        session()->forget('cart');
    }

    public function count(): int
    {
        return (int) $this->items()->sum('quantity');
    }

    public function subtotal(): float
    {
        return (float) $this->items()->sum('line_total');
    }

    private function snapshot(Product $product, int $quantity): array
    {
        return [
            'product_id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'price' => (float) $product->price,
            'image' => $product->image,
            'quantity' => $quantity,
        ];
    }
}
