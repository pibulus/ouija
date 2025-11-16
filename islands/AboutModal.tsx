import { useEffect } from "preact/hooks";
import { signal } from "@preact/signals";

/**
 * 👻 About Modal Component - Ouija Board Edition
 *
 * Spooky mystical modal explaining the spirit board app.
 *
 * Built by Pablo for the deadzone 🎸
 */

// Global signal for modal state
export const aboutModalOpen = signal(false);

// Helper to open modal from anywhere
export function openAboutModal() {
  aboutModalOpen.value = true;
}

// Helper to close modal
export function closeAboutModal() {
  aboutModalOpen.value = false;
}

export function AboutModal() {
  const isOpen = aboutModalOpen.value;

  useEffect(() => {
    // Close on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeAboutModal();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        class="about-backdrop"
        onClick={closeAboutModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
      >
        {/* Modal */}
        <div
          class="about-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div class="about-header">
            <div class="about-header-content">
              <h2 id="about-modal-title" class="about-title">
                Ghost Notes
              </h2>
              <p class="about-eyebrow">
                A digital séance
              </p>
            </div>
            <button
              onClick={closeAboutModal}
              class="about-close"
              aria-label="Close about dialog"
            >
              ×
            </button>
          </div>

          {/* Content - Scrollable */}
          <div class="about-content">
            {/* Story */}
            <p class="about-text">
              I'm Pablo. I build tools with personality. This one explores the
              mystical space between typing and not typing—a spirit board for
              the digital age.
            </p>

            {/* What it's for */}
            <div class="about-highlight">
              <p class="about-text-sm">
                Watch messages arrive from the ether. Type without touching a
                text field. Let the planchette guide your words across the
                board.
              </p>
              <p class="about-text-sm">
                It's playful, it's weird, and it's free. A meditation on input
                methods and mysticism.
              </p>
            </div>

            {/* Links */}
            <div class="about-links-section">
              <p class="about-links-label">
                More experiments & tools:
              </p>
              <div class="about-links">
                <a
                  href="https://pibul.us"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="about-link about-link-primary"
                >
                  Portfolio
                </a>
                <a
                  href="https://github.com/pibulus"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="about-link about-link-secondary"
                >
                  GitHub
                </a>
              </div>
            </div>

            {/* Footer */}
            <div class="about-footer">
              <p class="about-credit">
                Made in Melbourne with curiosity
              </p>
            </div>
          </div>

          {/* Hint */}
          <div class="about-hint">
            <p>Press ESC or click outside to close</p>
          </div>
        </div>
      </div>

      <style>
        {`
          /* Backdrop */
          .about-backdrop {
            position: fixed;
            inset: 0;
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(12px);
            animation: fade-in 0.25s ease-out;
          }

          /* Modal container */
          .about-modal {
            position: relative;
            width: 100%;
            max-width: 560px;
            max-height: 90vh;
            overflow: hidden;
            animation: slide-in 0.3s ease-out;
          }

          /* Header */
          .about-header {
            padding: 1.5rem 1.75rem;
            background: rgba(28, 24, 32, 0.92);
            border: 2px solid rgba(88, 78, 98, 0.4);
            border-bottom: none;
            border-radius: 16px 16px 0 0;
            backdrop-filter: blur(18px);
            position: relative;
          }

          .about-header-content {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            padding-right: 2rem;
          }

          .about-title {
            font-size: clamp(1.5rem, 4vw, 2rem);
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: rgba(243, 230, 200, 0.95);
            font-weight: 700;
            line-height: 1.2;
            margin: 0;
          }

          .about-eyebrow {
            font-size: clamp(0.7rem, 1.5vw, 0.85rem);
            letter-spacing: 0.3em;
            text-transform: uppercase;
            color: rgba(180, 165, 145, 0.75);
            font-weight: 600;
            margin: 0;
          }

          .about-close {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid rgba(88, 78, 98, 0.5);
            background: rgba(45, 38, 52, 0.6);
            color: rgba(200, 185, 165, 0.9);
            font-size: 1.4rem;
            line-height: 1;
            cursor: pointer;
            transition: all 140ms ease;
            display: grid;
            place-items: center;
            padding: 0;
          }

          .about-close:hover {
            background: rgba(55, 48, 62, 0.85);
            border-color: rgba(88, 78, 98, 0.7);
            transform: scale(1.05);
          }

          /* Content */
          .about-content {
            padding: 1.75rem;
            background: rgba(18, 15, 24, 0.95);
            border: 2px solid rgba(88, 78, 98, 0.4);
            border-top: none;
            border-radius: 0 0 16px 16px;
            backdrop-filter: blur(16px);
            box-shadow: 0 16px 32px rgba(0, 0, 0, 0.6);
            overflow-y: auto;
            max-height: calc(90vh - 180px);
          }

          .about-text {
            font-size: clamp(0.9rem, 2vw, 1.05rem);
            line-height: 1.7;
            color: rgba(243, 230, 200, 0.9);
            margin: 0 0 1.25rem 0;
            letter-spacing: 0.02em;
          }

          .about-highlight {
            padding: 1rem 1.25rem;
            background: rgba(222, 202, 162, 0.12);
            border: 1.5px solid rgba(222, 202, 162, 0.25);
            border-radius: 12px;
            margin: 1.5rem 0;
          }

          .about-text-sm {
            font-size: clamp(0.8rem, 1.8vw, 0.95rem);
            line-height: 1.65;
            color: rgba(243, 230, 200, 0.85);
            margin: 0;
            letter-spacing: 0.02em;
          }

          .about-text-sm + .about-text-sm {
            margin-top: 0.75rem;
          }

          .about-links-section {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1.5px solid rgba(222, 202, 162, 0.2);
          }

          .about-links-label {
            font-size: clamp(0.75rem, 1.6vw, 0.85rem);
            text-align: center;
            color: rgba(243, 230, 200, 0.7);
            margin: 0 0 1rem 0;
            letter-spacing: 0.05em;
          }

          .about-links {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            flex-wrap: wrap;
          }

          .about-link {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.6rem 1.1rem;
            border: 2px solid;
            border-radius: 10px;
            font-size: clamp(0.75rem, 1.6vw, 0.9rem);
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            text-decoration: none;
            transition: all 160ms ease;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
          }

          .about-link-primary {
            background: rgba(222, 202, 162, 0.9);
            color: rgba(30, 20, 12, 0.95);
            border-color: rgba(58, 44, 28, 0.7);
          }

          .about-link-primary:hover {
            background: rgba(243, 230, 200, 1);
            transform: translateY(-2px);
            box-shadow: 0 5px 12px rgba(0, 0, 0, 0.4);
          }

          .about-link-secondary {
            background: rgba(30, 20, 12, 0.7);
            color: rgba(243, 230, 200, 0.95);
            border-color: rgba(58, 44, 28, 0.7);
          }

          .about-link-secondary:hover {
            background: rgba(30, 20, 12, 0.9);
            color: rgba(253, 240, 210, 1);
            transform: translateY(-2px);
            box-shadow: 0 5px 12px rgba(0, 0, 0, 0.4);
          }

          .about-link:active {
            transform: translateY(0);
          }

          .about-footer {
            margin-top: 1.5rem;
            padding-top: 1.25rem;
            border-top: 1.5px solid rgba(222, 202, 162, 0.2);
            text-align: center;
          }

          .about-credit {
            font-size: clamp(0.7rem, 1.4vw, 0.8rem);
            color: rgba(243, 230, 200, 0.5);
            margin: 0;
            letter-spacing: 0.05em;
          }

          .about-hint {
            text-align: center;
            margin-top: 1rem;
          }

          .about-hint p {
            font-size: clamp(0.65rem, 1.3vw, 0.75rem);
            color: rgba(243, 230, 200, 0.5);
            margin: 0;
            letter-spacing: 0.05em;
          }

          /* Animations */
          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slide-in {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          /* Mobile adjustments */
          @media (max-width: 640px) {
            .about-header {
              padding: 1.25rem 1.5rem;
            }

            .about-content {
              padding: 1.5rem 1.25rem;
            }

            .about-hint {
              display: none;
            }
          }
        `}
      </style>
    </>
  );
}

/**
 * 🔘 About Link Component
 *
 * Simple link/button that opens the About modal.
 */

interface AboutLinkProps {
  label?: string;
  className?: string;
}

export function AboutLink({
  label = "About",
  className = "",
}: AboutLinkProps) {
  return (
    <button
      onClick={openAboutModal}
      className={className}
    >
      {label}
    </button>
  );
}
