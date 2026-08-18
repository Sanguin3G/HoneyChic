<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(AdminUserSeeder::class);

        $customers = collect([
            ['name' => 'Maya Tran', 'email' => 'maya@example.com'],
            ['name' => 'Jon Bell', 'email' => 'jon@example.com'],
            ['name' => 'Nina Cole', 'email' => 'nina@example.com'],
        ])->mapWithKeys(function (array $data): array {
            $user = User::updateOrCreate(['email' => $data['email']], [
                'name' => $data['name'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => 'customer',
            ]);

            return [$user->email => $user];
        });

        $categories = collect([
            ['name' => 'Apparel', 'slug' => 'apparel', 'description' => 'Everyday layers with a little more intention.'],
            ['name' => 'Desk & Studio', 'slug' => 'desk-studio', 'description' => 'Small tools for focused work and creative rituals.'],
            ['name' => 'Carry', 'slug' => 'carry', 'description' => 'Useful pieces for commutes, weekends, and everywhere between.'],
            ['name' => 'Drinkware', 'slug' => 'drinkware', 'description' => 'Reliable vessels for slow mornings and busy afternoons.'],
        ])->mapWithKeys(fn (array $data) => [$data['slug'] => Category::updateOrCreate(['slug' => $data['slug']], $data)]);

        $products = collect([
            ['name' => 'Heavyweight Everyday Hoodie', 'sku' => 'APP-HOODIE-001', 'category' => 'apparel', 'price' => 68, 'stock_quantity' => 14, 'is_featured' => true, 'description' => 'A structured cotton fleece hoodie with a soft brushed interior and an easy, relaxed shape.', 'image' => 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85'],
            ['name' => 'Relaxed Canvas Overshirt', 'sku' => 'APP-SHIRT-001', 'category' => 'apparel', 'price' => 74, 'stock_quantity' => 9, 'is_featured' => false, 'description' => 'Mid-weight canvas, generous pockets, and a fit that works over a tee or under a coat.', 'image' => 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=85'],
            ['name' => 'Everyday Ribbed Tee', 'sku' => 'APP-TEE-001', 'category' => 'apparel', 'price' => 32, 'stock_quantity' => 26, 'is_featured' => true, 'description' => 'A substantial ribbed tee designed to hold its shape from the first coffee to the last errand.', 'image' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85'],
            ['name' => 'Studio Desk Mat', 'sku' => 'DSK-MAT-001', 'category' => 'desk-studio', 'price' => 42, 'stock_quantity' => 18, 'is_featured' => true, 'description' => 'A generous recycled-felt surface that makes a desk feel calmer and keeps small things in place.', 'image' => 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85'],
            ['name' => 'Field Notes Hardcover', 'sku' => 'DSK-NOTE-001', 'category' => 'desk-studio', 'price' => 18, 'stock_quantity' => 42, 'is_featured' => false, 'description' => 'A lay-flat notebook with 160 pages of smooth, fountain-pen-friendly paper.', 'image' => 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=85'],
            ['name' => 'Brass Page Marker', 'sku' => 'DSK-MARK-001', 'category' => 'desk-studio', 'price' => 12, 'stock_quantity' => 31, 'is_featured' => false, 'description' => 'A small solid-brass bookmark that develops a warmer patina over time.', 'image' => 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85'],
            ['name' => 'Day Trip Canvas Tote', 'sku' => 'CAR-TOTE-001', 'category' => 'carry', 'price' => 38, 'stock_quantity' => 23, 'is_featured' => true, 'description' => 'A durable daily tote with a deep interior, reinforced handles, and one quick-access pocket.', 'image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85'],
            ['name' => 'Compact Travel Pouch', 'sku' => 'CAR-POUCH-001', 'category' => 'carry', 'price' => 26, 'stock_quantity' => 20, 'is_featured' => false, 'description' => 'A structured pouch for cables, pens, and the other small things that like to disappear.', 'image' => 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85'],
            ['name' => 'Recycled Nylon Daypack', 'sku' => 'CAR-PACK-001', 'category' => 'carry', 'price' => 96, 'stock_quantity' => 7, 'is_featured' => true, 'description' => 'A lightweight daypack with a padded laptop sleeve and just enough room for a full day out.', 'image' => 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=85'],
            ['name' => 'Trail Bottle 750', 'sku' => 'DRK-BOTTLE-001', 'category' => 'drinkware', 'price' => 29, 'stock_quantity' => 34, 'is_featured' => true, 'description' => 'Double-wall stainless steel that keeps drinks cold without making your bag feel like a fridge.', 'image' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=85'],
            ['name' => 'Daily Ceramic Mug', 'sku' => 'DRK-MUG-001', 'category' => 'drinkware', 'price' => 24, 'stock_quantity' => 28, 'is_featured' => false, 'description' => 'A generous hand-feel, a comfortable handle, and a glaze that looks better with use.', 'image' => 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=85'],
            ['name' => 'Insulated Commuter Cup', 'sku' => 'DRK-CUP-001', 'category' => 'drinkware', 'price' => 34, 'stock_quantity' => 12, 'is_featured' => false, 'description' => 'A leak-resistant cup for the commute, with a ceramic-lined interior and a quiet lid.', 'image' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85'],
        ])->mapWithKeys(function (array $data) use ($categories): array {
            $category = $data['category'];
            unset($data['category']);
            $product = Product::updateOrCreate(['sku' => $data['sku']], $data + [
                'category_id' => $categories[$category]->id,
                'slug' => str($data['name'])->slug(),
                'is_published' => true,
            ]);

            return [$product->sku => $product];
        });

        $completed = $this->createOrder($customers['maya@example.com'], 'LS-1001', 'completed', [
            ['sku' => 'CAR-TOTE-001', 'quantity' => 1],
            ['sku' => 'DSK-NOTE-001', 'quantity' => 1],
        ], '2026-08-03');
        $shipped = $this->createOrder($customers['jon@example.com'], 'LS-1002', 'shipped', [
            ['sku' => 'APP-TEE-001', 'quantity' => 2],
            ['sku' => 'DRK-BOTTLE-001', 'quantity' => 1],
        ], '2026-08-10');
        $this->createOrder($customers['nina@example.com'], 'LS-1003', 'pending', [
            ['sku' => 'DSK-MAT-001', 'quantity' => 1],
        ], '2026-08-17');
        $ninaCompleted = $this->createOrder($customers['nina@example.com'], 'LS-1004', 'completed', [
            ['sku' => 'APP-HOODIE-001', 'quantity' => 1],
            ['sku' => 'DRK-MUG-001', 'quantity' => 1],
            ['sku' => 'CAR-POUCH-001', 'quantity' => 1],
        ], '2026-08-12');

        $reviews = [
            ['sku' => 'CAR-TOTE-001', 'user' => 'maya@example.com', 'order_id' => $completed->id, 'rating' => 5, 'title' => 'My new everyday bag', 'body' => 'The canvas is sturdy, the pocket is genuinely useful, and it still looks good after a week of commuting.'],
            ['sku' => 'DSK-NOTE-001', 'user' => 'maya@example.com', 'order_id' => $completed->id, 'rating' => 5, 'title' => 'A lovely notebook', 'body' => 'The paper is smooth, the binding lies flat, and the cover has just the right amount of texture.'],
            ['sku' => 'APP-TEE-001', 'user' => 'jon@example.com', 'order_id' => $shipped->id, 'rating' => 4, 'title' => 'Better than the usual tee', 'body' => 'The fabric feels substantial without being heavy. It kept its shape after the first wash.'],
            ['sku' => 'DRK-BOTTLE-001', 'user' => 'jon@example.com', 'order_id' => $shipped->id, 'rating' => 5, 'title' => 'Cold all afternoon', 'body' => 'Clean design, no leaks, and it stayed cold through a long day outside.'],
            ['sku' => 'APP-HOODIE-001', 'user' => 'nina@example.com', 'order_id' => $ninaCompleted->id, 'rating' => 5, 'title' => 'The reliable layer', 'body' => 'Soft inside, structured outside, and roomy without feeling sloppy. This one gets worn constantly.'],
            ['sku' => 'DRK-MUG-001', 'user' => 'nina@example.com', 'order_id' => $ninaCompleted->id, 'rating' => 4, 'title' => 'Good morning mug', 'body' => 'Comfortable handle and a generous size. The glaze has a nice handmade feel.'],
            ['sku' => 'CAR-POUCH-001', 'user' => 'nina@example.com', 'order_id' => $ninaCompleted->id, 'rating' => 5, 'title' => 'Everything has a place', 'body' => 'It fits my charger, cables, pens, and a few adapters without becoming a floppy mess in my bag.'],
        ];

        foreach ($reviews as $review) {
            $product = $products[$review['sku']];
            $user = $customers[$review['user']];
            unset($review['sku'], $review['user']);

            Review::updateOrCreate([
                'product_id' => $product->id,
                'user_id' => $user->id,
            ], $review + ['status' => 'approved']);
        }
    }

    private function createOrder(User $user, string $number, string $status, array $lines, string $date): Order
    {
        $subtotal = 0;
        $resolved = [];

        foreach ($lines as $line) {
            $product = Product::where('sku', $line['sku'])->firstOrFail();
            $quantity = (int) $line['quantity'];
            $subtotal += $product->price * $quantity;
            $resolved[] = [$product, $quantity];
        }

        $timestamp = Carbon::parse($date)->setTime(10, 30);
        $order = Order::firstOrNew(['order_number' => $number]);
        $isNew = ! $order->exists;
        $order->fill([
            'user_id' => $user->id,
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => '0900000000',
            'subtotal' => $subtotal,
            'shipping_amount' => 0,
            'total_amount' => $subtotal,
            'status' => $status,
            'payment_method' => 'Cash on Delivery',
            'payment_status' => 'pending',
            'shipping_address' => '18 Practice Street\nDistrict 1, Ho Chi Minh City',
            'billing_address' => '18 Practice Street\nDistrict 1, Ho Chi Minh City',
        ]);
        if ($isNew) {
            $order->created_at = $timestamp;
        }
        $order->save();

        foreach ($resolved as [$product, $quantity]) {
            OrderItem::updateOrCreate(['order_id' => $order->id, 'product_id' => $product->id], [
                'product_name' => $product->name,
                'sku' => $product->sku,
                'quantity' => $quantity,
                'price' => $product->price,
            ]);

            if ($isNew && in_array($status, ['processing', 'shipped', 'completed'], true)) {
                $product->decrement('stock_quantity', $quantity);
            }
        }

        OrderStatusHistory::firstOrCreate(['order_id' => $order->id, 'to_status' => 'pending'], [
            'note' => 'Order placed', 'created_by' => $user->id, 'created_at' => $timestamp, 'updated_at' => $timestamp,
        ]);
        if ($status !== 'pending') {
            OrderStatusHistory::firstOrCreate(['order_id' => $order->id, 'from_status' => 'pending', 'to_status' => $status], [
                'note' => 'Seeded order history', 'created_by' => $user->id, 'created_at' => $timestamp->copy()->addHour(), 'updated_at' => $timestamp->copy()->addHour(),
            ]);
        }

        return $order;
    }
}
