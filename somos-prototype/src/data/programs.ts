export type Program = {
  slug: string;
  name: string;
  ages: string;
  cardSummary: string;
  photo: string;
  cta: string;
  intro: string;
  outcomes: { title: string; body: string }[];
  day?: string;
};

export const programs: Program[] = [
  {
    slug: 'pre-primary',
    name: 'Pre-Primary',
    ages: 'Approximately ages 2–3',
    cardSummary:
      'The first step away from your side: independence, first words in two languages, movement and the confidence that comes from doing it yourself.',
    photo: 'program-pre-primary',
    cta: 'Explore Pre-Primary',
    intro:
      'Two-year-olds are not waiting to become preschoolers. They are already working — on walking steadily, on making themselves understood, on being allowed to try. Pre-Primary gives that work a place to happen, with adults who slow down enough to let it.',
    outcomes: [
      {
        title: 'They learn to do it themselves',
        body: 'Hanging up a coat, carrying a tray, washing a table, choosing a snack. Small acts of self-reliance that add up to a child who believes they are capable.',
      },
      {
        title: 'Language arrives quickly',
        body: 'Teachers narrate, name and sing all day, in English and Spanish. Children go from pointing to asking, often faster than families expect.',
      },
      {
        title: 'Big movement, fine control',
        body: 'Climbing and running build the balance and strength that later let a child sit, focus and hold a pencil comfortably.',
      },
      {
        title: 'A first experience of community',
        body: 'Waiting a moment, taking turns and noticing how someone else feels — practised gently, every day, with support.',
      },
    ],
    day: 'A Pre-Primary morning is short cycles of activity balanced with movement, snack, singing and outdoor time, with plenty of room for a two-year-old to change their mind.',
  },
  {
    slug: 'primary',
    name: 'Primary',
    ages: 'Approximately ages 3–5',
    cardSummary:
      'Hands-on academics, real collaboration and leadership — the years where reading, mathematics and independence come together.',
    photo: 'program-primary',
    cta: 'Explore Primary',
    intro:
      'Between three and five, children move from exploring to building. Primary is where letters become words, quantities become mathematics, and a child who once needed help now shows someone else how it is done.',
    outcomes: [
      {
        title: 'Reading and writing, in their own time',
        body: 'Children trace letter shapes, hear the sounds inside words and begin to write before they read — a sequence that makes literacy feel like discovery rather than drilling.',
      },
      {
        title: 'Mathematics they can hold',
        body: 'Quantity is something to pick up and carry before it is something to write down. Concrete materials make place value, addition and fractions genuinely understandable.',
      },
      {
        title: 'Concentration that lasts',
        body: 'Long, uninterrupted work periods let a four-year-old stay with something difficult — the habit that matters most when school gets harder.',
      },
      {
        title: 'Ready for kindergarten, and for the room',
        body: 'Children leave able to manage their belongings, ask for help, resolve a disagreement and follow through on something they started.',
      },
    ],
    day: 'A Primary day centres on a long morning work period, with individual and small-group lessons, group time, Spanish, outdoor play and afternoon enrichment.',
  },
  {
    slug: 'enrichment',
    name: 'Extended & Enrichment',
    ages: 'Offerings vary by location',
    cardSummary:
      'Before- and after-school care, Spanish, art, movement and yoga, and seasonal programming where offered.',
    photo: 'program-enrichment',
    cta: 'Explore Programs',
    intro:
      'The hours around the school day should feel like the school day: familiar adults, a calm room and something worth doing. Enrichment is not filler — it is where many children find the thing they love.',
    outcomes: [
      {
        title: 'Art with real materials',
        body: 'Paint, clay, paper and glue, with the emphasis on the making rather than a finished product that looks like everyone else’s.',
      },
      {
        title: 'Movement and yoga',
        body: 'Stretching, balancing and breathing give children a physical vocabulary for calming themselves down — useful long after preschool.',
      },
      {
        title: 'Spanish enrichment',
        body: 'Songs, stories, games and conversation that deepen the Spanish children already hear throughout the day.',
      },
      {
        title: 'Care that fits a working week',
        body: 'Before-school and after-school care extend the day without changing its tone, and seasonal or summer programming is offered where available.',
      },
    ],
  },
];

export const programBySlug = (slug: string) => programs.find((p) => p.slug === slug);

export const montessoriPillars = [
  {
    name: 'Practical Life',
    body: 'Everyday activities — pouring, buttoning, sweeping, food preparation — that build coordination, responsibility and independence.',
  },
  {
    name: 'Language',
    body: 'Conversation, stories, songs and letter sounds in English and Spanish, so speaking, writing and reading grow together.',
  },
  {
    name: 'Mathematics',
    body: 'Quantity children can hold in their hands before it becomes a number on a page, making early maths concrete and unintimidating.',
  },
  {
    name: 'Sensorial',
    body: 'Materials that sharpen the senses — size, weight, colour, texture, sound — training children to notice small differences.',
  },
  {
    name: 'Culture & Geography',
    body: 'Maps, music, nature and stories from around the world, including the cultures inside our own classrooms.',
  },
] as const;

export const trustPoints = [
  { label: 'Bilingual English + Spanish', detail: 'Spanish woven through the whole day' },
  { label: 'Montessori-Inspired Learning', detail: 'Hands-on materials, child-led pace' },
  { label: 'Ages 2–5', detail: 'Pre-Primary through Primary' },
  { label: 'Small-Group Environment', detail: 'Familiar teachers, familiar faces' },
  { label: 'Maryland Licensed Programs', detail: 'Two schools, one approach' },
] as const;
