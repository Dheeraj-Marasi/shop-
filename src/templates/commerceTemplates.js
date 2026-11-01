const { createBaseEmailLayout, escapeHtml } = require('./base');

/**
 * Generate HTML & Text for Order Placement Activity
 */
function renderOrderPlacedTemplate(data) {
  const userName = data.user?.name || 'Customer';
  const activityTime = data.activity?.timestamp || new Date().toUTCString();
  const orderId = data.activity?.details?.orderId || data.activity?.metadata?.orderId || `ORD-${Date.now().toString().slice(-6)}`;
  const totalAmount = data.activity?.details?.total || data.activity?.metadata?.total || '$49.99';
  const items = data.activity?.details?.items || data.activity?.metadata?.items || [
    { name: 'Standard Product / Service', qty: 1, price: totalAmount }
  ];
  const orderUrl = data.activity?.actionUrl || `${process.env.COMPANY_WEBSITE || '#'}/orders/${orderId}`;

  const itemsHtml = Array.isArray(items) ? items.map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-weight: 500;">
        ${escapeHtml(item.name || 'Item')}
        ${item.qty ? `<span style="color: #64748b; font-size: 13px; font-weight: 400;">(x${escapeHtml(item.qty)})</span>` : ''}
      </td>
      <td align="right" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 600;">
        ${escapeHtml(item.price || '')}
      </td>
    </tr>
  `).join('') : `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">Order Items</td>
      <td align="right" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${escapeHtml(totalAmount)}</td>
    </tr>
  `;

  const contentHtml = `
    <div style="text-align: left;">
      <div style="display: inline-block; padding: 6px 12px; background: #ecfdf5; border-radius: 6px; color: #059669; font-size: 13px; font-weight: 600; margin-bottom: 16px;">
        🛒 Order Confirmed
      </div>
      
      <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
        Thank you for your order, ${escapeHtml(userName)}!
      </h1>
      
      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #475569;">
        We've received your order and are processing it right now. Here is a summary of your recent purchase:
      </p>

      <!-- Order Summary Card -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="meta-box" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 18px 22px;">
            <table role="presentation" border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 14px; margin-bottom: 12px;">
              <tr>
                <td style="color: #64748b;">Order Number:</td>
                <td align="right" style="font-weight: 700; color: #0f172a;">#${escapeHtml(orderId)}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Order Date:</td>
                <td align="right" style="color: #334155;">${escapeHtml(activityTime)}</td>
              </tr>
            </table>

            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 8px;">
              ${itemsHtml}
              <tr>
                <td style="padding: 12px 0 0 0; font-weight: 700; font-size: 15px; color: #0f172a;">Total</td>
                <td align="right" style="padding: 12px 0 0 0; font-weight: 700; font-size: 16px; color: #059669;">
                  ${escapeHtml(totalAmount)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
        <tr>
          <td align="center" style="border-radius: 6px; background: #059669;">
            <a href="${orderUrl}" target="_blank" style="font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block;">
              View Order Details & Tracking
            </a>
          </td>
        </tr>
      </table>
    </div>
  `;

  const html = createBaseEmailLayout({
    title: `Order Confirmation #${orderId}`,
    preheader: `Thank you for your order #${orderId}. Total: ${totalAmount}`,
    contentHtml
  });

  const text = `
Order Confirmation #${orderId}

Hi ${userName},

Thank you for your order!
Order Number: #${orderId}
Date: ${activityTime}
Total: ${totalAmount}

View your order status: ${orderUrl}
  `.trim();

  return {
    subject: `Order Confirmation #${orderId} [${process.env.COMPANY_NAME || 'Our Website'}]`,
    html,
    text
  };
}

module.exports = {
  renderOrderPlacedTemplate
};
