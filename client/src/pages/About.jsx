import TeamIntro from '../components/about/TeamIntro';
import TeamMembers from '../components/about/TeamMembers';

export default function About() {

  return (
    <main className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-sky-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4 pb-24">
        <TeamIntro />
        <section className="space-y-6">
          <div className="text-left">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Our People
            </p>
            <h2 className="text-heading text-slate-900">Meet the Team</h2>
            <p className="mt-2 max-w-2xl text-body text-slate-600">
              Each team member brings a distinct specialty, united by the same
              commitment to compassionate, evidence-informed care.
            </p>
          </div>
          <TeamMembers />
        </section>
      </div>
    </main>
  );
}
