export type LocationFaq = { q: string; a: string };

export type Location = {
  slug: string;
  city: string;
  name: string;
  region: string;
  street: string;
  cityStateZip: string;
  phone: string;
  mapQuery: string;
  metaTitle: string;
  metaDescription: string;
  heroLede: string;
  welcomeHeading: string;
  welcome: string[];
  highlights: { title: string; body: string }[];
  programSlugs: string[];
  scheduleNote: string;
  photos: { hero: string; welcome: string; card: string; gallery: string[] };
  testimonial: { quote: string; attribution: string };
  faqs: LocationFaq[];
};

export const locations: Location[] = [
  {
    slug: 'germantown',
    city: 'Germantown',
    name: 'Somos Early Learning — Germantown',
    region: 'Montgomery County',
    street: '13700 Schaeffer Road',
    cityStateZip: 'Germantown, MD 20874',
    phone: '240-863-4326',
    mapQuery: '13700 Schaeffer Road, Germantown, MD 20874',
    metaTitle: 'Bilingual Montessori Preschool in Germantown, MD | Somos',
    metaDescription:
      'Somos Early Learning in Germantown offers bilingual Montessori preschool for children ages 2–5 on Schaeffer Road. Schedule a tour of our Montgomery County school.',
    heroLede:
      'Bilingual Montessori early learning for children ages 2–5 in Montgomery County.',
    welcomeHeading: 'A calm, unhurried start on Schaeffer Road',
    welcome: [
      'Our Germantown school is built around small groups and long, uninterrupted stretches of work time. Children arrive, greet their teachers, choose something meaningful to do and settle in — often for far longer than families expect a two- or three-year-old to concentrate.',
      'Spanish is part of that same ordinary rhythm. It shows up in greetings, songs, counting, mealtimes and conversation, so children absorb it the way they absorb any language at this age: through people they trust, repeated every day.',
    ],
    highlights: [
      {
        title: 'Small groups, familiar faces',
        body: 'Children stay with the same teachers and classmates long enough to build real relationships — the thing that makes a young child brave enough to try something new.',
      },
      {
        title: 'A classroom children can run themselves',
        body: 'Materials sit on low, open shelves. Children choose their work, carry it to a table and put it back when they are finished, which is where independence quietly begins.',
      },
      {
        title: 'Outdoor time, every day it is possible',
        body: 'Movement is not a reward for finishing work. Running, climbing and digging are part of how three-year-olds build focus and coordination.',
      },
    ],
    programSlugs: ['pre-primary', 'primary', 'enrichment'],
    scheduleNote:
      'School-year programming with before-school and after-school care available. Daily hours and schedule options vary — call the Germantown school for current availability.',
    photos: {
      hero: 'germantown-hero',
      welcome: 'germantown-welcome',
      card: 'loc-germantown',
      gallery: [
        'germantown-gallery-1',
        'germantown-gallery-2',
        'germantown-gallery-3',
        'germantown-gallery-4',
      ],
    },
    testimonial: {
      quote:
        'What surprised us was how much she started doing on her own at home — pouring her own water, putting her shoes away, telling us about her day in two languages.',
      attribution: 'Somos Parent, Germantown',
    },
    faqs: [
      {
        q: 'What ages does the Germantown school serve?',
        a: 'Germantown serves children approximately ages 2 through 5, across Pre-Primary and Primary classrooms. The right classroom depends on your child’s age and readiness, which we talk through during your tour.',
      },
      {
        q: 'Does my child need to speak Spanish?',
        a: 'No. Most children arrive with no Spanish at all. Spanish is woven into the day through songs, routines and conversation, so children build comfort and comprehension at their own pace.',
      },
      {
        q: 'Is before- and after-school care available?',
        a: 'Yes, before-school and after-school care are offered at Germantown. Exact hours and availability change through the year, so please confirm current options with the school.',
      },
      {
        q: 'Can you support a child with an IFSP or IEP?',
        a: 'Somos welcomes children with IFSP and IEP plans. The best next step is a conversation with the school about your child’s plan and what support looks like day to day.',
      },
      {
        q: 'How do I schedule a visit?',
        a: 'Request a tour through the form on this site or call 240-863-4326. Tours are the fastest way to understand how a Somos classroom actually feels.',
      },
    ],
  },
  {
    slug: 'ellicott-city',
    city: 'Ellicott City',
    name: 'Somos Early Learning — Ellicott City',
    region: 'Howard County',
    street: '4649 Columbia Road',
    cityStateZip: 'Ellicott City, MD 21042',
    phone: '443-299-7090',
    mapQuery: '4649 Columbia Road, Ellicott City, MD 21042',
    metaTitle: 'Bilingual Montessori Preschool in Ellicott City, MD | Somos',
    metaDescription:
      'Somos Early Learning in Ellicott City offers bilingual Montessori preschool for children ages 2–5 on Columbia Road. Schedule a tour of our Howard County school.',
    heroLede:
      'Bilingual Montessori early learning for children ages 2–5 in Howard County.',
    welcomeHeading: 'Room to try, repeat and get it right',
    welcome: [
      'On Columbia Road, the day is shaped around one idea: young children learn by doing things themselves, over and over, until the skill belongs to them. Teachers show a child how something works once, carefully — then step back and let the repetition do its work.',
      'Families often notice the sound of the room first. It is busy but not loud, because children are genuinely occupied. Spanish and English move through that hum together, in greetings, stories, songs and the small negotiations of sharing a classroom.',
    ],
    highlights: [
      {
        title: 'Lessons that meet one child at a time',
        body: 'Instead of one lesson delivered to a whole group, teachers work with individual children and small groups, so a child is neither held back nor pushed past what they are ready for.',
      },
      {
        title: 'Mixed ages, real leadership',
        body: 'Older children show younger ones how the classroom works. Explaining something to someone else is one of the surest signs a child truly understands it.',
      },
      {
        title: 'Care that stretches around your day',
        body: 'Before-school and after-school care keep the same calm tone as the school day, so pick-up at five feels like the same school as drop-off at eight.',
      },
    ],
    programSlugs: ['pre-primary', 'primary', 'enrichment'],
    scheduleNote:
      'School-year programming with before-school and after-school care available, plus summer programming in some years. Call the Ellicott City school for current hours and availability.',
    photos: {
      hero: 'ellicott-city-hero',
      welcome: 'ellicott-city-welcome',
      card: 'loc-ellicott-city',
      gallery: [
        'ellicott-city-gallery-1',
        'ellicott-city-gallery-2',
        'ellicott-city-gallery-3',
        'ellicott-city-gallery-4',
      ],
    },
    testimonial: {
      quote:
        'He asks to go to school on Saturdays. That tells me more about this place than anything I could have read before we enrolled.',
      attribution: 'Somos Parent, Ellicott City',
    },
    faqs: [
      {
        q: 'What ages does the Ellicott City school serve?',
        a: 'Ellicott City serves children approximately ages 2 through 5. Placement depends on your child’s age and readiness rather than a birthday cut-off alone.',
      },
      {
        q: 'How much Spanish will my child actually hear?',
        a: 'Spanish is present throughout the day in routines, songs, stories and conversation. We aim for comfort, comprehension and cultural connection rather than promising fluency.',
      },
      {
        q: 'What does a typical day look like?',
        a: 'A long morning work period, group time, outdoor play, lunch, rest or quiet work for younger children, and an afternoon that mixes enrichment with continued classroom work.',
      },
      {
        q: 'Do you offer summer programming?',
        a: 'Summer programming is offered in some years and varies by location. Ask the school what is planned for the upcoming summer.',
      },
      {
        q: 'How do I schedule a visit?',
        a: 'Request a tour through the form on this site or call 443-299-7090. We will find a time when the classroom is in full swing.',
      },
    ],
  },
];

export const locationBySlug = (slug: string) => locations.find((l) => l.slug === slug);
