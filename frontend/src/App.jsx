import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CloudUpload,
  FileText,
  FlipHorizontal2,
  Layers3,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Target,
  Upload,
  X,
  Zap
} from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Router as WouterRouter, useLocation } from "wouter";
import NotFound from "@/pages/not-found";
const queryClient = new QueryClient();
function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function AppMark({ small = false }) {
  return /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-3 ${small ? "gap-2" : ""}`, children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: `relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-[0_6px_15px_-8px_hsl(var(--accent))] ${small ? "h-8 w-8 rounded-lg" : "h-10 w-10"}`,
        "data-testid": "brand-mark",
        children: [
          /* @__PURE__ */ jsx(BookOpen, { size: small ? 16 : 19, strokeWidth: 2.25 }),
          /* @__PURE__ */ jsx("span", { className: "absolute -bottom-2 -right-1 h-5 w-5 rounded-full border-2 border-[hsl(var(--sidebar))] bg-[hsl(var(--primary))]" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: `font-bold tracking-[-0.03em] ${small ? "text-sm" : "text-[17px]"}`, children: "StudySpark" }),
      !small && /* @__PURE__ */ jsx("div", { className: "text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--sidebar-foreground)/.55)]", children: "AI study desk" })
    ] })
  ] });
}
function HealthPill() {
  const health = useQuery({
    queryKey: ["/api/healthz"],
    queryFn: async () => {
      const response = await fetch("/api/healthz");
      if (!response.ok) throw new Error("The API server is not responding.");
      return response.json();
    },
    retry: false,
    staleTime: 6e4
  });
  const isReady = health.data?.status === "ok" || health.data?.status === "healthy";
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/.76)] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]", "data-testid": "status-health", children: [
    /* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 rounded-full ${health.isLoading ? "animate-pulse bg-[hsl(var(--accent))]" : isReady ? "bg-[hsl(142_42%_45%)]" : "bg-[hsl(var(--muted-foreground)/.45)]"}` }),
    health.isLoading ? "Checking desk" : isReady ? "Desk ready" : "Desk offline"
  ] });
}
function Sidebar({
  material,
  activeTab,
  onTabChange,
  onNewUpload
}) {
  const navItems = [
    { id: "summary", label: "Study brief", icon: FileText },
    { id: "quiz", label: "Knowledge check", icon: Target, count: material?.quiz.length },
    { id: "flashcards", label: "Recall cards", icon: Layers3, count: material?.flashcards.length }
  ];
  return /* @__PURE__ */ jsxs("aside", { className: "hidden min-h-dvh w-[252px] shrink-0 flex-col bg-[hsl(var(--sidebar))] px-5 py-6 text-[hsl(var(--sidebar-foreground))] lg:flex", "data-testid": "sidebar", children: [
    /* @__PURE__ */ jsx(AppMark, {}),
    /* @__PURE__ */ jsxs("div", { className: "mt-12", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--sidebar-foreground)/.42)]", children: "Your desk" }),
      /* @__PURE__ */ jsx("nav", { className: "space-y-1", "aria-label": "Study materials", children: navItems.map(({ id, label, icon: Icon, count }) => /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => onTabChange(id),
          disabled: !material,
          className: `group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${activeTab === id && material ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]" : "text-[hsl(var(--sidebar-foreground)/.62)] hover:bg-[hsl(var(--sidebar-accent)/.7)] hover:text-[hsl(var(--sidebar-foreground))] disabled:cursor-default disabled:opacity-45"}`,
          "data-testid": `button-sidebar-${id}`,
          children: [
            /* @__PURE__ */ jsx(Icon, { size: 17, strokeWidth: 1.9, className: activeTab === id && material ? "text-[hsl(var(--sidebar-primary))]" : "" }),
            /* @__PURE__ */ jsx("span", { className: "flex-1", children: label }),
            count && /* @__PURE__ */ jsx("span", { className: "text-[11px] tabular-nums text-[hsl(var(--sidebar-foreground)/.42)]", children: count })
          ]
        },
        id
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-auto", children: [
      material ? /* @__PURE__ */ jsxs("div", { className: "mb-5 rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent)/.72)] p-4", "data-testid": "card-sidebar-progress", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between text-[11px] font-semibold", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[hsl(var(--sidebar-foreground)/.65)]", children: "Session progress" }),
          /* @__PURE__ */ jsx("span", { className: "text-[hsl(var(--sidebar-primary))]", children: "3 of 3" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-1.5 overflow-hidden rounded-full bg-[hsl(var(--sidebar)/.8)]", children: /* @__PURE__ */ jsx("div", { className: "progress-stripe h-full w-full rounded-full" }) }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs leading-relaxed text-[hsl(var(--sidebar-foreground)/.52)]", children: "A little review now makes tomorrow lighter." })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "mb-5 rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent)/.72)] p-4", "data-testid": "card-sidebar-empty", children: [
        /* @__PURE__ */ jsx(Sparkles, { size: 16, className: "mb-3 text-[hsl(var(--sidebar-primary))]" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Make your first brief" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs leading-relaxed text-[hsl(var(--sidebar-foreground)/.52)]", children: "One PDF in. A clear study path out." })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: onNewUpload,
          className: "flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--sidebar-primary))] px-4 py-3 text-sm font-bold text-[hsl(var(--sidebar-primary-foreground))] transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0",
          "data-testid": "button-new-upload",
          children: [
            /* @__PURE__ */ jsx(Upload, { size: 16 }),
            "New study PDF"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mt-5 flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--sidebar-foreground)/.35)]", children: [
        /* @__PURE__ */ jsx("span", { children: "Focus mode" }),
        /* @__PURE__ */ jsx("span", { children: "v1.0" })
      ] })
    ] })
  ] });
}
function MobileHeader({
  material,
  activeTab,
  onTabChange,
  onNewUpload
}) {
  const tabs = [
    { id: "summary", label: "Brief" },
    { id: "quiz", label: "Quiz" },
    { id: "flashcards", label: "Cards" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "border-b border-[hsl(var(--border))] bg-[hsl(var(--sidebar))] px-4 pb-3 pt-4 text-[hsl(var(--sidebar-foreground))] lg:hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx(AppMark, { small: true }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(HealthPill, {}),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: onNewUpload, className: "rounded-lg p-2 text-[hsl(var(--sidebar-foreground)/.8)] hover:bg-[hsl(var(--sidebar-accent))]", "data-testid": "button-mobile-new-upload", "aria-label": "Upload a new study PDF", children: /* @__PURE__ */ jsx(Upload, { size: 17 }) })
      ] })
    ] }),
    material && /* @__PURE__ */ jsx("nav", { className: "mt-4 flex gap-1 rounded-xl bg-[hsl(var(--sidebar-accent)/.75)] p-1", "aria-label": "Study views", children: tabs.map((tab) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => onTabChange(tab.id),
        className: `flex-1 rounded-lg px-2 py-2 text-xs font-bold transition ${activeTab === tab.id ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]" : "text-[hsl(var(--sidebar-foreground)/.62)]"}`,
        "data-testid": `button-mobile-tab-${tab.id}`,
        children: tab.label
      },
      tab.id
    )) })
  ] });
}
function UploadDesk({
  file,
  onFile,
  onGenerate,
  onClear,
  isPending,
  error
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const onInput = (event) => {
    const nextFile = event.target.files?.[0];
    if (nextFile) onFile(nextFile);
  };
  const onDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const nextFile = event.dataTransfer.files?.[0];
    if (nextFile) onFile(nextFile);
  };
  const hasError = Boolean(error);
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-[900px] py-7 sm:py-12 lg:py-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 max-w-2xl rise-in", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/.55)] bg-[hsl(var(--accent)/.17)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--accent-foreground))]", "data-testid": "badge-focus-mode", children: [
        /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent-foreground))]" }),
        "A calmer way to study"
      ] }),
      /* @__PURE__ */ jsxs("h1", { className: "display-font text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-[hsl(var(--foreground))] sm:text-6xl", children: [
        "Turn the dense stuff",
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("em", { className: "font-medium not-italic text-[hsl(var(--primary))]", children: "into your next win." })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-5 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))] sm:text-lg", children: "Drop in a study PDF. StudySpark finds the shape of it, then gives you a brief, a quiz, and flashcards that feel doable." })
    ] }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: `relative overflow-hidden rounded-[1.5rem] border-2 border-dashed bg-[hsl(var(--card)/.82)] p-5 transition duration-300 sm:p-8 ${isDragging ? "dropzone-active" : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/.5)]"}`,
        onDragOver: (event) => {
          event.preventDefault();
          setIsDragging(true);
        },
        onDragLeave: () => setIsDragging(false),
        onDrop,
        "data-testid": "dropzone-study-pdf",
        children: [
          /* @__PURE__ */ jsx("input", { ref: inputRef, type: "file", accept: ".pdf,application/pdf", className: "hidden", onChange: onInput, "data-testid": "input-study-pdf" }),
          /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[hsl(var(--accent)/.14)] blur-2xl" }),
          /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-[hsl(var(--primary)/.08)] blur-3xl" }),
          !file ? /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col items-center py-9 text-center sm:py-12", children: [
            /* @__PURE__ */ jsx("div", { className: "mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[hsl(var(--accent)/.55)] bg-[hsl(var(--accent)/.18)] text-[hsl(var(--accent-foreground))] shadow-[0_8px_20px_-14px_hsl(var(--accent))]", children: /* @__PURE__ */ jsx(CloudUpload, { size: 27, strokeWidth: 1.8 }) }),
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold tracking-[-0.02em]", children: "Bring your study material" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-[hsl(var(--muted-foreground))]", children: "Drag a PDF here, or choose one from your device." }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => inputRef.current?.click(), className: "mt-6 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-[0_10px_20px_-13px_hsl(var(--primary))] transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0", "data-testid": "button-choose-pdf", children: [
              /* @__PURE__ */ jsx(Upload, { size: 16 }),
              "Choose PDF"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-4 text-[11px] font-medium text-[hsl(var(--muted-foreground)/.72)]", children: "PDF only \xB7 up to 20 MB \xB7 your file stays in this session" })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/.72)] p-4 sm:items-center", children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]", children: /* @__PURE__ */ jsx(FileText, { size: 23 }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-bold", "data-testid": "text-selected-file", children: file.name }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-[hsl(var(--muted-foreground))]", "data-testid": "text-selected-file-size", children: [
                  formatBytes(file.size),
                  " \xB7 Ready to make a study brief"
                ] })
              ] }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: onClear, className: "rounded-lg p-2 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]", "data-testid": "button-clear-pdf", "aria-label": "Remove selected PDF", children: /* @__PURE__ */ jsx(X, { size: 17 }) })
            ] }),
            /* @__PURE__ */ jsx("button", { type: "button", disabled: isPending, onClick: onGenerate, className: "mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-[0_10px_20px_-13px_hsl(var(--primary))] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-wait disabled:opacity-70", "data-testid": "button-generate-material", children: isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(LoaderCircle, { size: 17, className: "animate-spin" }),
              " Reading your PDF\u2026"
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Sparkles, { size: 17 }),
              " Make my study set"
            ] }) })
          ] })
        ]
      }
    ),
    hasError && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-start gap-3 rounded-xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.07)] p-4 text-sm text-[hsl(var(--destructive))]", role: "alert", "data-testid": "status-upload-error", children: [
      /* @__PURE__ */ jsx(CircleAlert, { size: 18, className: "mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-bold", children: "That PDF did not make it through." }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs opacity-85", children: error instanceof Error ? error.message : "Please check the file and try again." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-9 grid gap-3 sm:grid-cols-3", children: [
      { icon: FileText, title: "A tight brief", body: "The signal, without the sprawl." },
      { icon: Target, title: "10 questions", body: "A quick check on what stuck." },
      { icon: Layers3, title: "15 recall cards", body: "Practice when you have a minute." }
    ].map(({ icon: Icon, title, body }, index) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-[hsl(var(--border)/.75)] bg-[hsl(var(--card)/.48)] p-4 rise-in-delay", style: { animationDelay: `${index * 80 + 120}ms` }, "data-testid": `card-feature-${index}`, children: [
      /* @__PURE__ */ jsx(Icon, { size: 17, className: "mb-3 text-[hsl(var(--primary))]" }),
      /* @__PURE__ */ jsx("div", { className: "text-sm font-bold", children: title }),
      /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]", children: body })
    ] }, title)) })
  ] });
}
function MaterialHeader({ material, activeTab, onTabChange, onNewUpload }) {
  return /* @__PURE__ */ jsxs("div", { className: "mb-7 flex flex-col gap-5 border-b border-[hsl(var(--border))] pb-6 sm:flex-row sm:items-end sm:justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]", children: [
        /* @__PURE__ */ jsx("span", { className: "rounded-full bg-[hsl(var(--primary)/.1)] px-2 py-1 text-[hsl(var(--primary))]", children: "Study set ready" }),
        /* @__PURE__ */ jsx("span", { children: "\xB7" }),
        /* @__PURE__ */ jsx("span", { "data-testid": "text-material-count", children: "28 ways to review" })
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "display-font truncate text-3xl font-semibold tracking-[-0.04em] sm:text-4xl", "data-testid": "text-material-filename", children: material.fileName }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-[hsl(var(--muted-foreground))]", children: "A focused path through your reading." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "hidden items-center gap-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.66)] p-1 sm:flex", role: "tablist", "aria-label": "Study material sections", children: [
        ["summary", "Brief", FileText],
        ["quiz", "Quiz", Target],
        ["flashcards", "Cards", Layers3]
      ].map(([id, label, Icon]) => /* @__PURE__ */ jsxs("button", { type: "button", role: "tab", "aria-selected": activeTab === id, onClick: () => onTabChange(id), className: `flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${activeTab === id ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"}`, "data-testid": `button-tab-${id}`, children: [
        /* @__PURE__ */ jsx(Icon, { size: 14 }),
        label
      ] }, id)) }),
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: onNewUpload, className: "flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.66)] px-3 py-2 text-xs font-bold text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]", "data-testid": "button-header-new-upload", children: [
        /* @__PURE__ */ jsx(Upload, { size: 14 }),
        /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "New PDF" })
      ] })
    ] })
  ] });
}
function SummaryView({ summary }) {
  const paragraphs = summary.split(/\n+/).filter(Boolean);
  return /* @__PURE__ */ jsx("section", { className: "rise-in", "data-testid": "section-summary", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-5 xl:grid-cols-[1fr_280px]", children: [
    /* @__PURE__ */ jsxs("article", { className: "soft-shadow rounded-[1.35rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-9", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-7 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--primary))]", children: "The short version" }),
          /* @__PURE__ */ jsx("h2", { className: "display-font mt-2 text-2xl font-semibold tracking-[-0.035em]", children: "What to hold onto" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "hidden h-11 w-11 items-center justify-center rounded-full bg-[hsl(var(--accent)/.22)] text-[hsl(var(--accent-foreground))] sm:flex", children: /* @__PURE__ */ jsx(Zap, { size: 19 }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-5 text-[15px] leading-8 text-[hsl(var(--foreground)/.82)]", "data-testid": "text-summary", children: paragraphs.length ? paragraphs.map((paragraph, index) => /* @__PURE__ */ jsx("p", { children: paragraph }, `${paragraph.slice(0, 20)}-${index}`)) : /* @__PURE__ */ jsx("p", { children: "No summary was returned for this file." }) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 flex items-center gap-2 border-t border-[hsl(var(--border))] pt-5 text-xs font-semibold text-[hsl(var(--muted-foreground))]", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { size: 15, className: "text-[hsl(var(--primary))]" }),
        " Read once, then test what stayed."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("aside", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-[1.35rem] bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold uppercase tracking-[0.16em] opacity-70", children: "Your study set" }),
          /* @__PURE__ */ jsx(Sparkles, { size: 17, className: "text-[hsl(var(--accent))]" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-7 text-4xl font-bold tracking-[-0.05em]", "data-testid": "text-summary-total-items", children: "28" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm opacity-70", children: "small moments to make it stick" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-3 text-xs font-semibold", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-t border-[hsl(var(--primary-foreground)/.16)] pt-3", children: [
            /* @__PURE__ */ jsx("span", { className: "opacity-70", children: "Knowledge check" }),
            /* @__PURE__ */ jsx("span", { children: "10 Qs" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-t border-[hsl(var(--primary-foreground)/.16)] pt-3", children: [
            /* @__PURE__ */ jsx("span", { className: "opacity-70", children: "Recall cards" }),
            /* @__PURE__ */ jsx("span", { children: "15 cards" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-[1.35rem] border border-[hsl(var(--border))] bg-[hsl(var(--card)/.7)] p-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]", children: "Suggested rhythm" }),
        /* @__PURE__ */ jsx("div", { className: "mt-5 space-y-4", children: [
          ["01", "Read the brief", "2 min"],
          ["02", "Take the quiz", "5 min"],
          ["03", "Flip the cards", "3 min"]
        ].map(([number, title, time]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[10px] font-bold text-[hsl(var(--primary))]", children: number }),
          /* @__PURE__ */ jsx("span", { className: "flex-1 text-sm font-bold", children: title }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-[hsl(var(--muted-foreground))]", children: time })
        ] }, number)) })
      ] })
    ] })
  ] }) });
}
function QuizView({ quiz }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const question = quiz[questionIndex];
  const selected = question ? answers[question.id] : void 0;
  const isAnswered = Boolean(selected);
  const correctCount = quiz.filter((item) => answers[item.id] === item.correctAnswer).length;
  const answer = (value) => setAnswers((current) => ({ ...current, [question.id]: value }));
  const reset = () => {
    setQuestionIndex(0);
    setAnswers({});
  };
  if (!question) return null;
  return /* @__PURE__ */ jsxs("section", { className: "rise-in", "data-testid": "section-quiz", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--primary))]", children: "Knowledge check" }),
        /* @__PURE__ */ jsx("h2", { className: "display-font mt-1 text-2xl font-semibold tracking-[-0.035em]", children: "See what made it through." })
      ] }),
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: reset, className: "flex w-fit items-center gap-2 rounded-lg px-2 py-2 text-xs font-bold text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]", "data-testid": "button-reset-quiz", children: [
        /* @__PURE__ */ jsx(RotateCcw, { size: 14 }),
        " Reset quiz"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-5 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "h-2 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full bg-[hsl(var(--accent))] transition-all duration-500", style: { width: `${(questionIndex + (isAnswered ? 1 : 0)) / quiz.length * 100}%` } }) }),
      /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold tabular-nums text-[hsl(var(--muted-foreground))]", "data-testid": "text-quiz-progress", children: [
        questionIndex + 1,
        " / ",
        quiz.length
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-5 xl:grid-cols-[1fr_250px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "soft-shadow rounded-[1.35rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-9", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-7 flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent)/.23)] text-sm font-bold text-[hsl(var(--accent-foreground))]", children: questionIndex + 1 }),
          /* @__PURE__ */ jsx("span", { className: "rounded-full bg-[hsl(var(--muted))] px-3 py-1 text-[11px] font-bold text-[hsl(var(--muted-foreground))]", children: "Pick one answer" })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "max-w-2xl text-xl font-bold leading-8 tracking-[-0.025em] sm:text-2xl", "data-testid": `text-question-${question.id}`, children: question.question }),
        /* @__PURE__ */ jsx("div", { className: "mt-8 grid gap-3", role: "radiogroup", "aria-label": "Answer options", children: question.options.map((option, index) => {
          const isSelected = selected === option;
          const isCorrect = option === question.correctAnswer;
          const showCorrect = isAnswered && isCorrect;
          const showWrong = isSelected && selected !== question.correctAnswer;
          return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => answer(option), className: `group flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm font-semibold transition ${showCorrect ? "border-[hsl(142_42%_45%)/.5] bg-[hsl(142_42%_45%)/.1] text-[hsl(142_38%_31%)]" : showWrong ? "border-[hsl(var(--destructive)/.45)] bg-[hsl(var(--destructive)/.07)] text-[hsl(var(--destructive))]" : isSelected ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]" : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/.5)] hover:bg-[hsl(var(--muted)/.6)]"}`, "data-testid": `button-answer-${question.id}-${index}`, children: [
            /* @__PURE__ */ jsx("span", { className: `flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${showCorrect ? "bg-[hsl(142_42%_45%)] text-white" : showWrong ? "bg-[hsl(var(--destructive))] text-white" : isSelected ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`, children: showCorrect || showWrong ? showCorrect ? /* @__PURE__ */ jsx(Check, { size: 14 }) : /* @__PURE__ */ jsx(X, { size: 14 }) : String.fromCharCode(65 + index) }),
            /* @__PURE__ */ jsx("span", { className: "pt-0.5", children: option })
          ] }, option);
        }) }),
        isAnswered && /* @__PURE__ */ jsxs("div", { className: `mt-6 rounded-xl border p-4 text-sm leading-6 ${selected === question.correctAnswer ? "border-[hsl(142_42%_45%)/.35] bg-[hsl(142_42%_45%)/.08]" : "border-[hsl(var(--accent)/.5)] bg-[hsl(var(--accent)/.12)]"}`, "data-testid": `feedback-question-${question.id}`, children: [
          /* @__PURE__ */ jsx("div", { className: "font-bold", children: selected === question.correctAnswer ? "That one landed." : `The answer is ${question.correctAnswer}.` }),
          /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-[hsl(var(--muted-foreground))]", children: question.explanation })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-5", children: [
          /* @__PURE__ */ jsxs("button", { type: "button", disabled: questionIndex === 0, onClick: () => setQuestionIndex((value) => Math.max(0, value - 1)), className: "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] disabled:opacity-35", "data-testid": "button-quiz-previous", children: [
            /* @__PURE__ */ jsx(ChevronLeft, { size: 16 }),
            " Previous"
          ] }),
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setQuestionIndex((value) => value < quiz.length - 1 ? value + 1 : 0), className: "flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-xs font-bold text-[hsl(var(--primary-foreground))] transition hover:brightness-110", "data-testid": "button-quiz-next", children: [
            questionIndex === quiz.length - 1 ? "Start again" : "Next question",
            " ",
            /* @__PURE__ */ jsx(ChevronRight, { size: 16 })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("aside", { className: "rounded-[1.35rem] border border-[hsl(var(--border))] bg-[hsl(var(--card)/.7)] p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]", children: "Your score" }),
          /* @__PURE__ */ jsx(Target, { size: 17, className: "text-[hsl(var(--primary))]" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 flex items-end gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "display-font text-5xl font-semibold tracking-[-0.06em]", "data-testid": "text-quiz-score", children: correctCount }),
          /* @__PURE__ */ jsxs("span", { className: "mb-1 text-sm font-semibold text-[hsl(var(--muted-foreground))]", children: [
            "/ ",
            quiz.length
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]", children: correctCount === 0 ? "No pressure. Start with the first question." : correctCount === quiz.length ? "Clean sweep. Your brief is sticking." : "Keep going \u2014 every answer gives you a better map." }),
        /* @__PURE__ */ jsx("div", { className: "mt-7 grid grid-cols-5 gap-1.5", children: quiz.map((item, index) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setQuestionIndex(index), className: `h-7 rounded-md text-[10px] font-bold transition ${index === questionIndex ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : answers[item.id] === item.correctAnswer ? "bg-[hsl(142_42%_45%)/.18] text-[hsl(142_38%_31%)]" : answers[item.id] ? "bg-[hsl(var(--destructive)/.13)] text-[hsl(var(--destructive))]" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]"}`, "data-testid": `button-quiz-question-${index + 1}`, children: index + 1 }, item.id)) })
      ] })
    ] })
  ] });
}
function FlashcardsView({ flashcards }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = flashcards[cardIndex];
  const goTo = (next) => {
    setCardIndex((next + flashcards.length) % flashcards.length);
    setFlipped(false);
  };
  if (!card) return null;
  return /* @__PURE__ */ jsxs("section", { className: "rise-in", "data-testid": "section-flashcards", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--primary))]", children: "Recall cards" }),
        /* @__PURE__ */ jsx("h2", { className: "display-font mt-1 text-2xl font-semibold tracking-[-0.035em]", children: "Give your memory a handle." })
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-[hsl(var(--muted-foreground))]", "data-testid": "text-flashcard-progress", children: [
        "Card ",
        cardIndex + 1,
        " of ",
        flashcards.length
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4 h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full bg-[hsl(var(--accent))] transition-all duration-500", style: { width: `${(cardIndex + 1) / flashcards.length * 100}%` } }) }),
      /* @__PURE__ */ jsx("div", { className: "flashcard-scene min-h-[350px] sm:min-h-[390px]", children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setFlipped((value) => !value), className: `flashcard-inner relative min-h-[350px] w-full text-left sm:min-h-[390px] ${flipped ? "is-flipped" : ""}`, "data-testid": "button-flip-flashcard", "aria-label": flipped ? "Show flashcard question" : "Reveal flashcard answer", children: [
        /* @__PURE__ */ jsxs("div", { className: "flashcard-face soft-shadow absolute inset-0 flex min-h-[350px] flex-col justify-between rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 sm:min-h-[390px] sm:p-10", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]", children: [
            /* @__PURE__ */ jsx("span", { children: "Prompt" }),
            /* @__PURE__ */ jsx(FlipHorizontal2, { size: 17, className: "text-[hsl(var(--primary))]" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "mb-4 h-1 w-10 rounded-full bg-[hsl(var(--accent))]" }),
            /* @__PURE__ */ jsx("h3", { className: "max-w-2xl text-2xl font-bold leading-[1.35] tracking-[-0.035em] sm:text-3xl", "data-testid": `text-flashcard-front-${card.id}`, children: card.front })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]", children: [
            /* @__PURE__ */ jsx(FlipHorizontal2, { size: 14 }),
            " Click to reveal"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flashcard-face flashcard-back absolute inset-0 flex min-h-[350px] flex-col justify-between rounded-[1.5rem] bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))] sm:min-h-[390px] sm:p-10", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] opacity-65", children: [
            /* @__PURE__ */ jsx("span", { children: "Answer" }),
            /* @__PURE__ */ jsx(CheckCircle2, { size: 17, className: "text-[hsl(var(--accent))]" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold leading-[1.6] tracking-[-0.02em] sm:text-2xl", "data-testid": `text-flashcard-back-${card.id}`, children: card.back }),
          /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold opacity-65", children: "Click to see the prompt again" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-center gap-3", children: [
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => goTo(cardIndex - 1), className: "flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.7)] px-4 py-2.5 text-xs font-bold transition hover:bg-[hsl(var(--muted))]", "data-testid": "button-flashcard-previous", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { size: 15 }),
          " Previous"
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setFlipped((value) => !value), className: "flex items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-xs font-bold text-[hsl(var(--accent-foreground))] transition hover:brightness-105", "data-testid": "button-flashcard-flip", children: [
          /* @__PURE__ */ jsx(FlipHorizontal2, { size: 15 }),
          " ",
          flipped ? "Show prompt" : "Reveal answer"
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => goTo(cardIndex + 1), className: "flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.7)] px-4 py-2.5 text-xs font-bold transition hover:bg-[hsl(var(--muted))]", "data-testid": "button-flashcard-next", children: [
          "Next ",
          /* @__PURE__ */ jsx(ArrowRight, { size: 15 })
        ] })
      ] })
    ] })
  ] });
}
function LoadingDesk() {
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-[900px] py-9 sm:py-16", "data-testid": "status-generating", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/.2)] text-[hsl(var(--accent-foreground))]", children: /* @__PURE__ */ jsx(Sparkles, { size: 18 }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-bold", children: "Making your study set" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-[hsl(var(--muted-foreground))]", children: "Finding the signal in your reading\u2026" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4 rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card)/.75)] p-6 sm:p-9", children: [
      /* @__PURE__ */ jsx("div", { className: "skeleton-line h-3 w-28 rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "skeleton-line h-10 w-4/5 rounded-lg" }),
      /* @__PURE__ */ jsx("div", { className: "skeleton-line h-4 w-full rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "skeleton-line h-4 w-11/12 rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "skeleton-line h-4 w-3/5 rounded-full" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 grid gap-4 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsx("div", { className: "skeleton-line h-28 rounded-xl" }),
        /* @__PURE__ */ jsx("div", { className: "skeleton-line h-28 rounded-xl" }),
        /* @__PURE__ */ jsx("div", { className: "skeleton-line h-28 rounded-xl" })
      ] })
    ] })
  ] });
}
function EmptyState({ onNewUpload }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-[58vh] flex-col items-center justify-center text-center", "data-testid": "status-empty", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/.2)] text-[hsl(var(--accent-foreground))]", children: /* @__PURE__ */ jsx(BookOpen, { size: 28 }) }),
    /* @__PURE__ */ jsx("h2", { className: "display-font text-3xl font-semibold tracking-[-0.04em]", children: "Your desk is clear." }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]", children: "Upload a PDF when you are ready. We will turn it into a study plan you can actually finish." }),
    /* @__PURE__ */ jsxs("button", { type: "button", onClick: onNewUpload, className: "mt-7 flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 hover:brightness-110", "data-testid": "button-empty-upload", children: [
      /* @__PURE__ */ jsx(Upload, { size: 16 }),
      " Upload a study PDF"
    ] })
  ] });
}
function Workspace() {
  const [material, setMaterial] = useState(null);
  const [file, setFile] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [showUpload, setShowUpload] = useState(true);
  const generator = useMutation({
    mutationFn: async (selectedFile) => {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await fetch("/api/study-materials/generate", {
        method: "POST",
        body: formData
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || result.message || "Unable to generate study materials.");
      }
      return result;
    }
  });
  const isPending = generator.isPending;
  const handleFile = (nextFile) => {
    setValidationError(null);
    if (nextFile.type !== "application/pdf" && !nextFile.name.toLowerCase().endsWith(".pdf")) {
      setValidationError("Please choose a PDF file.");
      setFile(null);
      return;
    }
    if (nextFile.size > 20 * 1024 * 1024) {
      setValidationError("That file is larger than 20 MB.");
      setFile(null);
      return;
    }
    setFile(nextFile);
    setShowUpload(true);
  };
  const generate = () => {
    if (!file) return;
    generator.mutate(file, {
      onSuccess: (result) => {
        setMaterial(result);
        setActiveTab("summary");
        setShowUpload(false);
      }
    });
  };
  const startNew = () => {
    setMaterial(null);
    setFile(null);
    setValidationError(null);
    setActiveTab("summary");
    setShowUpload(true);
    generator.reset();
  };
  const error = generator.error ?? (validationError ? new Error(validationError) : null);
  const hasMaterial = Boolean(material && !showUpload);
  return /* @__PURE__ */ jsxs("div", { className: "study-shell flex min-h-dvh", children: [
    /* @__PURE__ */ jsx(Sidebar, { material, activeTab, onTabChange: (tab) => {
      if (material) {
        setActiveTab(tab);
        setShowUpload(false);
      }
    }, onNewUpload: startNew }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsx(MobileHeader, { material: material && !showUpload ? material : null, activeTab, onTabChange: (tab) => {
        setActiveTab(tab);
        setShowUpload(false);
      }, onNewUpload: startNew }),
      /* @__PURE__ */ jsxs("header", { className: "hidden items-center justify-between px-6 py-5 lg:flex xl:px-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]", children: [
          /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" }),
          " Workspace ",
          /* @__PURE__ */ jsx("span", { className: "text-[hsl(var(--border))]", children: "/" }),
          " ",
          hasMaterial ? "Current study set" : "Start a new set"
        ] }),
        /* @__PURE__ */ jsx(HealthPill, {})
      ] }),
      /* @__PURE__ */ jsx("main", { className: "mx-auto max-w-[1280px] px-4 pb-12 sm:px-6 lg:px-10 lg:pb-16", children: !material && !showUpload ? /* @__PURE__ */ jsx(EmptyState, { onNewUpload: () => setShowUpload(true) }) : isPending ? /* @__PURE__ */ jsx(LoadingDesk, {}) : material && !showUpload ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(MaterialHeader, { material, activeTab, onTabChange: setActiveTab, onNewUpload: startNew }),
        activeTab === "summary" && /* @__PURE__ */ jsx(SummaryView, { summary: material.summary }),
        activeTab === "quiz" && /* @__PURE__ */ jsx(QuizView, { quiz: material.quiz }),
        activeTab === "flashcards" && /* @__PURE__ */ jsx(FlashcardsView, { flashcards: material.flashcards })
      ] }) : /* @__PURE__ */ jsx(UploadDesk, { file, onFile: handleFile, onGenerate: generate, onClear: () => {
        setFile(null);
        setValidationError(null);
        generator.reset();
      }, isPending, error }) })
    ] })
  ] });
}
function RoutedErrorBoundary({ children }) {
  const [location] = useLocation();
  return /* @__PURE__ */ jsx(ErrorBoundary, { resetKey: location, children });
}
function Router() {
  return /* @__PURE__ */ jsx(RoutedErrorBoundary, { children: /* @__PURE__ */ jsxs(Switch, { children: [
    /* @__PURE__ */ jsx(Route, { path: "/", component: Workspace }),
    /* @__PURE__ */ jsx(Route, { component: NotFound })
  ] }) });
}
function App() {
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxs(TooltipProvider, { children: [
    /* @__PURE__ */ jsx(WouterRouter, { base: import.meta.env.BASE_URL.replace(/\/$/, ""), children: /* @__PURE__ */ jsx(Router, {}) }),
    /* @__PURE__ */ jsx(Toaster, {})
  ] }) });
}
var App_default = App;
export {
  App_default as default
};
