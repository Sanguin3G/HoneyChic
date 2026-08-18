<?php

namespace App\Livewire\Admin;

use App\Models\User;
use Livewire\Component;
use Livewire\WithPagination;

class Users extends Component
{
    use WithPagination;

    public string $search = '';
    public string $role = '';
    protected $queryString = ['search', 'role'];

    public function updatedSearch(): void { $this->resetPage(); }
    public function updatedRole(): void { $this->resetPage(); }

    public function toggleStatus(int $id): void
    {
        $user = User::withTrashed()->findOrFail($id);
        if ($user->id === auth()->id() || ($user->isAdmin() && User::where('role', 'admin')->count() <= 1)) {
            $this->addError('user', 'The current admin account cannot be deactivated.');
            return;
        }

        $user->trashed() ? $user->restore() : $user->delete();
        session()->flash('success', $user->trashed() ? 'Customer deactivated.' : 'Customer reactivated.');
    }

    public function render()
    {
        return view('livewire.admin.users', [
            'users' => User::withTrashed()->when($this->search, fn ($q) => $q->where(fn ($q) => $q->where('name', 'like', "%{$this->search}%")->orWhere('email', 'like', "%{$this->search}%")))->when($this->role, fn ($q) => $q->where('role', $this->role))->latest()->paginate(12),
        ])->layout('components.layouts.admin', ['title' => 'Customers']);
    }
}
