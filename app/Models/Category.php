<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    // Attributes that can be mass-assigned.
    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    /**
     * Get the products for the category.
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function getProductCountAttribute(): int
    {
        return $this->products_count ?? $this->products()->count();
    }
}
?>
