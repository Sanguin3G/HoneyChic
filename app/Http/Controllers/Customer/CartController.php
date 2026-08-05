<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\Cart\StoreCartItemRequest;
use App\Http\Requests\Customer\Cart\UpdateCartItemRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\View\View;

class CartController extends Controller
{
    public function view(Request $request): View|JsonResponse
    {
        $cart = $this->normaliseCart(Session::get('cart', []));
        Session::put('cart', $cart);

        $total = collect($cart)->sum(fn (array $item): float => $item['price'] * $item['quantity']);

        if ($request->wantsJson()) {
            return response()->json(array_values($cart));
        }

        return view('customer.cart.index', compact('cart', 'total'));
    }

    public function add(StoreCartItemRequest $request, Product $product): RedirectResponse
    {
        abort_unless($product->is_published, 404);

        $quantity = $request->validated('quantity');
        $cart = $this->normaliseCart(Session::get('cart', []));
        $newQuantity = ($cart[$product->id]['quantity'] ?? 0) + $quantity;

        if ($product->stock_quantity < $newQuantity) {
            return back()->with('error', "Only {$product->stock_quantity} units of {$product->name} are available in stock.");
        }

        $cart[$product->id] = [
            'product_id' => $product->id,
            'name' => $product->name,
            'price' => (float) $product->price,
            'image' => $product->image,
            'quantity' => $newQuantity,
        ];

        Session::put('cart', $cart);

        return back()->with('success', "'$product->name' added to your cart!");
    }

    public function update(UpdateCartItemRequest $request, int $productId): RedirectResponse|JsonResponse
    {
        $quantity = $request->validated('quantity');
        $cart = $this->normaliseCart(Session::get('cart', []));
        $product = Product::find($productId);

        if (!isset($cart[$productId]) || !$product) {
            return redirect()->route('cart.view')->with('error', 'Item not found in cart.');
        }

        if (!$product->is_published || $product->stock_quantity < $quantity) {
            return back()->with('error', 'That quantity is no longer available.');
        }

        $cart[$productId]['quantity'] = $quantity;
        $cart[$productId]['price'] = (float) $product->price;
        $cart[$productId]['image'] = $product->image;
        Session::put('cart', $cart);

        if ($request->wantsJson()) {
            return response()->json(['cart' => array_values($cart)]);
        }

        return redirect()->route('cart.view')->with('success', 'Cart updated successfully.');
    }

    public function remove(Request $request, int $productId): RedirectResponse|JsonResponse
    {
        $cart = $this->normaliseCart(Session::get('cart', []));

        if (!isset($cart[$productId])) {
            return redirect()->route('cart.view')->with('error', 'Item not found in cart.');
        }

        unset($cart[$productId]);
        Session::put('cart', $cart);

        if ($request->wantsJson()) {
            return response()->json(['cart' => array_values($cart)]);
        }

        return redirect()->route('cart.view')->with('success', 'Item removed from cart.');
    }

    /**
     * Keep old session carts compatible with the current Alpine view.
     *
     * @param array<int|string, array<string, mixed>> $cart
     * @return array<int, array<string, mixed>>
     */
    private function normaliseCart(array $cart): array
    {
        $normalised = [];

        foreach ($cart as $productId => $item) {
            $id = (int) ($item['product_id'] ?? $productId);
            $quantity = (int) ($item['quantity'] ?? 0);

            if ($id > 0 && $quantity > 0) {
                $normalised[$id] = [
                    'product_id' => $id,
                    'name' => (string) ($item['name'] ?? ''),
                    'price' => (float) ($item['price'] ?? 0),
                    'image' => $item['image'] ?? null,
                    'quantity' => $quantity,
                ];
            }
        }

        return $normalised;
    }
}