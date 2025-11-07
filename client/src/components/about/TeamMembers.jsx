import TeamMemberCard from './TeamMemberCard';

const teamMembers = [
  {
    name: 'Dr. Ana Reyes',
    title: 'Clinical Director, Licensed Psychologist'
  }
]
export default function TeamMembers() {
  return (
    <div>
      {teamMembers.map((member, i) => (
        <TeamMemberCard key={i} member={member} index={i} />
      ))}
    </div>
  )
}
