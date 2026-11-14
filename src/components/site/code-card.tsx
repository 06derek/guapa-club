const lines: { t: string; c?: string }[][] = [
  [{ t: "#include", c: "text-primary" }, { t: " <bits/stdc++.h>", c: "text-success" }],
  [{ t: "using namespace", c: "text-primary" }, { t: " std;" }],
  [],
  [{ t: "int", c: "text-primary" }, { t: " main" , c: "text-gold" }, { t: "() {" }],
  [{ t: "  int", c: "text-primary" }, { t: " n; cin >> n;" }],
  [{ t: "  vector", c: "text-gold" }, { t: "<" }, { t: "long long", c: "text-primary" }, { t: "> dp(n + 1);" }],
  [{ t: "  dp[0] = 1;" }],
  [{ t: "  for", c: "text-primary" }, { t: " (int i = 1; i <= n; i++)" }],
  [{ t: "    dp[i] = dp[i-1] + (i > 1 ? dp[i-2] : 0);" }],
  [{ t: "  cout << dp[n] << " }, { t: "'\\n'", c: "text-success" }, { t: ";" }],
  [{ t: "}" }],
];

export function CodeCard() {
  return (
    <div className="relative min-w-0">
      <div className="absolute -inset-6 rounded-3xl bg-gold/10 blur-3xl" aria-hidden />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-destructive/70" />
            <span className="size-2.5 rounded-full bg-gold/80" />
            <span className="size-2.5 rounded-full bg-success/80" />
          </div>
          <span className="font-mono text-xs text-muted-foreground">solucion.cpp</span>
          <span className="w-10" />
        </div>
        <pre className="overflow-x-auto px-3 py-4 font-mono text-[11px] leading-5 sm:px-4 sm:text-[12.5px] sm:leading-6">
          {lines.map((ln, i) => (
            <div key={i} className="flex">
              <span className="mr-3 w-5 shrink-0 sm:mr-4 select-none text-right text-muted-foreground/50">{i + 1}</span>
              <code>
                {ln.map((tok, j) => (
                  <span key={j} className={tok.c}>
                    {tok.t}
                  </span>
                ))}
              </code>
            </div>
          ))}
        </pre>
        <div className="flex items-center justify-between border-t border-border bg-surface px-4 py-2.5 font-mono text-xs">
          <span className="inline-flex items-center gap-2 text-success">
            <span className="size-2 rounded-full bg-success" aria-hidden />
            Accepted
          </span>
          <span className="text-muted-foreground">
            46 ms · 256 KB<span className="ml-1 animate-blink text-gold">▍</span>
          </span>
        </div>
      </div>
    </div>
  );
}
