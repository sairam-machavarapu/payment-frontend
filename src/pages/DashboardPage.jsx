import { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LabelList,
} from 'recharts';
import {
  RiArrowRightSLine,
  RiWalletLine,
  RiExchangeLine,
  RiMedalLine,
  RiCalendarLine,
} from 'react-icons/ri';
import TransactionTable from '../components/TransactionTable';
import { useStatement } from '../context/StatementContext';
import { CATEGORY_COLORS } from '../data/categoryColors';

const USD = (n) => (n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '$—');

const fmtDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso; }
};

const computeWeeklySpend = (transactions) => {
  const map = {};
  transactions.forEach((t) => {
    try {
      const weekNum = Math.ceil(new Date(t.date).getDate() / 7);
      const key = `Wk ${weekNum}`;
      map[key] = (map[key] ?? 0) + t.amount;
    } catch { /* skip */ }
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, amount]) => ({ week, amount: Math.round(amount) }));
};

const CategoryBarShape = ({ x, y, width, height, payload }) => {
  const color = CATEGORY_COLORS[payload?.name] ?? '#888780';
  return <rect x={x} y={y} width={Math.max(width, 0)} height={height} fill={color} rx={3} ry={3} />;
};

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-md" style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
      <p className="font-medium mb-0.5">{entry.payload?.name ?? entry.payload?.week}</p>
      <p>{USD(entry.value)}</p>
    </div>
  );
};

const SummaryCard = ({ iconBg, iconColor, IconComp, label, value, sub }) => (
  <div className="bg-white rounded-xl p-4" style={{ border: '0.5px solid #e5e5e5' }}>
    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: iconBg }}>
      <IconComp style={{ color: iconColor, fontSize: 16 }} />
    </div>
    <p style={{ color: '#6b6b6b', fontSize: 11 }} className="mb-1">{label}</p>
    <p style={{ fontSize: 20, fontWeight: 500, color: '#1a1a1a' }}>{value}</p>
    <p style={{ color: '#6b6b6b', fontSize: 11 }} className="mt-0.5">{sub}</p>
  </div>
);

const DashboardPage = () => {
  const { statementData } = useStatement();
  const { transactions, summary, filename } = statementData;

  if (!transactions?.length) return <Navigate to="/upload" replace />;

  const displayName = filename || 'statement.pdf';

  const categoryChartData = useMemo(
    () => Object.entries(summary?.by_category ?? {}).map(([name, amount]) => ({ name, amount })),
    [summary],
  );

  const weeklyData = useMemo(() => {
    if (summary?.weekly_spend?.length) return summary.weekly_spend;
    return computeWeeklySpend(transactions);
  }, [summary, transactions]);

  const dateFrom = fmtDate(summary?.date_range?.from);
  const dateTo   = fmtDate(summary?.date_range?.to);

  return (
    <div className="px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs mb-6" style={{ color: '#6b6b6b' }}>
        <Link to="/upload" style={{ color: '#6b6b6b' }} className="hover:underline">Home</Link>
        <RiArrowRightSLine />
        <Link to="/upload" style={{ color: '#6b6b6b' }} className="hover:underline">Upload</Link>
        <RiArrowRightSLine />
        <span style={{ color: '#1a1a1a' }}>Dashboard — {displayName}</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <SummaryCard
          IconComp={RiWalletLine} iconBg="#EEEDFE" iconColor="#534AB7"
          label="Total spent" value={USD(summary?.total_spent)}
          sub={dateFrom && dateTo ? `${dateFrom} – ${dateTo}` : ''}
        />
        <SummaryCard
          IconComp={RiExchangeLine} iconBg="#E1F5EE" iconColor="#1D9E75"
          label="Transactions" value={summary?.total_transactions ?? transactions.length}
          sub="This month"
        />
        <SummaryCard
          IconComp={RiMedalLine} iconBg="#FEF3E2" iconColor="#EF9F27"
          label="Top category" value={summary?.top_category ?? '—'}
          sub={summary?.top_category_amount ? `${USD(summary.top_category_amount)} spent` : ''}
        />
        <SummaryCard
          IconComp={RiCalendarLine} iconBg="#E6F1FB" iconColor="#378ADD"
          label="Payments & Credits" value={USD(summary?.total_credits)}
          sub="Total reductions"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5" style={{ border: '0.5px solid #e5e5e5' }}>
          <p className="text-sm font-semibold mb-4" style={{ color: '#1a1a1a' }}>Spending by category</p>
          {categoryChartData.length === 0 ? (
            <p className="text-xs text-center py-16" style={{ color: '#6b6b6b' }}>No category data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart layout="vertical" data={categoryChartData} margin={{ top: 0, right: 90, bottom: 0, left: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f5f3ff' }} />
                <Bar dataKey="amount" barSize={16} shape={<CategoryBarShape />}>
                  <LabelList dataKey="amount" position="right" formatter={USD} style={{ fontSize: 11, fill: '#6b6b6b' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl p-5" style={{ border: '0.5px solid #e5e5e5' }}>
          <p className="text-sm font-semibold mb-4" style={{ color: '#1a1a1a' }}>Weekly spend ($)</p>
          {weeklyData.length === 0 ? (
            <p className="text-xs text-center py-16" style={{ color: '#6b6b6b' }}>No weekly data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`}
                  tick={{ fontSize: 12, fill: '#6b6b6b' }} axisLine={false} tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f5f3ff' }} />
                <Bar dataKey="amount" fill="#534AB7" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Transaction table */}
      <TransactionTable />
    </div>
  );
};

export default DashboardPage;
