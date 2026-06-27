import { useState } from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp, DollarSign, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ArbitrageOpportunity {
  id: string;
  sport: string;
  event: string;
  profit: number;
  book1: string;
  book2: string;
  odds1: string;
  odds2: string;
  stake1: number;
  stake2: number;
}

interface ArbLeg {
  book: string;
  market_id: string;
  outcome_name: string;
  line: number | null;
  dec_odds: number;
}

interface ArbResult {
  sport_title: string;
  home_team: string;
  away_team: string;
  market_key: string;
  arb_type: string;
  line: number | string | null;
  profit_percent: number;
  profit_amount: number;
  stakes: number[];
  src: ArbLeg[];
  total_stake: number;
  is_middle: boolean;
  middle_profit_amount?: number;
  middle_window?: string;
  soft_book_involved?: boolean;
}

interface ArbsResponse {
  arbs: ArbResult[];
  remaining_requests: number | null;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

const ScannerSection = () => {
  const [bankroll, setBankroll] = useState("100");
  const [minProfit, setMinProfit] = useState("0.1");
  const [isScanning, setIsScanning] = useState(false);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [apiCalls, setApiCalls] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setIsScanning(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        bankroll: bankroll || "100",
        min_profit_percent: minProfit || "0",
      });

      const res = await fetch(`${API_BASE}/arbs?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Backend returned ${res.status}`);
      }

      const data: ArbsResponse = await res.json();

      // from backend
      setApiCalls(data.remaining_requests ?? null);

      // map backend arbs into UI-friendly objects
      const mapped: ArbitrageOpportunity[] = data.arbs.map((arb, index) => {
        const legs = arb.src;
        const leg1 = legs[0];
        const leg2 = legs[1] ?? legs[0];

        return {
          id: `${index}-${arb.sport_title}-${arb.home_team}-${arb.away_team}`,
          sport: arb.sport_title,
          event: `${arb.home_team} vs ${arb.away_team}`,
          profit: arb.profit_percent,
          book1: leg1.book,
          book2: leg2.book,
          odds1: leg1.dec_odds.toFixed(2),
          odds2: leg2.dec_odds.toFixed(2),
          stake1: Number(arb.stakes[0] ?? 0),
          stake2: Number(arb.stakes[1] ?? 0),
        };
      });

      setOpportunities(mapped);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to fetch arbitrage data");
      setOpportunities([]);
      setApiCalls(null);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <section id="scanner" className="py-16 relative">
      <div className="container mx-auto px-6">
        {/* Scanner Card */}
        <motion.div
          className="glass-card rounded-2xl p-8 glow-subtle relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Animated corner accents */}
          <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-primary/30 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-accent/30 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-accent/30 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-primary/30 rounded-br-2xl" />

          {/* Header */}
          <motion.div
            className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-2 tracking-wider flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary" />
                Arbitrage Scanner
              </h3>
              <p className="text-muted-foreground font-body">
                API calls remaining:{" "}
                <span className="text-primary font-semibold font-display">
                  {apiCalls !== null ? apiCalls : "—"}
                </span>
              </p>
              {error && (
                <p className="text-red-400 text-sm mt-2 font-body">
                  Error: {error}
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground font-body tracking-wide">
                  Bankroll per arb ($)
                </label>
                <Input
                  type="number"
                  value={bankroll}
                  onChange={(e) => setBankroll(e.target.value)}
                  className="w-32 font-display"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground font-body tracking-wide">
                  Min profit %
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={minProfit}
                  onChange={(e) => setMinProfit(e.target.value)}
                  className="w-32 font-display"
                />
              </div>
              <div className="pt-6">
                <Button
                  variant="glow"
                  size="lg"
                  onClick={handleScan}
                  disabled={isScanning}
                  className="min-w-[140px] font-display tracking-wider"
                >
                  {isScanning ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <span className="ml-2">Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Scan Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div
            className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />

          {/* Results */}
          {opportunities.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg font-body">
                No arbitrage opportunities found for these settings.
              </p>
              <p className="text-muted-foreground/60 text-sm mt-2 font-body">
                Try adjusting your minimum profit percentage or check back later.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {opportunities.map((opp, index) => (
                <motion.div
                  key={opp.id}
                  className="bg-secondary/50 rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-primary font-display font-medium uppercase tracking-widest">
                        {opp.sport}
                      </span>
                      <h4 className="text-lg font-semibold text-foreground mt-1 font-body">
                        {opp.event}
                      </h4>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-accent">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-2xl font-display font-bold">
                          +{opp.profit.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1 font-body">
                        <DollarSign className="w-3 h-3" />
                        <span>
                          $
                          {(
                            (parseFloat(bankroll || "0") * opp.profit) /
                            100
                          ).toFixed(2)}{" "}
                          profit
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ScannerSection;
