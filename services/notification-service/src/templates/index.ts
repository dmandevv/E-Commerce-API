
export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: 'Welcome to our store!',
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Your account has been created successfully.</p>
      <p>Start browsing our products and find something you love.</p>
    `,
  };
}

export function orderConfirmation(
  orderId: string,
  total: number,
  itemCount: number
): { subject: string; html: string } {
  return {
    subject: `Order Confirmed — #${orderId.slice(0, 8)}`,
    html: `
      <h1>Order Confirmed</h1>
      <p>Your order <strong>#${orderId.slice(0, 8)}</strong> has been placed.</p>
      <p>Items: ${itemCount} | Total: $${total.toFixed(2)}</p>
      <p>We'll notify you when payment is processed.</p>
    `,
  };
}

export function paymentReceipt(
  orderId: string,
  amount: number
): { subject: string; html: string } {
  return {
    subject: `Payment Receipt — #${orderId.slice(0, 8)}`,
    html: `
      <h1>Payment Received</h1>
      <p>We've received your payment of <strong>$${amount.toFixed(2)}</strong>
         for order #${orderId.slice(0, 8)}.</p>
      <p>Your order is now being processed.</p>
    `,
  };
}

export function paymentFailed(
  orderId: string,
  reason: string
): { subject: string; html: string } {
  return {
    subject: `Payment Failed — #${orderId.slice(0, 8)}`,
    html: `
      <h1>Payment Failed</h1>
      <p>Your payment for order #${orderId.slice(0, 8)} could not be processed.</p>
      <p>Reason: ${reason}</p>
      <p>Please try again or use a different payment method.</p>
    `,
  };
}

export function orderStatusUpdate(
  orderId: string,
  newStatus: string
): { subject: string; html: string } {
  return {
    subject: `Order Update — #${orderId.slice(0, 8)}`,
    html: `
      <h1>Order Update</h1>
      <p>Your order #${orderId.slice(0, 8)} status has been updated to:
         <strong>${newStatus}</strong></p>
    `,
  };
}
