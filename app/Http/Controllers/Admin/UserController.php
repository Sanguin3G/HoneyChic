<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\User\StoreUserRequest;
use App\Http\Requests\Admin\User\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class UserController extends Controller
{
    public function index(Request $request): View|JsonResponse
    {
        $search = $request->input('search');
        $roleFilter = $request->input('role');
        $userStateFilter = $request->input('user_state');
        $sortField = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('direction', 'desc');

        $validSortFields = ['name', 'email', 'created_at', 'role'];
        if (!in_array($sortField, $validSortFields, true)) {
            $sortField = 'created_at';
        }
        if (!in_array($sortDirection, ['asc', 'desc'], true)) {
            $sortDirection = 'desc';
        }

        $users = User::query()
            ->when($userStateFilter === 'deleted', fn ($query) => $query->onlyTrashed())
            ->when($userStateFilter === 'active', fn ($query) => $query->whereNull('deleted_at'))
            ->when($userStateFilter === null || $userStateFilter === '', fn ($query) => $query->withTrashed())
            ->when($search, fn ($query, $value) => $query->where(fn ($searchQuery) =>
                $searchQuery->where('name', 'like', "%{$value}%")
                    ->orWhere('email', 'like', "%{$value}%")
            ))
            ->when($roleFilter, fn ($query, $role) => $query->where('role', $role))
            ->orderBy($sortField, $sortDirection)
            ->paginate(15)
            ->withQueryString();

        if ($request->wantsJson()) {
            return response()->json($users);
        }

        $roles = User::withTrashed()->distinct()->pluck('role')->filter()->sort()->values()->all();
        if (empty($roles)) {
            $roles = ['admin', 'customer'];
        }

        $userStateOptions = [
            '' => 'All States',
            'active' => 'Active',
            'deleted' => 'Deleted',
        ];

        return view('admin.users.index', compact(
            'users',
            'roles',
            'search',
            'roleFilter',
            'userStateFilter',
            'userStateOptions',
            'sortField',
            'sortDirection'
        ));
    }

    public function create(): View
    {
        return view('admin.users.form');
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        User::create($request->validated());

        return redirect()->route('admin.users.index')->with('status', 'User created successfully.');
    }

    public function edit(User $user): View
    {
        return view('admin.users.form', compact('user'));
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $user->update($request->validated());

        return redirect()->route('admin.users.edit', $user)->with('status', 'User updated successfully.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return redirect()->route('admin.users.index')->with('error', 'You cannot delete yourself.');
        }

        if ($user->role === 'admin' && User::where('role', 'admin')->count() <= 1) {
            return redirect()->route('admin.users.index')->with('error', 'Cannot delete the last admin user.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('status', 'User deleted successfully.');
    }

    public function restore(int $id): RedirectResponse
    {
        $user = User::withTrashed()->findOrFail($id);

        if (!$user->trashed()) {
            return redirect()->route('admin.users.index')
                ->with('error', 'User is not deleted or cannot be restored.');
        }

        $user->restore();

        return redirect()->route('admin.users.index')->with('status', 'User restored successfully.');
    }
}