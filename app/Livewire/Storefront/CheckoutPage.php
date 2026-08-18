<?php

namespace App\Livewire\Storefront;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Support\CartManager;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Livewire\Component;

class CheckoutPage extends Component
{
    public string $name = '';
    public string $email = '';
    public string $phone = '';
    public string $shippingAddress = '';
    public string $billingAddress = '';
    public bool $sameBilling = true;
    public string $paymentMethod = 'Cash on Delivery';
    public string $notes = '';

    public function mount(): void
    {
        $user = auth()->user();
        $this->name = $user->name;
        $this->email = $user->email;
    }

    public function updatedSameBilling(bool $value): void
    {
        if ($value) {
            $this->billingAddress = $this->shippingAddress;
        }
    }

    public function updatedShippingAddress(string $value): void
    {
        if ($this->sameBilling) {
            $this->billingAddress = $value;
        }
    }

    public function placeOrder()
    {
        $this->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'shippingAddress' => ['required', 'string', 'max:1000'],
            'billingAddress' => ['required_if:sameBilling,false', 'nullable', 'string', 'max:1000'],
            'paymentMethod' => ['required', 'in:Cash on Delivery'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $cart = app(CartManager::class);

        if ($cart->items()->isEmpty()) {
            $this->addError('cart', 'Your cart is empty.');
            return;
        }

        $order = DB::transaction(function () use ($cart): Order {
            $lines = [];
            $subtotal = 0;

            foreach ($cart->items() as $line) {
                $product = Product::query()->lockForUpdate()->find($line['product_id']);
                $quantity = (int) $line['quantity'];

                if (! $product || ! $product->is_published || $quantity > $product->stock_quantity) {
                    throw ValidationException::withMessages(['cart' => "{$line['name']} no longer has enough stock."]);
                }

                $subtotal += $product->price * $quantity;
                $lines[] = [$product, $quantity];
            }

            $order = Order::create([
                'user_id' => auth()->id(),
                'customer_name' => $this->name,
                'customer_email' => $this->email,
                'customer_phone' => $this->phone,
                'subtotal' => $subtotal,
                'shipping_amount' => 0,
                'total_amount' => $subtotal,
                'status' => 'pending',
                'payment_method' => $this->paymentMethod,
                'payment_status' => 'pending',
                'shipping_address' => $this->shippingAddress,
                'billing_address' => $this->sameBilling ? $this->shippingAddress : $this->billingAddress,
                'notes' => $this->notes ?: null,
            ]);

            foreach ($lines as [$product, $quantity]) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'quantity' => $quantity,
                    'price' => $product->price,
                ]);
                $product->decrement('stock_quantity', $quantity);
            }

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'to_status' => 'pending',
                'note' => 'Order placed',
                'created_by' => auth()->id(),
            ]);

            return $order;
        });

        $cart->clear();
        $this->dispatch('cart-updated');

        return redirect()->route('orders.show', $order)->with('success', "Order {$order->order_number} placed successfully.");
    }

    public function render()
    {
        $cart = app(CartManager::class);

        return view('livewire.storefront.checkout-page', [
            'items' => $cart->items(),
            'subtotal' => $cart->subtotal(),
        ])->layout('components.layouts.app', ['title' => 'Checkout']);
    }
}
