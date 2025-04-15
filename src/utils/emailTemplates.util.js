export const generateTicketHTML = ({ tid, purchaser, purchased = [], notPurchased = [], total }) => {
    const formatRow = (p) => `
      <tr>
        <td>${p.title || 'Unknown'}</td>
        <td>${p.pid}</td>
        <td>${p.quantity}</td>
        <td>${p.price ? `$${p.price}` : 'N/A'}</td>
      </tr>
    `;
  
    const purchasedRows = purchased.map(formatRow).join("");
    const notPurchasedRows = notPurchased.map(formatRow).join("");
  
    return `
      <h1>Thank you for your order!</h1>
      <p><strong>Ticket ID:</strong> ${tid}</p>
      <p><strong>Email:</strong> ${purchaser}</p>
      <p><strong>Total Paid:</strong> $${total}</p>
  
      <h2>✅ Purchased Products</h2>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
        <thead>
          <tr><th>Title</th><th>PID</th><th>Quantity</th><th>Price</th></tr>
        </thead>
        <tbody>${purchasedRows || "<tr><td colspan='4'>None</td></tr>"}</tbody>
      </table>
  
      <h2>❌ Not Purchased</h2>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
        <thead>
          <tr><th>Title</th><th>PID</th><th>Quantity</th><th>Price</th></tr>
        </thead>
        <tbody>${notPurchasedRows || "<tr><td colspan='4'>None</td></tr>"}</tbody>
      </table>
    `;
  };
  