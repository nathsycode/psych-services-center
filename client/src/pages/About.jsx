import TeamIntro from '../components/about/TeamIntro';
import TeamMembers from '../components/about/TeamMembers';

export default function About() {

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div>
        <TeamIntro />
      </div>

      <div>
        <TeamMembers />
      </div>
    </section>
  )
}
