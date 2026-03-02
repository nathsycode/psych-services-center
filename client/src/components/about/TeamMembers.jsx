import { useState } from "react";
import TeamMemberCard from "./TeamMemberCard";

const teamMembers = [
  {
    name: "Dr. Elena Marquez",
    title: "PhD",
    role: "Founder & Clinical Director",
    profession: "Licensed Clinical Psychologist",
    description:
      "Dr. Elena Marquez founded MindCare Center with a vision of blending evidence-based therapy with culturally responsive care. With over 15 years in clinical practice and academic training, she has worked across hospitals, private practice, and community mental health programs. Her leadership centers on ethical standards, measurable outcomes, and expanding access through teletherapy and digital tools. When she’s not in session or mentoring clinicians, she’s usually reading behavioral science research — or at home attempting to negotiate peace treaties between her two very opinionated cats.",
    videoName: "team-member-1.mp4",
  },
  {
    name: "Dr. Adrian Cole",
    title: "MD",
    role: "Medical Director & Consultant Psychiatrist",
    profession: "Board-Certified Psychiatrist",
    description:
      "Dr. Adrian Cole oversees psychiatric services and interdisciplinary collaboration at MindCare Center. Trained in adult psychiatry with advanced experience in mood and anxiety disorders, he integrates medication management with psychotherapy-informed care. He advocates for a whole-person approach, recognizing the interplay between biology, psychology, and environment. Outside the clinic, he’s known for long-distance cycling and a habit of turning complex neuroscience into surprisingly simple whiteboard sketches.",
    videoName: "team-member-3.mp4",
  },
  {
    name: "Lina Park",
    title: "MA, RPsy",
    role: "Director of Psychological Services",
    profession: "Registered Psychologist",
    description:
      "Lina Park leads the therapy team and supervises structured treatment programs for anxiety, depression, trauma, and workplace stress. With a background in both university counseling and corporate mental health initiatives, she brings a systems-oriented lens to client care. She is passionate about making therapy feel approachable rather than intimidating. If she’s not running a supervision session, she’s likely experimenting with new journaling frameworks or exploring cafés with a book on human behavior in hand.",
    videoName: "team-member-4.mp4",
  },
  {
    name: "Marcus Bennett",
    title: "MBA, RPm",
    role: "Director of Operations & Mental Health Programs",
    profession: "Registered Psychometrician",
    description:
      "Marcus Bennett bridges clinical insight with operational strategy. With formal training in psychometrics and healthcare management, he focuses on quality assurance, program development, and expanding digital access to services. He believes mental healthcare should be both compassionate and efficient. When not optimizing systems or analyzing outcome data, he’s building mechanical keyboards or testing productivity tools with the enthusiasm of a scientist running experiments.",
    videoName: "team-member-2.mp4",
  },
];

export default function TeamMembers() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section className="relative w-full space-y-10">
      {teamMembers.map((member, i) => (
        <TeamMemberCard
          key={i}
          member={member}
          index={i}
          isActive={hoveredIndex === i}
          isDimmed={hoveredIndex !== null && hoveredIndex !== i}
          onHover={() => setHoveredIndex(i)}
          onUnhover={() => setHoveredIndex(null)}
        />
      ))}
    </section>
  );
}
