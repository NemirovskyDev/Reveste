"use client";

/**
 * Último recurso: erro no layout raiz, onde nem o CSS do site está garantido. Por isso usa estilos próprios
 * e só tem o essencial (mensagem e botão para tentar de novo).
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#fbf8fc",
          color: "#3b3a42",
          fontFamily: "system-ui, sans-serif",
          padding: 24,
        }}
      >
        <main style={{ maxWidth: 480 }}>
          <h1 style={{ fontSize: 32, margin: "0 0 12px" }}>Algo deu errado</h1>
          <p style={{ fontSize: 18, margin: "0 0 24px", lineHeight: 1.5 }}>
            Não conseguimos carregar o site. Tente de novo em instantes.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              minHeight: 48,
              padding: "0 24px",
              fontSize: 16,
              fontWeight: 700,
              color: "#fbf8fc",
              background: "#3b3a42",
              border: "2px solid #3b3a42",
              borderRadius: 999,
              cursor: "pointer",
            }}
          >
            Tentar de novo
          </button>
        </main>
      </body>
    </html>
  );
}
