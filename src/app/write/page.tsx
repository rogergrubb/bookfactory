'use client';

import { WritingTheater } from '@/components/writing-theater';

// Engaging demo content for shareable link
const SHARE_CONTENT = `The door to Elena's apartment swung open with a groan that seemed to echo through the empty hallway. She stood in the doorway, keys still dangling from her fingers, taking in the destruction.

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

Elena sank to her knees among the ruined books, her carefully constructed life crumbling around her like ash. She knew what they wanted. The only question was whether she was willing to burn again to keep it.

---

Try the AI tools on the left! Click "Analyze" and run "Pacing Analysis" or "Tension Map" to see BookFactory in action.`;

export default function WritePage() {
  return (
    <div className="min-h-screen bg-stone-950">
      <WritingTheater
        initialContent={SHARE_CONTENT}
        chapterTitle="Ashes and Echoes"
        chapterNumber={1}
        bookTitle="Demo Novel"
        onSave={async (content) => {
          console.log('Demo save:', content.length, 'characters');
        }}
      />
    </div>
  );
}
