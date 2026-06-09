import { TopNav } from "@/components/layout/TopNav";
import { AdminLogin } from "@/components/member/AdminLogin";
import { QAAccordion } from "@/components/member/QAAccordion";
import { QA_ITEMS, POLICY_SECTIONS } from "@/lib/data/member";

export default function MemberPage() {
  return (
    <div className="flex flex-col gap-8">
      <TopNav title="Member" />

      <AdminLogin />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold tracking-[-0.048px] text-white">
          Q&amp;A
        </h2>
        <QAAccordion items={QA_ITEMS} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold tracking-[-0.048px] text-white">
          Policy
        </h2>
        {POLICY_SECTIONS.map((section) => (
          <div
            key={section.title}
            className="rounded-[24px] bg-gray-90 p-4"
          >
            <h3 className="text-sm font-bold text-white">{section.title}</h3>
            <p className="mt-2 text-sm leading-[1.6] tracking-[-0.028px] text-gray-20">
              {section.content}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
