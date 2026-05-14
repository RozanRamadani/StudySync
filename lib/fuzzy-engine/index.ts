// ============================================================
// StudySync Fuzzy Logic Mamdani Engine
// ============================================================

export interface FuzzyInput {
  focus: number;      // 0-100
  fatigue: number;    // 0-100
  complexity: number; // 0-100
}

export interface MembershipDegrees {
  low: number;
  medium: number;
  high: number;
}

export interface OutputMembership {
  sangatPendek: number;
  pendek: number;
  sedang: number;
  panjang: number;
  sangatPanjang: number;
}

export interface FuzzyRule {
  id: number;
  focus: "low" | "medium" | "high";
  fatigue: "low" | "medium" | "high";
  complexity: "low" | "medium" | "high";
  output: "sangatPendek" | "pendek" | "sedang" | "panjang" | "sangatPanjang";
  strength: number;
}

export interface FuzzyResult {
  duration: number;
  category: string;
  confidence: number;
  activeRules: FuzzyRule[];
  focusMembership: MembershipDegrees;
  fatigueMembership: MembershipDegrees;
  complexityMembership: MembershipDegrees;
  outputMembership: OutputMembership;
  allRules: FuzzyRule[];
}

// ============================================================
// MEMBERSHIP FUNCTIONS (Triangular / Trapezoidal)
// ============================================================

function trapezoid(x: number, a: number, b: number, c: number, d: number): number {
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  return (d - x) / (d - c);
}

