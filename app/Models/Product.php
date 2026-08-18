<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    // Attributes that can be mass assigned.
    protected $fillable = [
        'name',
        'slug',
        'price',
        'description',
        'image',
        'category_id',
        'is_published',
        'is_featured',
        'stock_quantity',
        'sku',
    ];

    // Optionally cast price to a float.
    protected $casts = [
        'price' => 'float',
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
        'stock_quantity' => 'integer',
    ];

    /**
     * Get the category that owns the product.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the order items for the product.
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function getInitialsAttribute(): string
    {
        return collect(preg_split('/\s+/', trim($this->name)))
            ->filter()
            ->take(2)
            ->map(fn (string $word) => strtoupper($word[0]))
            ->implode('');
    }

}

?>
