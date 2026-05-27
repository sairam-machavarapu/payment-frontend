import { useRef, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  RiFileExcel2Line,
  RiFilePdfLine,
  RiLoader4Line,
  RiCheckLine,
  RiAlertLine,
  RiPencilLine,
} from 'react-icons/ri';
import { getCategoryStyle } from '../data/categoryColors';
import { useStatement } from '../context/StatementContext';

/* ─── constants ─── */
const ROWS_PER_PAGE = 6;

const AMOUNT_RANGES = ['All amounts', 'Under ₹500', '₹500–₹2000', 'Above ₹2000'];

/* ─── helpers ─── */
const USD = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return dateStr;
  }
};

const getPageNumbers = (curr, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set(
    [1, total, curr, curr - 1, curr + 1].filter((p) => p >= 1 && p <= total),
  );
  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) result.push('…');
    result.push(p);
    prev = p;
  }
  return result;
};

/* ─── sub-components ─── */
const CategoryBadge = ({ category }) => {
  const style = getCategoryStyle(category ?? 'Others');
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: style.bg, color: style.textColor }}
    >
      <span>{style.icon}</span>
      {category}
    </span>
  );
};

/* Score a category name against a description using token overlap */
const scoreCategory = (desc, catName) => {
  const descTokens = new Set(desc.toUpperCase().split(/\W+/).filter(Boolean));
  const catTokens  = catName.toUpperCase().split(/\W+/).filter(t => t.length > 2);
  if (!catTokens.length) return 0;
  const matched = catTokens.filter(t => descTokens.has(t)).length;
  return Math.round((matched / catTokens.length) * 100);
};

