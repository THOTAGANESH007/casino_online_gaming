// src/components/games/Dice.jsx
import React, { useState, useEffect } from 'react';
import { diceAPI } from '../../api/games';
import { useWallet } from '../../hooks/useWallet';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button';
import Input from '../common/Input';
import { formatCurrency, generateRandomSeed } from '../../utils/helpers';

const Dice = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [target, setTarget] = useState(50);
  const [rollOver, setRollOver] = useState(true);
  const [multiplier, setMultiplier] = useState(1.98);
  const [winChance, setWinChance] = useState(50);
  const [clientSeed, setClientSeed] = useState('');
  const [nonce, setNonce] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getCashBalance, fetchWallets } = useWallet();

  useEffect(() => {
    setClientSeed(generateRandomSeed());
  }, []);

  useEffect(() => {
    calculateMultiplier();
  }, [target, rollOver]);

  const calculateMultiplier = async () => {
    try {
      const data = await diceAPI.calculateMultiplier(target, rollOver);
      setMultiplier(data.multiplier);
      setWinChance(data.win_chance);
    } catch (err) {
      console.error('Failed to calculate multiplier');
    }
  };

  const handleRoll = async () => {
    if (betAmount > getCashBalance()) {
      setError('Insufficient balance');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const data = await diceAPI.roll(betAmount, target, rollOver, clientSeed, nonce);
      setResult(data);
      setNonce(nonce + 1);
      await fetchWallets();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to roll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">🎲 Provably Fair Dice</h1>
            <p className="text-blue-100">Cryptographically verifiable outcomes</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm mb-1">Balance</p>
            <p className="text-3xl font-bold">{formatCurrency(getCashBalance())}</p>
          </div>
        </div>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Game Controls</h2>

          <div className="space-y-4">
            <Input
              label="Bet Amount ($)"
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(parseFloat(e.target.value))}
              min="1"
              step="1"
            />

            <div>
              <label className="label">Target Number: {target.toFixed(2)}</label>
              <input
                type="range"
                value={target}
                onChange={(e) => setTarget(parseFloat(e.target.value))}
                min="0.01"
                max="99.99"
                step="0.01"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="label">Roll Type</label>
              <select
                value={rollOver}
                onChange={(e) => setRollOver(e.target.value === 'true')}
                className="input"
              >
                <option value="true">Roll Over</option>
                <option value="false">Roll Under</option>
              </select>
            </div>

            {/* Game Info */}
            <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold">Win Chance:</span>
                <span className="text-xl font-bold text-primary-600">{winChance.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold">Multiplier:</span>
                <span className="text-xl font-bold text-primary-600">{multiplier.toFixed(4)}x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold">Potential Win:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(betAmount * multiplier)}
                </span>
              </div>
            </div>

            <Button
              onClick={handleRoll}
              disabled={loading}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {loading ? 'Rolling...' : '🎲 Roll Dice'}
            </Button>
          </div>
        </div>

        {/* Result */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Result</h2>

          {result ? (
            <div className={`
              rounded-xl p-8 text-center
              ${result.won 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                : 'bg-gradient-to-r from-red-500 to-pink-600 text-white'}
            `}>
              <div className="text-7xl font-bold mb-4">{result.roll_result}</div>
              <h3 className="text-3xl font-bold mb-4">
                {result.won ? '✅ You Win!' : '❌ You Lose'}
              </h3>
              <div className="space-y-2">
                <p className="text-xl">
                  Target: {rollOver ? '>' : '<'} {result.target}
                </p>
                {result.won && (
                  <p className="text-2xl font-bold">
                    Payout: {formatCurrency(result.payout)}
                  </p>
                )}
              </div>

              {/* Provably Fair Info */}
              <div className="mt-6 bg-white/20 rounded-lg p-4 text-left">
                <h4 className="font-bold mb-2">Provably Fair Verification</h4>
                <p className="text-sm break-all">
                  <strong>Server Seed:</strong> {result.server_seed.substring(0, 20)}...
                </p>
                <p className="text-sm">
                  <strong>Client Seed:</strong> {result.client_seed}
                </p>
                <p className="text-sm">
                  <strong>Nonce:</strong> {result.nonce}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎲</div>
              <p className="text-gray-600">Roll the dice to see your result</p>
            </div>
          )}
        </div>
      </div>

      {/* Provably Fair Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Provably Fair Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Client Seed"
            type="text"
            value={clientSeed}
            onChange={(e) => setClientSeed(e.target.value)}
          />
          <Input
            label="Nonce"
            type="number"
            value={nonce}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default Dice;


// src/components/games/Slots.jsx
import React, { useState } from 'react';
import { slotsAPI } from '../../api/games';
import { useWallet } from '../../hooks/useWallet';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button';
import Input from '../common/Input';
import { formatCurrency } from '../../utils/helpers';

const Slots = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [spinning, setSpinning] = useState(false);
  const { getCashBalance, fetchWallets } = useWallet();

  const handleSpin = async () => {
    if (betAmount > getCashBalance()) {
      setError('Insufficient balance');
      return;
    }

    setError('');
    setLoading(true);
    setSpinning(true);
    setResult(null);

    // Add spinning animation delay
    setTimeout(async () => {
      try {
        const data = await slotsAPI.spin(betAmount);
        setResult(data);
        await fetchWallets();
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to spin');
      } finally {
        setLoading(false);
        setSpinning(false);
      }
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-lg p-6 text-white mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">🎰 Slots</h1>
            <p className="text-green-100">3x3 slot machine</p>
          </div>
          <div className="text-right">
            <p className="text-green-100 text-sm mb-1">Balance</p>
            <p className="text-3xl font-bold">{formatCurrency(getCashBalance())}</p>
          </div>
        </div>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Bet Controls */}
        <div className="max-w-md mx-auto mb-8">
          <Input
            label="Bet Amount ($)"
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(parseFloat(e.target.value))}
            min="1"
            step="1"
          />

          <Button
            onClick={handleSpin}
            disabled={loading}
            variant="primary"
            size="lg"
            className="w-full mt-4"
          >
            {loading ? 'Spinning...' : '🎰 Spin'}
          </Button>
        </div>

        {/* Slot Grid */}
        {result && (
          <div className="mb-8">
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {result.grid.map((row, rowIdx) =>
                row.map((symbol, colIdx) => (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={`
                      bg-gradient-to-br from-purple-500 to-indigo-600 
                      rounded-xl p-6 text-center text-6xl
                      ${spinning ? 'animate-pulse' : 'animate-in'}
                    `}
                  >
                    {symbol}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Result */}
        {result && !spinning && (
          <div className="text-center">
            {result.wins.length > 0 ? (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 mb-6">
                <h2 className="text-4xl font-bold mb-4">🎉 You Win!</h2>
                <p className="text-3xl font-bold">{formatCurrency(result.payout)}</p>
                <p className="text-xl mt-2">Multiplier: {result.total_multiplier}x</p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl p-6 mb-6">
                <h2 className="text-3xl font-bold">No Win</h2>
                <p className="text-gray-200 mt-2">Try again!</p>
              </div>
            )}

            {/* Winning Lines */}
            {result.wins.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold mb-2">Winning Lines:</h3>
                <div className="space-y-2">
                  {result.wins.map((win, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span>
                        {win.symbol} x{win.count} ({win.type})
                      </span>
                      <span className="font-bold text-green-600">
                        {win.multiplier}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!result && (
          <div className="text-center py-12">
            <div className="text-8xl mb-4">🎰</div>
            <p className="text-gray-600 text-lg">Place your bet and spin!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Slots;