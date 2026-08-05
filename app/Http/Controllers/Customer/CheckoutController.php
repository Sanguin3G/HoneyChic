<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\Checkout\ProcessCheckoutRequest;
use App\Mail\OrderProcessedMail;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;
use Illuminate\View\View;
use RuntimeException;

class CheckoutController extends Controller
{
    public function show(): View|RedirectResponse
    {
        $cart = Session::get('cart', []);

        if (empty($cart)) {
            return redirect()->route('cart.view')
                ->with('error', 'Your cart is empty. Please add items before proceeding to checkout.');
        }

        $user = request()->user();

        return view('customer.checkout.index', compact('user', 'cart'));
    }

    public function process(ProcessCheckoutRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $cart = Session::get('cart', []);

        if (empty($cart)) {
            return redirect()->route('cart.view')->with('error', 'Your cart became empty during checkout. Please try again.');
        }

        try {
            $order = DB::transaction(function () use ($validated, $cart): Order {
                $items = [];
                $totalAmount = 0.0;

                foreach ($cart as $productId => $item) {
                    $product = Product::query()->lockForUpdate()->find((int) ($item['product_id'] ?? $productId));

                    if (!$product || !$product->is_published) {
                        throw new RuntimeException('One of the products in your cart is no longer available.');
                    }

                    $quantity = (int) ($item['quantity'] ?? 0);
                    if ($quantity < 1 || $product->stock_quantity < $quantity) {
                        throw new RuntimeException("Not enough stock is available for {$product->name}.");
                    }

                    $price = (float) $product->price;
                    $items[] = [
                        'product_id' => $product->id,
                        'quantity' => $quantity,
                        'price' => $price,
                    ];
                    $totalAmount += $price * $quantity;
                }

                if (empty($items)) {
                    throw new RuntimeException('Your cart is empty. Please add items before checking out.');
                }

                $order = Order::create([
                    'user_id' => $validated['user_id'] ?? auth()->id(),
                    'total_amount' => $totalAmount,
                    'status' => 'pending',
                    'shipping_address' => $validated['shipping_address'],
                    'billing_address' => $validated['billing_address'] ?? null,
                    'payment_method' => $validated['payment_method'],
                    'notes' => $validated['notes'] ?? null,
                ]);

                foreach ($items as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        ...$item,
                    ]);
                }

                return $order;
            });

            if ($validated['receive_email_confirmation'] ?? false) {
                $order->load('user', 'orderItems.product');

                try {
                    Mail::to($validated['email'])->send(
                        new OrderProcessedMail($order, $validated['name'], $validated['email'])
                    );
                } catch (\Throwable $e) {
                    Log::error("Failed to send order processed email for order {$order->id}: {$e->getMessage()}");
                }
            }

            Session::forget('cart');

            return redirect()->route('orders.show', $order)
                ->with('success', 'Your order #' . $order->order_number . ' has been placed successfully!');
        } catch (\Throwable $e) {
            Log::error('Checkout Error: ' . $e->getMessage());

            return back()->with('error', $e->getMessage())->withInput();
        }
    }
}