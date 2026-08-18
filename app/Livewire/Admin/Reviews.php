<?php

namespace App\Livewire\Admin;

use App\Models\Review;
use Livewire\Component;
use Livewire\WithPagination;

class Reviews extends Component
{
    use WithPagination;

    public string $status = '';
    protected $queryString = ['status'];

    public function updatedStatus(): void { $this->resetPage(); }

    public function updateStatus(int $id, string $status): void
    {
        abort_unless(in_array($status, ['pending', 'approved', 'rejected'], true), 422);
        Review::findOrFail($id)->update(['status' => $status]);
        session()->flash('success', 'Review status updated.');
    }

    public function render()
    {
        return view('livewire.admin.reviews', [
            'reviews' => Review::with(['product', 'user'])->when($this->status, fn ($q) => $q->where('status', $this->status))->latest()->paginate(12),
        ])->layout('components.layouts.admin', ['title' => 'Reviews']);
    }
}
