import { Grid, html } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';
import { getOrders } from './api';

(async function () {
  const wrapper = document.getElementById('orders-table');
  if (!wrapper) return;

  const response = await getOrders();
  const items = response.data || response;

  const data = items.map(o => [
    o.id,
    o.order_number,
    o.user?.name || 'Guest',
    new Date(o.created_at).toLocaleString(),
    o.status,
    `$${o.total_amount.toFixed(2)}`,
  ]);

  new Grid({
    columns: [
      { id: 'id', name: 'ID', hidden: true },
      { id: 'order_number', name: 'Order #' },
      { id: 'customer', name: 'Customer' },
      { id: 'date', name: 'Date' },
      { id: 'status', name: 'Status' },
      { id: 'total', name: 'Total' },
      {
        name: 'Actions',
        formatter: (cell, row) => html(
          `<a href="/admin/orders/${row.cells[0].data}" class="text-blue-600 hover:underline mr-2">View</a>` +
          `<form action="/admin/orders/${row.cells[0].data}/status" method="POST" style="display:inline;">` +
          `<input type="hidden" name="_token" value="${document.querySelector('meta[name=csrf-token]').getAttribute('content')}">` +
          `<input type="hidden" name="_method" value="PUT">` +
          `<select name="status" onchange="this.form.submit()" class="text-sm">` +
            ['pending','processing','shipped','completed','cancelled'].map(s => `<option value="${s}"${s===row.cells[4].data?' selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('') +
          `</select>` +
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