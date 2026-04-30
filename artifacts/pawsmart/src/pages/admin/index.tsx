import { Link } from "wouter";
import {
  useGetAdminStats,
  useGetAdminRecentActivity,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { formatPKR } from "@/lib/currency";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Banknote,
  ShoppingBag,
  Package,
  Users,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { AdminLockout } from "./_lockout";

export default function AdminDashboard() {
  const { role } = useAuth();
  if (role !== "admin") return <AdminLockout />;

  const { data: stats, isLoading } = useGetAdminStats();
  const { data: activity } = useGetAdminRecentActivity();

  if (isLoading || !stats) {
    return (
      <div className="container mx-auto px-4 py-20 text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  const cards = [
    {
      label: "Revenue",
      value: formatPKR(stats.totalRevenue),
      icon: Banknote,
      tone: "bg-primary/15 text-primary",
    },
    {
      label: "Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      tone: "bg-amber-100 text-amber-700",
    },
    {
      label: "Products",
      value: stats.totalProducts.toString(),
      icon: Package,
      tone: "bg-rose-100 text-rose-700",
    },
    {
      label: "Customers",
      value: stats.totalUsers.toString(),
      icon: Users,
      tone: "bg-blue-100 text-blue-700",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <AdminNav />

      <div className="mb-10">
        <h1 className="text-4xl font-serif text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          A live look at how PawSmart is doing today.
        </p>
      </div>

      {stats.lowStockCount > 0 && (
        <div className="mb-8 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <AlertCircle className="h-5 w-5 text-amber-700" />
          <p className="text-sm text-amber-900">
            <strong>{stats.lowStockCount}</strong> product
            {stats.lowStockCount > 1 ? "s are" : " is"} low on stock —{" "}
            <Link href="/admin/products" className="underline font-medium">
              review inventory
            </Link>
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="bg-card border border-card-border rounded-2xl p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </p>
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center ${c.tone}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-serif text-foreground">{c.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 bg-card border border-card-border rounded-2xl p-6">
          <h2 className="font-serif text-xl mb-1">Revenue — Last 14 days</h2>
          <p className="text-xs text-muted-foreground mb-5">
            Daily totals in PKR
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={stats.revenueByDay}
              margin={{ left: 0, right: 10, top: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(d) =>
                  new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short" })
                }
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                formatter={(v: number) => formatPKR(v)}
                labelFormatter={(d) =>
                  new Date(d).toLocaleDateString("en-PK", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-6">
          <h2 className="font-serif text-xl mb-5">Orders by Status</h2>
          <ul className="space-y-3">
            {stats.ordersByStatus.map((s) => (
              <li key={s.status} className="flex items-center justify-between">
                <span className="capitalize text-sm">{s.status}</span>
                <div className="flex-1 mx-3 h-2 bg-secondary/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${stats.totalOrders ? (s.count / stats.totalOrders) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium tabular-nums w-8 text-right">
                  {s.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-card-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-xl">Top Products</h2>
            <Link
              href="/admin/products"
              className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
            >
              All products <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sales data will appear after the first orders.
            </p>
          ) : (
            <ul className="space-y-3">
              {stats.topProducts.map((p) => (
                <li
                  key={p.productId}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium truncate">{p.name}</span>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{p.totalSold} sold</span>
                    <span className="font-medium text-foreground">
                      {formatPKR(p.revenue)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-6">
          <h2 className="font-serif text-xl mb-5">Recent Activity</h2>
          {!activity || activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {activity.slice(0, 8).map((a, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm border-b border-card-border last:border-0 pb-3 last:pb-0"
                >
                  <span
                    className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                      a.type === "order" ? "bg-primary" : "bg-accent"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {a.subtitle}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(a.createdAt).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminNav() {
  const items = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/users", label: "Users" },
  ];
  return (
    <nav className="flex flex-wrap gap-1 mb-10 p-1 bg-card border border-card-border rounded-full self-start">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className="px-4 py-1.5 text-sm rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