function triangle(x: number, a: number, b: number, c: number): number {
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

// Input membership functions
export function fuzzifyFocus(x: number): MembershipDegrees {
  return {
    low: trapezoid(x, -1, 0, 25, 50),
    medium: triangle(x, 25, 50, 75),
    high: trapezoid(x, 50, 75, 100, 101),
  };
}

export function fuzzifyFatigue(x: number): MembershipDegrees {
  return {
    low: trapezoid(x, -1, 0, 25, 50),
    medium: triangle(x, 25, 50, 75),
    high: trapezoid(x, 50, 75, 100, 101),
  };
}

export function fuzzifyComplexity(x: number): MembershipDegrees {
  return {
    low: trapezoid(x, -1, 0, 25, 50),
    medium: triangle(x, 25, 50, 75),
    high: trapezoid(x, 50, 75, 100, 101),
  };
}

// Output membership functions (range: 15-150 minutes)
export function outputMembershipFn(
  z: number,
  category: "sangatPendek" | "pendek" | "sedang" | "panjang" | "sangatPanjang"
): number {
  switch (category) {
    case "sangatPendek":
      return trapezoid(z, 14, 15, 30, 50);
    case "pendek":
      return triangle(z, 30, 50, 75);
    case "sedang":
      return triangle(z, 55, 82, 110);
    case "panjang":
      return triangle(z, 90, 115, 135);
    case "sangatPanjang":
      return trapezoid(z, 120, 135, 150, 151);
    default:
      return 0;
  }
}

// ============================================================
// RULE BASE (27 rules: 3^3 combinations)
// ============================================================

type FocusLevel = "low" | "medium" | "high";
type FatigueLevel = "low" | "medium" | "high";
type ComplexityLevel = "low" | "medium" | "high";
type OutputLevel = "sangatPendek" | "pendek" | "sedang" | "panjang" | "sangatPanjang";

const ruleTable: Record<string, OutputLevel> = {
  // Focus Low
  "low-low-low": "pendek",
  "low-low-medium": "sedang",
  "low-low-high": "sedang",
  "low-medium-low": "sangatPendek",
  "low-medium-medium": "pendek",
  "low-medium-high": "pendek",
  "low-high-low": "sangatPendek",
  "low-high-medium": "sangatPendek",
  "low-high-high": "sangatPendek",
  // Focus Medium
  "medium-low-low": "sedang",
  "medium-low-medium": "panjang",
  "medium-low-high": "panjang",
  "medium-medium-low": "pendek",
  "medium-medium-medium": "sedang",
  "medium-medium-high": "sedang",
  "medium-high-low": "sangatPendek",
  "medium-high-medium": "pendek",
  "medium-high-high": "pendek",
  // Focus High
  "high-low-low": "panjang",
  "high-low-medium": "sangatPanjang",
  "high-low-high": "sangatPanjang",
  "high-medium-low": "sedang",
  "high-medium-medium": "panjang",
  "high-medium-high": "panjang",
  "high-high-low": "pendek",
  "high-high-medium": "sedang",
  "high-high-high": "sedang",
};

// ============================================================
// MAMDANI INFERENCE
// ============================================================

export function calculateFuzzy(input: FuzzyInput): FuzzyResult {
  const focusMem = fuzzifyFocus(input.focus);
  const fatigueMem = fuzzifyFatigue(input.fatigue);
  const complexityMem = fuzzifyComplexity(input.complexity);

  const focusLevels: FocusLevel[] = ["low", "medium", "high"];
  const fatigueLevels: FatigueLevel[] = ["low", "medium", "high"];
  const complexityLevels: ComplexityLevel[] = ["low", "medium", "high"];

  const allRules: FuzzyRule[] = [];
  let ruleId = 1;

  // Evaluate all 27 rules
  for (const f of focusLevels) {
    for (const fat of fatigueLevels) {
      for (const c of complexityLevels) {
        const key = `${f}-${fat}-${c}`;
        const output = ruleTable[key];
        // AND = MIN
        const strength = Math.min(focusMem[f], fatigueMem[fat], complexityMem[c]);
        allRules.push({
          id: ruleId++,
          focus: f,
          fatigue: fat,
          complexity: c,
          output,
          strength,
        });
      }
    }
  }

  // Active rules (strength > 0)
  const activeRules = allRules.filter((r) => r.strength > 0);

  // ============================================================
  // DEFUZZIFICATION (Centroid Method)
  // ============================================================
  const step = 0.5;
  let numerator = 0;
  let denominator = 0;

  for (let z = 15; z <= 150; z += step) {
    // Aggregation: MAX of all clipped output memberships
    let aggMu = 0;
    for (const rule of activeRules) {
      const mu = Math.min(rule.strength, outputMembershipFn(z, rule.output));
      aggMu = Math.max(aggMu, mu);
    }
    numerator += aggMu * z;
    denominator += aggMu;
  }

  const duration = denominator > 0 ? Math.round(numerator / denominator) : 45;

  // Category classification
  let category: string;
  if (duration <= 30) category = "Sangat Pendek";
  else if (duration <= 55) category = "Pendek";
  else if (duration <= 95) category = "Sedang";
  else if (duration <= 125) category = "Panjang";
  else category = "Sangat Panjang";

  // Confidence score based on active rule strengths
  const maxStrength = activeRules.length > 0
    ? Math.max(...activeRules.map((r) => r.strength))
    : 0;
  const avgStrength = activeRules.length > 0
    ? activeRules.reduce((sum, r) => sum + r.strength, 0) / activeRules.length
    : 0;
  const confidence = Math.round((maxStrength * 0.6 + avgStrength * 0.4) * 100);

  // Output membership summary
  const outputMembership: OutputMembership = {
    sangatPendek: 0,
    pendek: 0,
    sedang: 0,
    panjang: 0,
    sangatPanjang: 0,
  };

  for (const rule of activeRules) {
    outputMembership[rule.output] = Math.max(
      outputMembership[rule.output],
      rule.strength
    );
  }

  return {
    duration,
    category,
    confidence,
    activeRules,
    focusMembership: focusMem,
    fatigueMembership: fatigueMem,
    complexityMembership: complexityMem,
    outputMembership,
    allRules,
  };
}

// ============================================================
// AI STUDY TIPS GENERATOR
// ============================================================

export function generateStudyTips(result: FuzzyResult, input: FuzzyInput): string {
  const tips: string[] = [];

  if (input.focus >= 70 && input.fatigue <= 30) {
    tips.push("Analisis mendeteksi kondisi kognitif optimal. Direkomendasikan teknik 'Time Blocking' untuk efisiensi puncak.");
  } else if (input.focus >= 50 && input.fatigue <= 50) {
    tips.push("Kondisi fokus cukup baik. Gunakan teknik 'Pomodoro' dengan interval 25 menit untuk mempertahankan konsentrasi.");
  } else if (input.fatigue >= 70) {
    tips.push("Tingkat kelelahan tinggi terdeteksi. Disarankan istirahat sejenak sebelum memulai sesi belajar untuk memaksimalkan retensi.");
  } else if (input.focus <= 30) {
    tips.push("Fokus rendah terdeteksi. Coba teknik 'Active Recall' dengan sesi pendek 15-20 menit untuk meningkatkan keterlibatan.");
  } else {
    tips.push("Kondisi belajar moderat. Gunakan teknik 'Spaced Repetition' untuk mengoptimalkan proses memorisasi jangka panjang.");
  }

  if (input.complexity >= 70) {
    tips.push("Materi kompleks terdeteksi. Pecah materi menjadi sub-topik kecil menggunakan metode 'Feynman Technique'.");
  }

  return tips.join(" ");
}

// ============================================================
// CATEGORY LABEL HELPERS
// ============================================================

export function getCategoryColor(category: string): string {
  switch (category) {
    case "Sangat Pendek":
      return "#EF4444";
    case "Pendek":
      return "#F59E0B";
    case "Sedang":
      return "#10B981";
    case "Panjang":
      return "#3B82F6";
    case "Sangat Panjang":
      return "#8B5CF6";
    default:
      return "#6B7280";
  }
}

export function getCategoryLabel(category: string): "Pendek" | "Ideal" | "Panjang" {
  if (category === "Sangat Pendek" || category === "Pendek") return "Pendek";
  if (category === "Sedang") return "Ideal";
  return "Panjang";
}
