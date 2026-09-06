import Link from "next/link";

const FEATURES = [
  {
    number: "01",
    title: "Know what needs attention",
    description:
      "Ralvia reviews your invoices and highlights overdue, high-value, and high-risk items before they become bigger problems.",
  },
  {
    number: "02",
    title: "Follow up without the busywork",
    description:
      "Generate professional payment follow-ups in seconds, review them, make changes if needed, and approve before sending.",
  },
  {
    number: "03",
    title: "Ask your finance data",
    description:
      "Ask questions about customers, invoices, balances, and overdue payments in plain English or Arabic.",
  },
  {
    number: "04",
    title: "See what is coming next",
    description:
      "Use your historical invoice activity to forecast future invoice volume and prepare for upcoming financial periods.",
  },
  {
    number: "05",
    title: "Catch critical situations early",
    description:
      "Ralvia surfaces unusual or high-risk situations automatically so your team can act before cash flow is affected.",
  },
  {
    number: "06",
    title: "Understand the bigger picture",
    description:
      "Track receivables, overdue amounts, aging, invoice trends, and other important finance metrics from one place.",
  },
];

const WORKFLOW = [
  {
    number: "01",
    title: "Add your business data",
    description:
      "Bring your customers and invoices into Ralvia and keep everything organized in one workspace.",
  },
  {
    number: "02",
    title: "Ralvia analyzes the situation",
    description:
      "The agent reviews what is happening, identifies what requires attention, and explains why.",
  },
  {
    number: "03",
    title: "You stay in control",
    description:
      "Review recommended actions, approve what you want, and let Ralvia handle the repetitive work.",
  },
];