/* Custom category dropdown with per-option confidence */
const CategoryDropdown = ({ txn, allCategories, onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const scored = useMemo(() => {
    const list = allCategories.map(cat => ({
      cat,
      score: cat === txn.category ? 100 : scoreCategory(txn.description, cat),
    }));
    list.sort((a, b) => b.score - a.score);
    if (!search.trim()) return list;
    return list.filter(({ cat }) => cat.toLowerCase().includes(search.toLowerCase()));
  }, [allCategories, txn, search]);

  return (
    <div
      ref={ref}
      className="absolute z-50 bg-white rounded-xl shadow-xl"
      style={{ border: '1px solid #e5e5e5', width: 280, top: '100%', left: 0, marginTop: 4 }}
    >
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <input
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search categories…"
          className="w-full text-xs px-2.5 py-1.5 rounded-lg outline-none"
          style={{ border: '1px solid #e5e5e5', color: '#1a1a1a' }}
        />
      </div>

      {/* List */}
      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        {scored.map(({ cat, score }) => {
          const style   = getCategoryStyle(cat);
          const isCurr  = cat === txn.category;
          const barColor = score >= 70 ? '#1D9E75' : score >= 40 ? '#EF9F27' : '#E24B4A';
          return (
            <button
              key={cat}
              onMouseDown={() => { onSelect(cat); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
              style={{
                background: isCurr ? style.bg : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { if (!isCurr) e.currentTarget.style.backgroundColor = '#f8f8f6'; }}
              onMouseLeave={e => { if (!isCurr) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {/* dot */}
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: style.color }} />

              {/* name */}
              <span className="flex-1 text-xs truncate" style={{ color: isCurr ? style.color : '#1a1a1a', fontWeight: isCurr ? 600 : 400 }}>
                {cat}
              </span>

              {/* confidence bar + pct */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div style={{ width: 36, height: 3, background: '#f0f0f0', borderRadius: 2 }}>
                  <div style={{ width: `${score}%`, height: '100%', background: barColor, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 10, color: '#6b6b6b', width: 28, textAlign: 'right' }}>{score}%</span>
              </div>
            </button>
          );
        })}
        {scored.length === 0 && (
          <p className="text-xs px-3 py-3" style={{ color: '#6b6b6b' }}>No categories found</p>
        )}
      </div>
      <div style={{ height: 8 }} />
    </div>
  );
};

/* Inline category picker */
const CategoryCell = ({ txn, allCategories, onUpdate }) => {
  const [editing, setEditing] = useState(false);

  const handleSelect = (newCat) => {
    setEditing(false);
    if (newCat !== txn.category) onUpdate(newCat);
  };

  return (
    <div className="relative flex items-center gap-1.5">
      <CategoryBadge category={txn.category} />
      <button
        onClick={() => setEditing(v => !v)}
        title="Change category"
        className="flex items-center justify-center rounded p-0.5 opacity-40 hover:opacity-100 transition-opacity"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#534AB7' }}
      >
        <RiPencilLine size={12} />
      </button>
      {editing && (
        <CategoryDropdown
          txn={txn}
          allCategories={allCategories}
          onSelect={handleSelect}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
};

const ConfidenceBar = ({ value }) => {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <div style={{ width: 40, height: 4, background: '#E1F5EE', borderRadius: 2, flexShrink: 0 }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: '#1D9E75',
            borderRadius: 2,
          }}
        />
      </div>
      <span style={{ fontSize: 11, color: '#6b6b6b' }}>{pct}%</span>
    </div>
  );
};

const Toast = ({ message, type }) => (
  <div
    className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium shadow-lg z-50"
    style={{
      backgroundColor: type === 'success' ? '#E1F5EE' : '#FCEBEB',
      color: type === 'success' ? '#085041' : '#791F1F',
      border: `1px solid ${type === 'success' ? '#1D9E75' : '#E24B4A'}`,
    }}
  >
    {type === 'success' ? <RiCheckLine /> : <RiAlertLine />}
    {message}
  </div>
);

/* ─── main component ─── */
const TransactionTable = () => {
  const { statementData, setStatementData, updateFilters } = useStatement();
  const { transactions, filtered, activePage, activeCategory, amountFilter, categories = [] } = statementData;

  const handleCategoryUpdate = (txn, newCategory) => {
    // Persist rule to DB so future uploads auto-apply it
    axios.post('/api/rules', { description: txn.description, category: newCategory })
      .catch(() => {}); // fire-and-forget, UI update doesn't depend on it

    setStatementData((prev) => {
      const update = (t) =>
        t.date === txn.date && t.description === txn.description && t.amount === txn.amount
          ? { ...t, category: newCategory, confidence: 1.0 }
          : t;
      return {
        ...prev,
        transactions: prev.transactions.map(update),
        filtered: prev.filtered.map(update),
      };
    });
  };

  // All categories available for the dropdown: DB list + any extras in transactions
  const allCategories = useMemo(() => {
    const extra = [...new Set(transactions.map((t) => t.category))].filter((c) => !categories.includes(c));
    return [...categories, ...extra.sort()];
  }, [categories, transactions]);

  // Categories that actually appear in loaded transactions (deduplicated, sorted)
  const presentCategories = useMemo(() => {
    const seen = new Set(transactions.map((t) => t.category));
    return [...seen].sort();
  }, [transactions]);

  // Tabs: "All" + first 3 DB categories that appear in transactions
  const TABS = useMemo(() => {
    const presentSet = new Set(presentCategories);
    const pool = categories.length ? categories : presentCategories;
    const dbCats = pool.filter((c) => presentSet.has(c)).slice(0, 3);
    return ['All transactions', ...dbCats];
  }, [categories, presentCategories]);

  // Dropdown: all present categories + static fallbacks
  const ALL_CATEGORIES = useMemo(() => {
    const extra = ['Payment', 'Refund/Credit', 'Others'];
    const combined = [...new Set([...presentCategories, ...extra])].sort();
    return ['All categories', ...combined];
  }, [presentCategories]);

  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf,   setExportingPdf]   = useState(false);
  const [toast,          setToast]          = useState(null);

  const tableTopRef = useRef(null);

  /* Sync local category dropdown with context (may differ from tab) */
  const [catDropdown, setCatDropdown] = useState('All categories');

  useEffect(() => {
    setCatDropdown(activeCategory === 'All' ? 'All categories' : activeCategory);
  }, [activeCategory]);

  /* ── Derived values ── */
  const totalPages  = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage    = Math.min(activePage, totalPages);
  const currentRows = filtered.slice(
    (safePage - 1) * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE,
  );
  const rangeStart = filtered.length ? (safePage - 1) * ROWS_PER_PAGE + 1 : 0;
  const rangeEnd   = Math.min(safePage * ROWS_PER_PAGE, filtered.length);
  const pageNums   = useMemo(() => getPageNumbers(safePage, totalPages), [safePage, totalPages]);

  /* ── Tab click ── */
  const handleTab = (tab) => {
    const cat = tab === 'All transactions' ? 'All' : tab;
    updateFilters(cat, amountFilter);
    setCatDropdown(cat === 'All' ? 'All categories' : cat);
  };

  /* ── Category dropdown ── */
  const handleCatDropdown = (val) => {
    const cat = val === 'All categories' ? 'All' : val;
    setCatDropdown(val);
    updateFilters(cat, amountFilter);
  };

  /* ── Amount dropdown ── */
  const handleAmountDropdown = (val) => {
    updateFilters(activeCategory, val);
  };

  /* ── Page change ── */
  const setPage = (n) => {
    setStatementData((prev) => ({ ...prev, activePage: n }));
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ── Toast helper ── */
  const showToast = (message, type = 'success', duration = 2500) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  /* ── Export Excel ── */
  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const res = await axios.get('/api/export/excel', {
        responseType: 'blob',
      });
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', 'statement_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Downloaded!', 'success');
    } catch {
      showToast('Export failed. Please try again.', 'error', 3500);
    } finally {
      setExportingExcel(false);
    }
  };

  /* ── Export PDF ── */
  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const res = await axios.get('/api/export/pdf', {
        responseType: 'blob',
      });
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', 'statement_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Downloaded!', 'success');
    } catch {
      showToast('Export failed. Please try again.', 'error', 3500);
    } finally {
      setExportingPdf(false);
    }
  };

  /* ─── active tab label ─── */
  const activeTab =
    activeCategory === 'All' ? 'All transactions' : activeCategory;

  /* ─── empty state ─── */
  const noData = transactions.length === 0;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div
        ref={tableTopRef}
        className="bg-white rounded-xl"
        style={{ border: '0.5px solid #e5e5e5' }}
      >
        {/* ── Tab bar ── */}
        <div
          className="flex px-4 pt-4"
          style={{ borderBottom: '0.5px solid #e5e5e5' }}
        >
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => handleTab(tab)}
                className="px-4 py-2.5 text-xs font-medium whitespace-nowrap"
                style={{
                  color: isActive ? '#534AB7' : '#6b6b6b',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: isActive ? '2px solid #534AB7' : '2px solid transparent',
                  marginBottom: -1,
                  background: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* ── Toolbar: export + filters ── */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-wrap"
          style={{ borderBottom: '0.5px solid #e5e5e5' }}
        >
          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel || noData}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
            style={{ backgroundColor: '#1D9E75' }}
          >
            {exportingExcel
              ? <RiLoader4Line className="animate-spin" />
              : <RiFileExcel2Line />}
            Export Excel
          </button>

          {/* Export PDF */}
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf || noData}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50"
            style={{
              backgroundColor: '#FCEBEB',
              border: '1px solid #E24B4A',
              color: '#E24B4A',
            }}
          >
            {exportingPdf
              ? <RiLoader4Line className="animate-spin" />
              : <RiFilePdfLine />}
            Export PDF
          </button>

          <div className="flex-1" />

          {/* Category dropdown */}
          <select
            value={catDropdown}
            onChange={(e) => handleCatDropdown(e.target.value)}
            className="text-xs rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
            style={{ border: '0.5px solid #e5e5e5', color: '#1a1a1a', backgroundColor: '#fff' }}
          >
            {ALL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>

          {/* Amount dropdown */}
          <select
            value={amountFilter}
            onChange={(e) => handleAmountDropdown(e.target.value)}
            className="text-xs rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
            style={{ border: '0.5px solid #e5e5e5', color: '#1a1a1a', backgroundColor: '#fff' }}
          >
            {AMOUNT_RANGES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ backgroundColor: '#fafafa' }}>
                {['Date', 'Description', 'Amount', 'Category', 'Confidence'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs font-medium uppercase tracking-wide"
                    style={{ color: '#6b6b6b' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {noData ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm"
                    style={{ color: '#6b6b6b' }}
                  >
                    No transactions found in this file. Please check the format and try again.
                  </td>
                </tr>
              ) : currentRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm"
                    style={{ color: '#6b6b6b' }}
                  >
                    No transactions match this filter.
                  </td>
                </tr>
              ) : (
                currentRows.map((txn, i) => (
                  <tr
                    key={i}
                    className="hover:bg-[#fafafa] transition-colors"
                    style={{ borderTop: '0.5px solid #f0f0f0' }}
                  >
                    <td className="px-4 py-3 text-xs" style={{ color: '#6b6b6b' }}>
                      {formatDate(txn.date)}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#1a1a1a' }}>
                      {txn.description}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#1a1a1a' }}>
                      {USD(txn.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <CategoryCell
                        txn={txn}
                        allCategories={allCategories}
                        onUpdate={(newCat) => handleCategoryUpdate(txn, newCat)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ConfidenceBar value={txn.confidence} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer: count + pagination ── */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-wrap gap-2"
          style={{ borderTop: '0.5px solid #f0f0f0' }}
        >
          <span className="text-xs" style={{ color: '#6b6b6b' }}>
            {filtered.length === 0
              ? 'No transactions'
              : `Showing ${rangeStart}–${rangeEnd} of ${filtered.length} transactions`}
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {pageNums.map((p, idx) =>
                p === '…' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="text-xs px-1"
                    style={{ color: '#6b6b6b' }}
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-7 h-7 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: p === safePage ? '#534AB7' : 'transparent',
                      color: p === safePage ? '#fff' : '#6b6b6b',
                      border: p === safePage ? 'none' : '0.5px solid #e5e5e5',
                      cursor: 'pointer',
                    }}
                  >
                    {p}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TransactionTable;