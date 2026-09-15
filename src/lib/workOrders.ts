import { query } from "./db";
import type { WorkOrder, WorkOrderInput, WorkStatus } from "./types";

export { describeDbError } from "./db";

interface WorkOrderRow {
  id: string;
  customer_name: string;
  customer_phone: string;
  quantity: number;
  status: string;
  description: string;
  price: string;
  paid_cash: string;
  paid_upi: string;
  due_date: string;
  notes: string;
  created_at: Date;
  updated_at: Date;
}

function fromRow(row: WorkOrderRow): WorkOrder {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    quantity: row.quantity,
    status: row.status as WorkStatus,
    description: row.description,
    price: Number(row.price),
    paidCash: Number(row.paid_cash),
    paidUpi: Number(row.paid_upi),
    dueDate: row.due_date,
    notes: row.notes,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listWorks(): Promise<WorkOrder[]> {
  const result = await query<WorkOrderRow>(
    "SELECT * FROM work_orders ORDER BY created_at DESC"
  );
  return result.rows.map(fromRow);
}

export async function searchWorks(term: string): Promise<WorkOrder[]> {
  const result = await query<WorkOrderRow>(
    `SELECT * FROM work_orders
     WHERE customer_name ILIKE $1 OR description ILIKE $1 OR notes ILIKE $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [`%${term}%`]
  );
  return result.rows.map(fromRow);
}

export async function getWork(id: string): Promise<WorkOrder | null> {
  const result = await query<WorkOrderRow>(
    "SELECT * FROM work_orders WHERE id = $1",
    [id]
  );
  return result.rows[0] ? fromRow(result.rows[0]) : null;
}

export async function createWork(input: WorkOrderInput): Promise<WorkOrder> {
  const id = crypto.randomUUID();
  const result = await query<WorkOrderRow>(
    `INSERT INTO work_orders
      (id, customer_name, customer_phone, quantity, status, description, price, paid_cash, paid_upi, due_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      id,
      input.customerName,
      input.customerPhone,
      input.quantity,
      input.status,
      input.description,
      input.price,
      input.paidCash,
      input.paidUpi,
      input.dueDate,
      input.notes,
    ]
  );
  return fromRow(result.rows[0]);
}

export async function updateWork(
  id: string,
  input: WorkOrderInput
): Promise<WorkOrder | null> {
  const result = await query<WorkOrderRow>(
    `UPDATE work_orders SET
      customer_name = $2,
      customer_phone = $3,
      quantity = $4,
      status = $5,
      description = $6,
      price = $7,
      paid_cash = $8,
      paid_upi = $9,
      due_date = $10,
      notes = $11,
      updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      input.customerName,
      input.customerPhone,
      input.quantity,
      input.status,
      input.description,
      input.price,
      input.paidCash,
      input.paidUpi,
      input.dueDate,
      input.notes,
    ]
  );
  return result.rows[0] ? fromRow(result.rows[0]) : null;
}

export async function deleteWork(id: string): Promise<void> {
  await query("DELETE FROM work_orders WHERE id = $1", [id]);
}
