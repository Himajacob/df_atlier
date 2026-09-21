export const WORK_STATUSES = ["Received", "Completed"] as const;

export type WorkStatus = (typeof WORK_STATUSES)[number];

export interface WorkOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
  status: WorkStatus;
  description: string;
  price: number;
  paidCash: number;
  paidUpi: number;
  dueDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkOrderInput = Omit<WorkOrder, "id" | "createdAt" | "updatedAt">;

export function validateWorkOrderInput(input: WorkOrderInput): string | null {
  if (!input.customerName?.trim()) {
    return "Customer name is required.";
  }
  if (input.paidCash + input.paidUpi > input.price) {
    return "Cash + UPI cannot be greater than the total price.";
  }
  // Allow marking as Completed even if payment is not fully settled.
  // UI will indicate such completed-but-unpaid items with a different badge color.
  return null;
}

export const USER_ROLES = ["admin", "receptionist"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
