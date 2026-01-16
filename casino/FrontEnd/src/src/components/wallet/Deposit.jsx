// src/components/wallet/WalletOverview.jsx
import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/helpers';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';

const WalletOverview = () => {
  const {
    wallets,
    loading,
    error,
    getCashBalance,
    getBonusBalance,
    getPointsBalance,
  } = useWallet();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  if (loading) return <Loading message="Loading wallet..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Wallet</h1>
          <p className="text-gray-600">Manage your funds</p>
        </div>
        <div className="flex space-x-4">
          <Button
            onClick={() => setShowDeposit(true)}
            variant="primary"
            size="lg"
          >
            💰 Deposit
          </Button>
          <Button
            onClick={() => setShowWithdraw(true)}
            variant="secondary"
            size="lg"
          >
            💸 Withdraw
          </Button>
        </div>
      </div>

      <ErrorMessage message={error} />

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Cash Wallet */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-5xl">💵</div>
            <div className="text-right">
              <p className="text-green-100 text-sm font-semibold">CASH BALANCE</p>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-4xl font-bold">{formatCurrency(getCashBalance())}</p>
          </div>
          <p className="text-green-100 text-sm">Available for play</p>
        </div>

        {/* Bonus Wallet */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-5xl">🎁</div>
            <div className="text-right">
              <p className="text-purple-100 text-sm font-semibold">BONUS BALANCE</p>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-4xl font-bold">{formatCurrency(getBonusBalance())}</p>
          </div>
          <p className="text-purple-100 text-sm">Promotional funds</p>
        </div>

        {/* Points Wallet */}
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-5xl">⭐</div>
            <div className="text-right">
              <p className="text-yellow-100 text-sm font-semibold">POINTS BALANCE</p>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-4xl font-bold">{getPointsBalance().toFixed(0)}</p>
          </div>
          <p className="text-yellow-100 text-sm">Loyalty points</p>
        </div>
      </div>

      {/* Wallet Details Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-bold text-gray-900">All Wallets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Wallet Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Wallet ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wallets.map((wallet) => (
                <tr key={wallet.wallet_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`
                      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                      ${wallet.wallet_type === 'cash' ? 'bg-green-100 text-green-800' : ''}
                      ${wallet.wallet_type === 'bonus' ? 'bg-purple-100 text-purple-800' : ''}
                      ${wallet.wallet_type === 'points' ? 'bg-yellow-100 text-yellow-800' : ''}
                    `}>
                      {wallet.wallet_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900">
                    {wallet.wallet_type === 'points'
                      ? parseFloat(wallet.balance).toFixed(0)
                      : formatCurrency(wallet.balance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    #{wallet.wallet_id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showDeposit && (
        <DepositModal onClose={() => setShowDeposit(false)} />
      )}

      {showWithdraw && (
        <WithdrawModal
          onClose={() => setShowWithdraw(false)}
          maxAmount={getCashBalance()}
        />
      )}
    </div>
  );
};

export default WalletOverview;


// src/components/wallet/DepositModal.jsx
import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import Modal from '../common/Modal';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import Input from '../common/Input';
import Button from '../common/Button';

const DepositModal = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { deposit } = useWallet();

  const quickAmounts = [10, 50, 100, 500, 1000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const depositAmount = parseFloat(amount);

    if (depositAmount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    const result = await deposit(depositAmount);
    setLoading(false);

    if (result.success) {
      setSuccess(`Successfully deposited $${depositAmount.toFixed(2)}`);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setError(result.error);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Deposit Funds">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorMessage message={error} onClose={() => setError('')} />
        <SuccessMessage message={success} onClose={() => setSuccess('')} />

        <Input
          label="Amount ($)"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          required
        />

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Quick amounts:</p>
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt.toString())}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Processing...' : 'Deposit'}
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-blue-800">💡 Funds are added instantly</p>
          <p className="text-sm text-blue-800">🔒 All transactions are secure</p>
        </div>
      </form>
    </Modal>
  );
};

export default DepositModal;


// src/components/wallet/WithdrawModal.jsx
import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import Modal from '../common/Modal';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import Input from '../common/Input';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/helpers';

const WithdrawModal = ({ onClose, maxAmount }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { withdraw } = useWallet();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (withdrawAmount > maxAmount) {
      setError(`Insufficient balance. Maximum: ${formatCurrency(maxAmount)}`);
      return;
    }

    setLoading(true);
    const result = await withdraw(withdrawAmount);
    setLoading(false);

    if (result.success) {
      setSuccess(`Successfully withdrew ${formatCurrency(withdrawAmount)}`);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setError(result.error);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Withdraw Funds">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorMessage message={error} onClose={() => setError('')} />
        <SuccessMessage message={success} onClose={() => setSuccess('')} />

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-green-800">
            Available Balance: {formatCurrency(maxAmount)}
          </p>
        </div>

        <Input
          label="Amount ($)"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          max={maxAmount}
          required
        />

        <button
          type="button"
          onClick={() => setAmount(maxAmount.toString())}
          className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
        >
          Withdraw All
        </button>

        <div className="flex space-x-3 mt-6">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Processing...' : 'Withdraw'}
          </Button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-yellow-800">⏱️ Processed in 24-48 hours</p>
          <p className="text-sm text-yellow-800">🔒 Secure transaction</p>
        </div>
      </form>
    </Modal>
  );
};

export default WithdrawModal;