import {
  useAdminListOrders,
  useAdminUpdateOrderStatus,
  getAdminListOrdersQueryKey,
  getGetAdminStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { AdminNav } from "./index";
import { AdminLockout } from "./_lockout";
import { formatPKR } from "@/lib/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminOrders() {
  const { role } = useAuth();
  if (role !== "admin") return <AdminLockout />;

  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useAdminListOrders();
  const update = useAdminUpdateOrderStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListOrdersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        toast.success("Status updated");
      },
      onError: () => toast.error("Could not update status"),
    },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <AdminNav />
      <div className="mb-8">
        <h1 className="text-4xl font-serif text-foreground">Orders</h1>
        <p className="text-muted-foreground">
          {orders?.length ?? 0} orders received
        </p>
      </div>

      <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-medium">#</th>
                <th className="text-left px-5 py-3 font-medium">Customer</th>
                <th className="text-left px-5 py-3 font-medium">Phone</th>
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-right px-5 py-3 font-medium">Items</th>
                <th className="text-right px-5 py-3 font-medium">Total</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : !orders || orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                    No orders yet
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-secondary/20" data-testid={`order-${o.id}`}>
                    <td className="px-5 py-4 text-muted-foreground">#{o.id}</td>
                    <td className="px-5 py-4 font-medium">{o.customerName}</td>
                    <td className="px-5 py-4 text-muted-foreground tabular-nums">{o.phone}</td>
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums">
                      {o.items.reduce((acc, it) => acc + it.quantity, 0)}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums font-medium">
                      {formatPKR(o.total)}
                    </td>
                    <td className="px-5 py-4">
                      <Select
                        value={o.status}
                        onValueChange={(v) =>
                          update.mutate({ id: o.id, data: { status: v as "pending" | "shipped" | "delivered" | "cancelled" } })
                        }
                      >
                        <SelectTrigger className="w-36 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["pending", "shipped", "delivered", "cancelled"].map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
