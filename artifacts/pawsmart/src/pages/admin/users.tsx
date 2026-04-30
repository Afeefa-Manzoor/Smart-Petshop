import { useAdminListUsers } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { AdminNav } from "./index";
import { AdminLockout } from "./_lockout";
import { Badge } from "@/components/ui/badge";

export default function AdminUsers() {
  const { role } = useAuth();
  if (role !== "admin") return <AdminLockout />;

  const { data: users, isLoading } = useAdminListUsers();

  return (
    <div className="container mx-auto px-4 py-12">
      <AdminNav />
      <div className="mb-8">
        <h1 className="text-4xl font-serif text-foreground">Customers</h1>
        <p className="text-muted-foreground">
          {users?.length ?? 0} accounts
        </p>
      </div>

      <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Name</th>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">Role</th>
                <th className="text-right px-5 py-3 font-medium">Orders</th>
                <th className="text-left px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : !users || users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    No customers yet
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-secondary/20">
                    <td className="px-5 py-4 font-medium">{u.name}</td>
                    <td className="px-5 py-4 text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-4">
                      <Badge
                        variant="outline"
                        className={`capitalize ${
                          u.role === "admin"
                            ? "bg-primary/15 text-primary border-primary/30"
                            : ""
                        }`}
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums">
                      {u.orderCount}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
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
