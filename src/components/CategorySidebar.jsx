import { useState } from 'react';
import axios from 'axios';
import { RiGridLine, RiAddLine, RiCloseLine, RiLoader4Line } from 'react-icons/ri';
import { useStatement } from '../context/StatementContext';
import { getCategoryStyle, seedCategoryColors } from '../data/categoryColors';

const USD = (n) =>
  n ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : null;

const FREQUENCIES = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'one-time'];

const Field = ({ label, error, children }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium mb-1" style={{ color: '#1a1a1a' }}>{label}</label>
    {children}
    {error && <p className="text-xs mt-0.5" style={{ color: '#E24B4A' }}>{error}</p>}
  </div>
);

const inputStyle = (hasErr) => ({
  border: `1px solid ${hasErr ? '#E24B4A' : '#e5e5e5'}`,
  color: '#1a1a1a', backgroundColor: '#fff',
  width: '100%', borderRadius: 8, padding: '6px 10px',
  fontSize: 12, outline: 'none',
});

/* ─── Add Category Modal ─── */
const AddCategoryModal = ({ onClose, onAdded }) => {
  const [form, setForm] = useState({
    name: '', frequency: 'monthly',
    contactName: '', contactEmail: '', contactPhone: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail))
      errs.contactEmail = 'Invalid email';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const { data } = await axios.post('/api/categories', {
        name: form.name.trim(),
        frequency: form.frequency,
        contactInfo: {
          name:  form.contactName.trim(),
          email: form.contactEmail.trim(),
          phone: form.contactPhone.trim(),
        },
      });
      seedCategoryColors([data.name]);
      onAdded(data.name);
      onClose();
    } catch (err) {
      setErrors({ name: err.response?.data?.detail ?? 'Failed to save. Try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl"
        style={{ border: '0.5px solid #e5e5e5', width: 380 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '0.5px solid #f0f0f0' }}>
          <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>Add category</p>
          <button onClick={onClose} style={{ color: '#6b6b6b', background: 'none', border: 'none', cursor: 'pointer' }}>
            <RiCloseLine size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4">
          {/* Name */}
          <Field label="Category name *" error={errors.name}>
            <input
              autoFocus
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Office Supplies"
              style={inputStyle(errors.name)}
            />
          </Field>

          {/* Frequency */}
          <Field label="Frequency">
            <select value={form.frequency} onChange={set('frequency')} style={inputStyle(false)}>
              {FREQUENCIES.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
            </select>
          </Field>

          {/* Contact info section */}
          <p className="text-xs font-semibold uppercase tracking-wide mb-2 mt-1" style={{ color: '#6b6b6b' }}>
            Contact info <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span>
          </p>

          <Field label="Name" error={errors.contactName}>
            <input value={form.contactName} onChange={set('contactName')} placeholder="Contact name" style={inputStyle(false)} />
          </Field>

          <Field label="Email" error={errors.contactEmail}>
            <input value={form.contactEmail} onChange={set('contactEmail')} placeholder="email@example.com" style={inputStyle(errors.contactEmail)} />
          </Field>

          <Field label="Phone" error={errors.contactPhone}>
            <input value={form.contactPhone} onChange={set('contactPhone')} placeholder="+1 234 567 8900" style={inputStyle(false)} />
          </Field>

          {/* Actions */}
          <div className="flex gap-2 justify-end mt-2">
            <button
              type="button" onClick={onClose}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ border: '0.5px solid #e5e5e5', color: '#6b6b6b', background: 'none', cursor: 'pointer' }}
            >Cancel</button>
            <button
              type="submit" disabled={saving}
              className="text-xs px-4 py-1.5 rounded-lg text-white inline-flex items-center gap-1 disabled:opacity-50"
              style={{ backgroundColor: '#534AB7', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving && <RiLoader4Line className="animate-spin" />}
              Save category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Single sidebar row ─── */
const SidebarItem = ({ name, count, amount, isActive, onClick }) => {
  const style = getCategoryStyle(name);
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors"
      style={{
        backgroundColor: isActive ? style.bg : 'transparent',
        border: isActive ? `1px solid ${style.color}22` : '1px solid transparent',
        cursor: 'pointer',
      }}
    >
      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: style.color }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: isActive ? style.color : '#1a1a1a' }}>
          {name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#6b6b6b' }}>
          {count != null ? `${count} txn${count !== 1 ? 's' : ''}` : 'No transactions'}
          {amount ? ` · ${USD(amount)}` : ''}
        </p>
      </div>
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
const CategorySidebar = () => {
  const { statementData, updateFilters, refreshCategories } = useStatement();
  const { transactions = [], categories = [], activeCategory, amountFilter } = statementData;

  const [showModal, setShowModal] = useState(false);

  /* Per-category stats */
  const categoryStats = {};
  transactions.forEach((t) => {
    if (!categoryStats[t.category]) categoryStats[t.category] = { count: 0, amount: 0 };
    categoryStats[t.category].count += 1;
    if (t.amount > 0) categoryStats[t.category].amount += t.amount;
  });

  /* All DB categories + any extras from transactions */
  const inTransactions = new Set(transactions.map((t) => t.category));
  const extra = [...inTransactions].filter((c) => !categories.includes(c)).sort();
  const sidebarCategories = [...categories, ...extra];

  const handleClick = (cat) => {
    if (!transactions.length) return;
    const next = activeCategory === cat ? 'All' : cat;
    updateFilters(next, amountFilter ?? 'All amounts');
  };

  const handleAdded = () => {
    refreshCategories();
  };

  return (
    <>
      <aside
        className="flex flex-col"
        style={{
          width: 220,
          minWidth: 220,
          borderRight: '0.5px solid #e5e5e5',
          backgroundColor: '#fff',
          position: 'sticky',
          top: 56,
          height: 'calc(100vh - 56px)',
          overflowY: 'auto',
        }}
      >
        {/* All transactions button */}
        <div className="px-3 pt-4 pb-2">
          <button
            onClick={() => transactions.length && updateFilters('All', amountFilter ?? 'All amounts')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors"
            style={{
              backgroundColor: activeCategory === 'All' ? '#EEEDFE' : 'transparent',
              border: activeCategory === 'All' ? '1px solid #534AB722' : '1px solid transparent',
              cursor: transactions.length ? 'pointer' : 'default',
            }}
          >
            <RiGridLine style={{ color: '#534AB7', fontSize: 14 }} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium" style={{ color: activeCategory === 'All' ? '#534AB7' : '#1a1a1a' }}>
                All transactions
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#6b6b6b' }}>
                {transactions.length} total
              </p>
            </div>
          </button>
        </div>

        {/* Header + Add button */}
        <div className="px-4 pb-1 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6b6b6b' }}>
            Categories
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
            style={{ color: '#534AB7', background: '#EEEDFE', border: 'none', cursor: 'pointer' }}
          >
            <RiAddLine size={13} /> Add
          </button>
        </div>

        {/* Category list */}
        <div className="px-3 pb-4 flex flex-col gap-0.5">
          {sidebarCategories.length === 0 ? (
            <p className="text-xs px-3 py-2" style={{ color: '#6b6b6b' }}>No categories yet</p>
          ) : (
            sidebarCategories.map((cat) => (
              <SidebarItem
                key={cat}
                name={cat}
                count={categoryStats[cat]?.count ?? 0}
                amount={categoryStats[cat]?.amount}
                isActive={activeCategory === cat}
                onClick={() => handleClick(cat)}
              />
            ))
          )}
        </div>
      </aside>

      {showModal && (
        <AddCategoryModal
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}
    </>
  );
};

export default CategorySidebar;