const FAQS = [
  {
    question: "Is Ralvia only for finance teams?",
    answer:
      "No. Ralvia is designed for small and medium businesses that need better control over invoices, customer payments, and financial follow-ups without requiring a large finance department.",
  },
  {
    question: "Can Ralvia send messages automatically?",
    answer:
      "Ralvia can prepare actions such as customer payment follow-ups, but important actions are designed around human approval so you stay in control.",
  },
  {
    question: "Can I ask Ralvia questions about my business?",
    answer:
      "Yes. You can ask questions about your actual customers, invoices, overdue balances, and other financial information directly through the finance agent.",
  },
  {
    question: "Does Ralvia support Arabic?",
    answer:
      "Yes. Ralvia is designed to support both English and Arabic interactions.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FBFAF8] text-[#14213D]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-[#14213D]/5 bg-[#FBFAF8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="font-serif text-2xl font-bold tracking-tight text-[#14213D]"
          >
            Ralvia
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-[#5B6472] transition hover:text-[#14213D]"
            >
              Product
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-[#5B6472] transition hover:text-[#14213D]"
            >
              How it works
            </a>

            <a
              href="#faq"
              className="text-sm font-medium text-[#5B6472] transition hover:text-[#14213D]"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-[#14213D] sm:block"
            >
              Log in
            </Link>

            <Link
              href="/login"
              className="group flex items-center gap-2 rounded-lg bg-[#14213D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D315B]"
            >
              Get started

              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-20 sm:pb-32 sm:pt-28">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2F6F4E]/15 bg-[#EAF2ED] px-3 py-1.5 text-xs font-semibold text-[#2F6F4E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2F6F4E]" />
              AI finance operations for growing businesses
            </div>

            <h1 className="mt-7 max-w-3xl font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-[#14213D] sm:text-6xl">
              Spend less time chasing invoices.
              <span className="block text-[#52617E]">
                Know exactly what to do next.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5B6472]">
              Ralvia helps businesses manage invoices, monitor receivables,
              identify financial risks, follow up with customers, and understand
              what needs attention — all from one intelligent workspace.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="group flex items-center gap-3 rounded-lg bg-[#14213D] px-6 py-3.5 font-semibold text-white transition hover:bg-[#1D315B]"
              >
                Start using Ralvia

                <span className="text-lg transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <a
                href="#how-it-works"
                className="group flex items-center gap-2 px-2 py-3 text-sm font-semibold text-[#14213D]"
              >
                See how it works

                <span className="transition-transform group-hover:translate-y-1">
                  ↓
                </span>
              </a>
            </div>
          </div>

          {/* Product preview card */}
          <div className="relative">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#EAF2ED] blur-3xl" />

            <div className="relative rounded-2xl border border-[#D8DCE3] bg-white p-6 shadow-[0_20px_60px_rgba(20,33,61,0.08)]">
              <div className="flex items-center justify-between border-b border-[#ECEDEF] pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A91A0]">
                    Today
                  </p>

                  <h2 className="mt-1 font-serif text-2xl font-semibold">
                    Needs attention
                  </h2>
                </div>

                <div className="rounded-full bg-[#FFF1EE] px-3 py-1 text-xs font-semibold text-[#A84C3D]">
                  3 items
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-[#EEE2DF] bg-[#FFFAF8] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">
                        Invoice #4812 is overdue
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#6C7480]">
                        $12,400 · 18 days overdue
                      </p>
                    </div>

                    <span className="text-[#A84C3D]">→</span>
                  </div>

                  <div className="mt-4 border-t border-[#EEE2DF] pt-3">
                    <p className="text-xs font-medium text-[#A84C3D]">
                      Recommended
                    </p>

                    <p className="mt-1 text-sm text-[#5B6472]">
                      Send payment follow-up today.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#E4E7EA] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        Customer payment risk
                      </p>

                      <p className="mt-1 text-sm text-[#6C7480]">
                        Review recent payment behavior
                      </p>
                    </div>

                    <span className="text-[#8A91A0]">→</span>
                  </div>
                </div>

                <div className="rounded-xl border border-[#E4E7EA] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        Invoice forecast updated
                      </p>

                      <p className="mt-1 text-sm text-[#6C7480]">
                        Next 3 months available
                      </p>
                    </div>

                    <span className="text-[#8A91A0]">→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-[#14213D]/10 bg-[#14213D]">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 text-white sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-white/50">
              LESS MANUAL FOLLOW-UP
            </p>
            <p className="mt-2 text-lg font-semibold">
              Focus on the invoices that matter.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white/50">
              BETTER VISIBILITY
            </p>
            <p className="mt-2 text-lg font-semibold">
              Understand receivables at a glance.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white/50">
              HUMAN CONTROL
            </p>
            <p className="mt-2 text-lg font-semibold">
              Review important actions before they happen.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24 sm:py-32"
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#2F6F4E]">
              Product
            </p>

            <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#14213D]">
              Your finance work, prioritized.
            </h2>
          </div>

          <p className="max-w-md leading-7 text-[#5B6472]">
            Instead of opening another dashboard and searching for problems,
            Ralvia brings the important work to you.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group flex min-h-[245px] flex-col justify-between rounded-xl border border-[#D8DCE3] bg-white p-6 transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(20,33,61,0.07)]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#A1A7B0]">
                    {feature.number}
                  </span>

                  <span className="text-lg text-[#A1A7B0] transition-transform group-hover:translate-x-1 group-hover:text-[#14213D]">
                    →
                  </span>
                </div>

                <h3 className="mt-8 text-lg font-bold text-[#14213D]">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#5B6472]">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-24 border-y border-[#D8DCE3] bg-white"
      >
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#2F6F4E]">
              How it works
            </p>

            <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight">
              From invoice data to action.
            </h2>
          </div>

          <div className="mt-16">
            {WORKFLOW.map((step, index) => (
              <div
                key={step.number}
                className="grid gap-5 border-t border-[#E4E5E7] py-8 md:grid-cols-[100px_1fr_1fr]"
              >
                <div className="font-serif text-3xl font-semibold text-[#C5C9CF]">
                  {step.number}
                </div>

                <h3 className="text-xl font-bold">
                  {step.title}
                </h3>

                <div className="flex items-start justify-between gap-5">
                  <p className="max-w-md leading-7 text-[#5B6472]">
                    {step.description}
                  </p>

                  {index < WORKFLOW.length - 1 && (
                    <span className="hidden text-xl text-[#B2B7BF] md:block">
                      ↓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent highlight */}
      <section className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="overflow-hidden rounded-2xl bg-[#14213D] px-7 py-10 text-white sm:px-12 sm:py-14">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                Ask Ralvia
              </span>

              <h2 className="mt-6 max-w-lg font-serif text-4xl font-semibold leading-tight">
                Your business data should be able to answer you.
              </h2>

              <p className="mt-5 max-w-lg leading-7 text-white/60">
                Ask about overdue invoices, customer balances, payment risks,
                or what needs attention today. Ralvia answers using your actual
                business information.
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 text-[#14213D]">
              <p className="text-sm font-semibold text-[#7A8290]">
                You
              </p>

              <p className="mt-2 font-medium">
                Which invoices should I follow up on today?
              </p>

              <div className="my-5 border-t border-[#ECEDEF]" />

              <p className="text-sm font-semibold text-[#2F6F4E]">
                Ralvia
              </p>

              <p className="mt-2 text-sm leading-6 text-[#5B6472]">
                You have 3 invoices that need attention today. Invoice #4812
                should be prioritized first because it has the highest overdue
                balance and has been outstanding for 18 days.
              </p>

              <button className="mt-5 flex items-center gap-2 text-sm font-bold text-[#14213D]">
                Review invoice
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="scroll-mt-24 border-y border-[#D8DCE3] bg-white"
      >
        <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#2F6F4E]">
              FAQ
            </p>

            <h2 className="mt-3 font-serif text-4xl font-semibold">
              A few things you may want to know.
            </h2>
          </div>

          <div className="mt-12 border-t border-[#D8DCE3]">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group border-b border-[#D8DCE3]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6">
                  <span className="font-bold text-[#14213D]">
                    {faq.question}
                  </span>

                  <span className="text-xl text-[#7A8290] transition-transform group-open:rotate-180">
                    ↓
                  </span>
                </summary>

                <p className="max-w-2xl pb-6 leading-7 text-[#5B6472]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="flex flex-col items-center rounded-2xl border border-[#D8DCE3] bg-white px-6 py-14 text-center sm:px-12 sm:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#2F6F4E]">
            Get started
          </p>

          <h2 className="mt-4 max-w-2xl font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Make invoice follow-up one less thing to worry about.
          </h2>

          <p className="mt-5 max-w-xl leading-7 text-[#5B6472]">
            See what requires attention, understand why, and move the work
            forward without spending your day searching through invoices.
          </p>

          <Link
            href="/login"
            className="group mt-8 flex items-center gap-3 rounded-lg bg-[#14213D] px-6 py-3.5 font-semibold text-white transition hover:bg-[#1D315B]"
          >
            Get started with Ralvia

            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D8DCE3]">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-xl font-bold text-[#14213D]">
              Ralvia
            </p>

            <p className="mt-1 text-xs text-[#8A91A0]">
              Finance operations, without the busywork.
            </p>
          </div>

          <p className="text-sm text-[#7A8290]">
            © {new Date().getFullYear()} Ralvia
          </p>
        </div>
      </footer>
    </main>
  );
}