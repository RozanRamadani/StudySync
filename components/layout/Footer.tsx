"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-color)",
        padding: "1.5rem 2rem",
        transition: "background-color 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12" stroke="var(--accent-blue)" strokeWidth="2" />
            <circle cx="14" cy="14" r="3" fill="var(--accent-blue)" />
          </svg>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--accent-blue)",
            }}
          >
            StudySync
          </span>
        </div>

        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          © 2026 StudySync - Sophisticated AI Recommendation System
        </p>

        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Methodology", "API Documentation", "Support"].map((label) => (
            <Link
              key={label}
              href="#"
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "var(--accent-blue)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "var(--text-muted)")
              }
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
