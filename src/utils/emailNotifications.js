import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_83wvqz8';
const PUBLIC_KEY = 'dSfvOLvYSswJAOsWS';

// Free account only allows 2 templates, so we consolidate:
const TEMPLATE_ORDER_PLACED = 'template_order_placed';    // For new orders
const TEMPLATE_STATUS_UPDATE = 'template_status_update';  // For shipped/delivered/return

emailjs.init(PUBLIC_KEY);

export const sendOrderConfirmationEmail = async ({ orderId, customerName, customerEmail, items, total, paymentMethod }) => {
  const itemsList = items.map(i => `• ${i.title} × ${i.qty} = ₹${i.price * i.qty}`).join('\n');

  return emailjs.send(SERVICE_ID, TEMPLATE_ORDER_PLACED, {
    to_name: customerName,
    to_email: customerEmail,
    order_id: orderId,
    items_list: itemsList,
    total: `₹${total}`,
    payment_method: paymentMethod,
    shop_name: 'BookshiBooks',
  });
};

export const sendShippedEmail = async ({ orderId, customerName, customerEmail, trackingNumber, courierName }) => {
  return emailjs.send(SERVICE_ID, TEMPLATE_STATUS_UPDATE, {
    to_name: customerName,
    to_email: customerEmail,
    order_id: orderId,
    subject_line: `Your Order ${orderId} has been Shipped! 🚚`,
    message_body: `Great news! Your order has been shipped via ${courierName || 'our courier partner'}.\n\nTracking Number: ${trackingNumber || 'Will be updated soon'}\n\nYou can track this on the courier's website.`,
    shop_name: 'BookshiBooks',
  });
};

export const sendDeliveredEmail = async ({ orderId, customerName, customerEmail }) => {
  return emailjs.send(SERVICE_ID, TEMPLATE_STATUS_UPDATE, {
    to_name: customerName,
    to_email: customerEmail,
    order_id: orderId,
    subject_line: `Your Order ${orderId} has been Delivered! ✅`,
    message_body: `Your order has been successfully delivered! We hope you enjoy your books.\n\nIf you have any issues, you can request a return from your profile within 7 days.`,
    shop_name: 'BookshiBooks',
  });
};

export const sendReturnRequestEmail = async ({ orderId, customerName, customerEmail, reason }) => {
  return emailjs.send(SERVICE_ID, TEMPLATE_STATUS_UPDATE, {
    to_name: 'Admin',
    to_email: 'vikram4126@gmail.com', // Replace with admin email if needed
    order_id: orderId,
    subject_line: `New Return Request - ${orderId} ⚠️`,
    message_body: `Customer: ${customerName} (${customerEmail})\n\nHas requested a return for the following reason:\n"${reason}"\n\nPlease check the Admin Panel to approve or reject this request.`,
    shop_name: 'BookshiBooks System',
  });
};
