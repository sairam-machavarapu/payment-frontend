import { useEffect, useState } from 'react';
import { RiBarChart2Fill, RiDatabase2Line } from 'react-icons/ri';
import { getDbName } from '../api/interceptor';

const Navbar = ({ actionButton }) => {
  const [dbName, setDbName] = useState('evergreen');

  useEffect(() => {
    setDbName(getDbName());
  }, []);

  return (
    <nav
      style={{ height: '56px', borderBottom: '0.5px solid #e5e5e5' }}
      className="sticky top-0 z-50 bg-white flex items-center px-6"
    >
      <div className="flex-1 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#534AB7' }}
        >
          <RiBarChart2Fill className="text-white text-base" />
        </div>
        <div className="leading-none flex items-center gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>
              StatementIQ
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#6b6b6b' }}>
              Smart transaction analyzer
            </p>
          </div>
          
          {/* Active Database Badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold select-none shadow-sm transition-all duration-300"
            style={{
              backgroundColor: '#EEEDFE',
              color: '#534AB7',
              border: '1px solid #534AB722',
              fontSize: '11px',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            <RiDatabase2Line size={13} style={{ color: '#534AB7' }} />
            <span>DB: {dbName}</span>
          </div>
        </div>
      </div>

      {actionButton && <div>{actionButton}</div>}
    </nav>
  );
};

export default Navbar;
