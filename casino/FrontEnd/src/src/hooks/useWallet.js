import { useState, useEffect, useCallback } from "react";
import { walletAPI } from "../api/wallet";

export const useWallet = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await walletAPI.getWallets();
      setWallets(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch wallets");
    } finally {
      setLoading(false);
    }
  }, []);

  const deposit = useCallback(
    async (amount) => {
      try {
        const data = await walletAPI.deposit(amount);
        await fetchWallets();
        return { success: true, data };
      } catch (err) {
        return {
          success: false,
          error: err.response?.data?.detail || "Deposit failed",
        };
      }
    },
    [fetchWallets]
  );

  const withdraw = useCallback(
    async (amount) => {
      try {
        const data = await walletAPI.withdraw(amount);
        await fetchWallets();
        return { success: true, data };
      } catch (err) {
        return {
          success: false,
          error: err.response?.data?.detail || "Withdrawal failed",
        };
      }
    },
    [fetchWallets]
  );

  const getCashBalance = useCallback(() => {
    const cashWallet = wallets.find((w) => w.wallet_type === "cash");
    return cashWallet ? parseFloat(cashWallet.balance) : 0;
  }, [wallets]);

  const getBonusBalance = useCallback(() => {
    const bonusWallet = wallets.find((w) => w.wallet_type === "bonus");
    return bonusWallet ? parseFloat(bonusWallet.balance) : 0;
  }, [wallets]);

  const getPointsBalance = useCallback(() => {
    const pointsWallet = wallets.find((w) => w.wallet_type === "points");
    return pointsWallet ? parseFloat(pointsWallet.balance) : 0;
  }, [wallets]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  return {
    wallets,
    loading,
    error,
    fetchWallets,
    deposit,
    withdraw,
    getCashBalance,
    getBonusBalance,
    getPointsBalance,
  };
};
