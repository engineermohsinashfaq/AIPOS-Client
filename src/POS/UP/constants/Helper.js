export function getStatus(quantity) {
  if (quantity === 0) return "Out of Stock";
  if (quantity < 5) return "Low Stock";
  return "Available";
}

export function generateInvoiceId() {
  const last = localStorage.getItem("last_invoice_id");
  if (!last) {
    localStorage.setItem("last_invoice_id", "INV-000001");
    return "INV-000001";
  }
  const num = parseInt(last.replace("INV-", ""), 10) + 1;
  const newId = `INV-${num.toString().padStart(6, "0")}`;
  localStorage.setItem("last_invoice_id", newId);
  return newId;
}
