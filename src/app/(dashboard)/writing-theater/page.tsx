'use client';

import { WritingTheater } from '@/components/writing-theater';
import { useRouter } from 'next/navigation';

// Demo content for testing
const DEMO_CONTENT = `The door to Elena's apartment swung open with a groan that seemed to echo through the empty hallway. She stood in the doorway, keys still dangling from her fingers, taking in the destruction.

Everything was wrong.

Her books—her precious first editions—lay scattered across the floor like fallen soldiers. The couch cushions had been slashed, foam innards spilling out in white clouds. And on the far wall, spray-painted in crimson letters that dripped like fresh wounds, a single word:

REMEMBER

Elena's throat tightened. Her hand found the doorframe, steadying herself as memories crashed over her like waves. The warehouse. The fire. The screaming.

Marcus.

She'd spent three years running from that name, building a new life in this cramped Chicago apartment. Teaching creative writing to bored undergraduates. Pretending that the girl who'd watched a man burn wasn't the same person who graded essays on metaphor and theme.

But someone had found her.

Her phone buzzed in her pocket, startling her into motion. She pulled it out with trembling hands, expecting—what? A threat? A ransom demand? 

Instead, a text from an unknown number:

*You have 48 hours to return what you stole. Or this time, you won't walk away.*

Elena sank to her knees among the ruined books, her carefully constructed life crumbling around her like ash. She knew what they wanted. The only question was whether she was willing to burn again to keep it.`;

export default function WritingTheaterPage() {
  const router = useRouter();

  return (
    <WritingTheater
      initialContent={DEMO_CONTENT}
      chapterTitle="The Return"
      chapterNumber={1}
      bookTitle="Ashes and Echoes"
      onSave={async (content) => {
        // In a real app, this would save to the database
        console.log('Saving content:', content.length, 'characters');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save delay
      }}
      onBack={() => router.push('/dashboard')}
    />
  );
}
