import { Grid, html } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';
import { getUsers } from './api';

(async function () {
  const wrapper = document.getElementById('users-table');
  if (!wrapper) return;

  const response = await getUsers();
  const items = response.data || response;

  const data = items.map(u => [
    u.id,
    u.name,
    u.email,
    u.role,
    u.deleted_at ? 'Deleted' : 'Active',
  ]);

  new Grid({
    columns: [
      { id: 'id', name: 'ID', hidden: true },
      { id: 'name', name: 'Name' },
      { id: 'email', name: 'Email' },
      { id: 'role', name: 'Role' },
      { id: 'state', name: 'State' },
      {
        name: 'Actions',
        formatter: (cell, row) => html(
          row.cells[4].data === 'Deleted'
            ? `<form action="/admin/users/${row.cells[0].data}/restore" method="POST" style="display:inline;">` +
                `<input type="hidden" name="_token" value="${document.querySelector('meta[name=csrf-token]').getAttribute('content')}">` +
                `<input type="hidden" name="_method" value="PUT">` + `<button type="submit" class="text-green-600 hover:underline">Restore</button>` +
              `</form>`
            : `<a href="/admin/users/${row.cells[0].data}/edit" class="text-blue-600 hover:underline mr-2">Edit</a>` +
              `<form action="/admin/users/${row.cells[0].data}" method="POST" style="display:inline;" onsubmit="return confirm('Delete this user?');">` +
                `<input type="hidden" name="_token" value="${document.querySelector('meta[name=csrf-token]').getAttribute('content')}">` +
                `<input type="hidden" name="_method" value="DELETE">` +
                `<button type="submit" class="text-red-600 hover:underline">Delete</button>` +
              `</form>`
        )
      }
    ],
    data,
    search: true,
    sort: true,
    pagination: { enabled: true, limit: 15 }
  }).render(wrapper);
})(); 