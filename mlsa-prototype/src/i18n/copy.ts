import type { L } from './types';

/**
 * The copy deck.
 *
 * Every user-facing string lives here in both languages. That is the point:
 * Spanish is not a translation layer bolted on top of an English site, it is
 * the same content deck with two columns. Nothing renders unless both columns
 * are filled in, which is enforced by the `L` type.
 *
 * The English is deliberately plain. Target reading level is roughly grade 6–8:
 * short sentences, everyday words, no legal terms of art without a gloss.
 * The Spanish is written as Spanish, not word-for-word from the English.
 *
 * PROTOTYPE COPY — not final brand messaging. Voice, naming and positioning
 * would be established through stakeholder research during brand discovery.
 */

const s = (en: string, es: string): L => ({ en, es });

export const COPY = {
  global: {
    skipToContent: s('Skip to main content', 'Saltar al contenido principal'),
    orgName: s('Montana Legal Services Association', 'Montana Legal Services Association'),
    orgShort: s('MLSA', 'MLSA'),
    prototypeBadge: s('Concept prototype', 'Prototipo conceptual'),
    prototypeNotice: s(
      'Concept prototype — created for discussion. Not an official Montana Legal Services Association website.',
      'Prototipo conceptual: creado para fines de discusión. No es un sitio web oficial de Montana Legal Services Association.',
    ),
    prototypeNoticeShort: s(
      'Concept prototype — not an official MLSA website.',
      'Prototipo conceptual: no es un sitio oficial de MLSA.',
    ),
    aboutThisConcept: s('About this concept', 'Acerca de este concepto'),
    getLegalHelp: s('Get Legal Help', 'Obtenga ayuda legal'),
    quickExit: s('Quick Exit', 'Salida rápida'),
    quickExitHelp: s(
      'Quick Exit can quickly move you away from this website, but it does not erase your browsing history.',
      'La salida rápida puede alejarlo rápidamente de este sitio web, pero no borra su historial de navegación.',
    ),
    search: s('Search', 'Buscar'),
    closeSearch: s('Close search', 'Cerrar búsqueda'),
    openMenu: s('Open menu', 'Abrir menú'),
    closeMenu: s('Close menu', 'Cerrar menú'),
    menu: s('Menu', 'Menú'),
    language: s('Language', 'Idioma'),
    switchToSpanish: s('Cambiar a español', 'Cambiar a español'),
    switchToEnglish: s('Switch to English', 'Switch to English'),
    espanol: s('Español', 'English'),
    learnMore: s('Learn more', 'Más información'),
    opensInNewTab: s('opens in a new tab', 'se abre en una pestaña nueva'),
    externalSite: s('External site', 'Sitio externo'),
    breadcrumb: s('Breadcrumb', 'Ruta de navegación'),
    home: s('Home', 'Inicio'),
    placeholder: s('Placeholder content', 'Contenido de ejemplo'),
    verifiedNote: s('Source: MLSA public materials', 'Fuente: materiales públicos de MLSA'),
    callHelpline: s('Call the HelpLine', 'Llame a la línea de ayuda'),
    helplineLabel: s('MLSA HelpLine', 'Línea de ayuda de MLSA'),
    applyOnline: s('Apply online', 'Solicite en línea'),
    visitMontanaLawHelp: s('Visit MontanaLawHelp', 'Visite MontanaLawHelp'),
    notALawFirmNote: s(
      'This prototype does not give legal advice and does not collect any personal information.',
      'Este prototipo no brinda asesoría legal ni recopila ninguna información personal.',
    ),
  },

  nav: {
    needHelp: s('Need Legal Help', 'Necesita ayuda legal'),
    ourWork: s('Our Work', 'Nuestro trabajo'),
    about: s('About MLSA', 'Acerca de MLSA'),
    getInvolved: s('Get Involved', 'Participe'),
    resources: s('Resources', 'Recursos'),
    primaryLabel: s('Main', 'Principal'),
    utilityLabel: s('Utility', 'Utilidades'),
  },

  home: {
    heroEyebrow: s('Free civil legal help in Montana', 'Ayuda legal civil gratuita en Montana'),
    heroTitle: s(
      'Civil legal help should be easier to find.',
      'Encontrar ayuda legal civil debería ser más fácil.',
    ),
    heroLead: s(
      'Free legal assistance, information and resources for Montanans who need them.',
      'Asistencia legal, información y recursos gratuitos para los habitantes de Montana que los necesitan.',
    ),
    heroSupport: s(
      'Montana Legal Services Association provides free civil legal services to eligible Montanans across the state.',
      'Montana Legal Services Association brinda servicios legales civiles gratuitos a habitantes de Montana que reúnen los requisitos, en todo el estado.',
    ),
    heroPrimaryCta: s('Get Legal Help', 'Obtenga ayuda legal'),
    heroSecondaryCta: s(
      'Find Legal Information & Forms',
      'Encuentre información y formularios legales',
    ),
    heroAside: s('If you are in immediate danger, call 911.', 'Si está en peligro inmediato, llame al 911.'),

    chooserTitle: s('What do you need today?', '¿Qué necesita hoy?'),
    chooserLead: s(
      'Choose the description that sounds most like you. Each one leads somewhere different.',
      'Elija la descripción que más se parezca a su situación. Cada una lleva a un lugar distinto.',
    ),

    issuesTitle: s('How MLSA helps', 'Cómo ayuda MLSA'),
    issuesLead: s(
      'MLSA handles civil legal problems — the kind that affect where you live, what you are owed, your safety and your family.',
      'MLSA atiende problemas legales civiles: los que afectan dónde vive, lo que se le debe, su seguridad y su familia.',
    ),
    issuesCta: s('Explore our work', 'Explore nuestro trabajo'),

    impactTitle: s(
      'Justice reaches every corner of Montana.',
      'La justicia llega a cada rincón de Montana.',
    ),
    impactLead: s(
      'MLSA has served Montanans since 1966, in every county in the state and on every Tribal Reservation.',
      'MLSA ha servido a los habitantes de Montana desde 1966, en todos los condados del estado y en todas las reservaciones tribales.',
    ),

    ecosystemTitle: s(
      'One mission. Different ways to get help.',
      'Una misión. Distintas formas de obtener ayuda.',
    ),
    ecosystemLead: s(
      'MLSA runs two things that people often confuse. Here is which one you probably want.',
      'MLSA administra dos servicios que suelen confundirse. Aquí puede ver cuál necesita.',
    ),
    ecosystemMlsaTitle: s('Montana Legal Services Association', 'Montana Legal Services Association'),
    ecosystemMlsaBody: s(
      'Direct legal assistance, advocacy and programs. This is where you apply to work with an advocate or attorney.',
      'Asistencia legal directa, defensa de derechos y programas. Aquí es donde solicita trabajar con un defensor o abogado.',
    ),
    ecosystemMlsaCta: s('Learn about MLSA', 'Conozca MLSA'),
    ecosystemMlhTitle: s('MontanaLawHelp.org', 'MontanaLawHelp.org'),
    ecosystemMlhBody: s(
      'Free legal information, forms, self-help resources and the online application for assistance. Maintained by MLSA.',
      'Información legal gratuita, formularios, recursos de autoayuda y la solicitud de asistencia en línea. Administrado por MLSA.',
    ),
    ecosystemMlhCta: s('Visit MontanaLawHelp', 'Visite MontanaLawHelp'),

    involvedTitle: s('Get involved', 'Participe'),
    involvedLead: s(
      'MLSA’s work depends on volunteer attorneys, donors and partner organizations across Montana.',
      'El trabajo de MLSA depende de abogados voluntarios, donantes y organizaciones aliadas en todo Montana.',
    ),
    volunteerTitle: s('Volunteer', 'Sea voluntario'),
    volunteerBody: s(
      'For Montana attorneys and other eligible volunteers who want to take pro bono work.',
      'Para abogados de Montana y otros voluntarios elegibles que quieran tomar casos pro bono.',
    ),
    donateTitle: s('Donate', 'Done'),
    donateBody: s(
      'Help expand access to civil legal services for Montanans who cannot afford a lawyer.',
      'Ayude a ampliar el acceso a servicios legales civiles para quienes no pueden pagar un abogado.',
    ),
    partnerTitle: s('Partner', 'Colabore'),
    partnerBody: s(
      'For community organizations, funders and institutions working alongside MLSA.',
      'Para organizaciones comunitarias, financiadores e instituciones que trabajan junto a MLSA.',
    ),
  },

  chooser: [
    {
      id: 'need-help',
      title: s('I need legal help', 'Necesito ayuda legal'),
      body: s(
        'I have a legal problem and want to find out if MLSA can help.',
        'Tengo un problema legal y quiero saber si MLSA puede ayudarme.',
      ),
      cta: s('Apply for help', 'Solicite ayuda'),
    },
    {
      id: 'need-info',
      title: s('I need information or forms', 'Necesito información o formularios'),
      body: s(
        'I want to understand my legal issue, find a form, or see what I can do myself.',
        'Quiero entender mi problema legal, encontrar un formulario o ver qué puedo hacer por mi cuenta.',
      ),
      cta: s('Visit MontanaLawHelp', 'Visite MontanaLawHelp'),
    },
    {
      id: 'attorney',
      title: s('I’m an attorney', 'Soy abogado o abogada'),
      body: s(
        'I’d like to volunteer my time or learn about pro bono opportunities.',
        'Me gustaría ofrecer mi tiempo como voluntario o conocer oportunidades pro bono.',
      ),
      cta: s('Volunteer with MLSA', 'Sea voluntario con MLSA'),
    },
    {
      id: 'support',
      title: s('I want to support MLSA', 'Quiero apoyar a MLSA'),
      body: s(
        'I want to donate, partner with MLSA, or support access to justice.',
        'Quiero donar, colaborar con MLSA o apoyar el acceso a la justicia.',
      ),
      cta: s('Ways to help', 'Formas de ayudar'),
    },
  ],

  getHelp: {
    title: s('Let’s find the right kind of help.', 'Encontremos el tipo de ayuda adecuado.'),
    lead: s(
      'Answering a few basic questions about what you need can help you find the right next step.',
      'Responder algunas preguntas básicas sobre lo que necesita puede ayudarle a encontrar el siguiente paso correcto.',
    ),
    navLabel: s('Get Legal Help', 'Obtenga ayuda legal'),
    routesTitle: s('Three ways to start', 'Tres formas de empezar'),

    applyTitle: s('Apply for legal help', 'Solicite ayuda legal'),
    applyBody: s(
      'If you have a civil legal problem in Montana, you can apply to see whether MLSA can help. The online application takes about 10 to 15 minutes and puts you on the call-back list.',
      'Si tiene un problema legal civil en Montana, puede solicitar ayuda para saber si MLSA puede asistirle. La solicitud en línea toma entre 10 y 15 minutos y lo coloca en la lista de devolución de llamadas.',
    ),
    applyCta: s('Start an application', 'Comience una solicitud'),
    applyNote: s(
      'The application is hosted on MontanaLawHelp.org, which MLSA maintains.',
      'La solicitud está alojada en MontanaLawHelp.org, que MLSA administra.',
    ),

    callTitle: s('Call the HelpLine', 'Llame a la línea de ayuda'),
    callBody: s(
      'You can apply by phone during HelpLine hours. If you reach a recording, the HelpLine is closed — the online application is open at any time.',
      'Puede solicitar ayuda por teléfono durante el horario de la línea de ayuda. Si escucha una grabación, la línea está cerrada; la solicitud en línea está disponible en todo momento.',
    ),
    callHoursLabel: s('Current hours', 'Horario actual'),
    callCta: s('Call 1-800-666-6899', 'Llame al 1-800-666-6899'),

    formsTitle: s('Find information and forms', 'Encuentre información y formularios'),
    formsBody: s(
      'MontanaLawHelp.org has free legal information, court forms and step-by-step guides. Many people solve their problem there without needing to apply.',
      'MontanaLawHelp.org tiene información legal gratuita, formularios judiciales y guías paso a paso. Muchas personas resuelven su problema allí sin necesidad de presentar una solicitud.',
    ),
    formsCta: s('Search MontanaLawHelp', 'Busque en MontanaLawHelp'),

    stepsTitle: s('What happens after I apply?', '¿Qué pasa después de solicitar ayuda?'),
    stepsLead: s(
      'Applying starts a review. It is not a guarantee that MLSA can take your case.',
      'Presentar una solicitud inicia una revisión. No es una garantía de que MLSA pueda aceptar su caso.',
    ),
    steps: [
      {
        title: s('Submit an application', 'Presente una solicitud'),
        body: s(
          'Online at any time, or by phone during HelpLine hours.',
          'En línea en cualquier momento, o por teléfono durante el horario de la línea de ayuda.',
        ),
      },
      {
        title: s('MLSA reviews your information', 'MLSA revisa su información'),
        body: s(
          'MLSA looks at your legal problem and your situation.',
          'MLSA analiza su problema legal y su situación.',
        ),
      },
      {
        title: s(
          'MLSA determines what assistance may be available',
          'MLSA determina qué asistencia podría estar disponible',
        ),
        body: s(
          'MLSA generally serves people with low or moderate income, and considers many factors — including age, domestic abuse situations and victim of crime status.',
          'MLSA generalmente atiende a personas con ingresos bajos o moderados, y considera muchos factores, incluidos la edad, situaciones de abuso doméstico y la condición de víctima de un delito.',
        ),
      },
      {
        title: s('You receive next-step information', 'Usted recibe información sobre los siguientes pasos'),
        body: s(
          'That may be advice, a referral, self-help resources, or representation. Resources are limited and MLSA cannot accept every case.',
          'Eso puede ser asesoría, una referencia, recursos de autoayuda o representación. Los recursos son limitados y MLSA no puede aceptar todos los casos.',
        ),
      },
    ],
    stepsDisclaimer: s(
      'Applying does not create an attorney-client relationship and does not guarantee that MLSA can accept your case.',
      'Presentar una solicitud no crea una relación abogado-cliente ni garantiza que MLSA pueda aceptar su caso.',
    ),

    accessTitle: s(
      'We want our services to be accessible.',
      'Queremos que nuestros servicios sean accesibles.',
    ),
    accessLead: s(
      'If something about applying is hard for you, that is worth telling us. Below is what this prototype can state, and what it deliberately cannot.',
      'Si algo del proceso de solicitud le resulta difícil, vale la pena decírnoslo. A continuación se indica lo que este prototipo puede afirmar y lo que deliberadamente no puede.',
    ),
    accessSpanishTitle: s('Spanish-language access', 'Acceso en español'),
    accessSpanishBody: s(
      'This prototype demonstrates a fully Spanish version of priority service content — navigation, the homepage, this page and every safety utility — rather than an automatic translation widget.',
      'Este prototipo muestra una versión completamente en español del contenido de servicio prioritario: la navegación, la página de inicio, esta página y todas las utilidades de seguridad, en lugar de un widget de traducción automática.',
    ),
    accessPhoneTitle: s('Apply by phone', 'Solicite por teléfono'),
    accessPhoneBody: s(
      'People who cannot use an online form can apply by calling the HelpLine during published hours.',
      'Las personas que no pueden usar un formulario en línea pueden solicitar ayuda llamando a la línea de ayuda durante el horario publicado.',
    ),
    accessInPersonTitle: s('Offices across Montana', 'Oficinas en Montana'),
    accessInPersonBody: s(
      'MLSA has offices in Billings, Helena and Missoula, and serves all 56 counties and every Tribal Reservation.',
      'MLSA tiene oficinas en Billings, Helena y Missoula, y atiende los 56 condados y todas las reservaciones tribales.',
    ),
    accessTbdTitle: s(
      'Interpretation, relay and alternative formats',
      'Interpretación, retransmisión y formatos alternativos',
    ),
    accessTbdBody: s(
      'A real site would state exactly which language, relay (711) and alternative-format services are available, and how to request them. We could not verify MLSA’s current policy from public materials, so this prototype shows the component and leaves the content to be confirmed rather than inventing a service.',
      'Un sitio real indicaría exactamente qué servicios de idioma, retransmisión (711) y formatos alternativos están disponibles, y cómo solicitarlos. No pudimos verificar la política actual de MLSA en materiales públicos, por lo que este prototipo muestra el componente y deja el contenido por confirmar en lugar de inventar un servicio.',
    ),

    safetyTitle: s('If you are worried about someone seeing this', 'Si le preocupa que alguien vea esto'),
    safetyBody: s(
      'Quick Exit is in the header on every page. It moves you to a neutral website right away. It does not erase your browsing history — you may want to use a device or browser that another person cannot check.',
      'La salida rápida está en el encabezado de todas las páginas. Lo lleva de inmediato a un sitio web neutral. No borra su historial de navegación; es posible que quiera usar un dispositivo o navegador que otra persona no pueda revisar.',
    ),
    safetyEmergency: s(
      'If you are in immediate danger, call 911.',
      'Si está en peligro inmediato, llame al 911.',
    ),

    faqTitle: s('Common questions', 'Preguntas frecuentes'),
    faq: [
      {
        q: s('Does MLSA handle criminal cases?', '¿MLSA atiende casos penales?'),
        a: s(
          'No. MLSA works on civil legal problems — non-criminal matters like housing, family, benefits, debt and safety.',
          'No. MLSA atiende problemas legales civiles: asuntos no penales como vivienda, familia, beneficios, deudas y seguridad.',
        ),
      },
      {
        q: s('Does it cost anything?', '¿Tiene algún costo?'),
        a: s(
          'MLSA provides free civil legal assistance to eligible Montanans.',
          'MLSA brinda asistencia legal civil gratuita a habitantes de Montana que reúnen los requisitos.',
        ),
      },
      {
        q: s('Who is eligible?', '¿Quién es elegible?'),
        a: s(
          'MLSA generally serves people with low or moderate income, and considers many factors including age, domestic abuse situations and victim of crime status. Eligibility is determined through the application.',
          'MLSA generalmente atiende a personas con ingresos bajos o moderados, y considera muchos factores, incluidos la edad, situaciones de abuso doméstico y la condición de víctima de un delito. La elegibilidad se determina mediante la solicitud.',
        ),
      },
      {
        q: s(
          'What if MLSA cannot take my case?',
          '¿Qué pasa si MLSA no puede aceptar mi caso?',
        ),
        a: s(
          'MontanaLawHelp.org has free legal information, forms and self-help guides you can use on your own, and lists other legal providers in Montana.',
          'MontanaLawHelp.org tiene información legal gratuita, formularios y guías de autoayuda que puede usar por su cuenta, y enumera otros proveedores legales en Montana.',
        ),
      },
    ],
  },

  ourWork: {
    title: s('Legal problems affect the rest of life.', 'Los problemas legales afectan el resto de la vida.'),
    lead: s(
      'A civil legal problem rarely stays in one place. An eviction can cost someone a job. A denied benefit can cost someone their medication. MLSA works on the legal problems that hold the rest of a person’s life together.',
      'Un problema legal civil rara vez se queda en un solo lugar. Un desalojo puede costarle el trabajo a alguien. Un beneficio negado puede costarle sus medicamentos. MLSA trabaja en los problemas legales que sostienen el resto de la vida de una persona.',
    ),
    filterLabel: s('Filter by area', 'Filtrar por área'),
    filterHint: s(
      'Filtering updates the list below.',
      'El filtro actualiza la lista de abajo.',
    ),
    resultsCount: (n: number): L => ({
      en: `Showing ${n} ${n === 1 ? 'area' : 'areas'} of work`,
      es: `Mostrando ${n} ${n === 1 ? 'área' : 'áreas'} de trabajo`,
    }),
    cardCta: s('Learn more', 'Más información'),
    examplesLabel: s('People often describe this as', 'Las personas suelen describirlo así'),

    systemicTitle: s('Two kinds of work', 'Dos tipos de trabajo'),
    systemicLead: s(
      'Most people meet MLSA through a single case. That is only half of what the organization does.',
      'La mayoría de las personas conocen MLSA a través de un solo caso. Eso es solo la mitad de lo que hace la organización.',
    ),
    caseWorkTitle: s('Helping one person', 'Ayudar a una persona'),
    caseWorkBody: s(
      'Advice, forms, brief help or full representation for an individual Montanan with a specific legal problem — an eviction notice, a protection order, a denied benefit.',
      'Asesoría, formularios, ayuda breve o representación completa para una persona de Montana con un problema legal específico: un aviso de desalojo, una orden de protección, un beneficio negado.',
    ),
    systemicWorkTitle: s('Changing what keeps happening', 'Cambiar lo que sigue ocurriendo'),
    systemicWorkBody: s(
      'When the same problem keeps arriving — the same unlawful lease clause, the same wrongly denied benefit — the fix is not one more case. Systemic advocacy addresses the rule, practice or policy causing the problem, so it stops reaching people in the first place.',
      'Cuando el mismo problema se repite —la misma cláusula ilegal de arrendamiento, el mismo beneficio negado indebidamente—, la solución no es un caso más. La defensa sistémica aborda la regla, práctica o política que causa el problema, para que deje de afectar a las personas.',
    ),
    systemicNote: s(
      'Both matter. One helps the person in front of you. The other reduces how many people end up there.',
      'Ambos importan. Uno ayuda a la persona que tiene enfrente. El otro reduce cuántas personas terminan en esa situación.',
    ),
  },

  about: {
    title: s('60 years of access to justice', '60 años de acceso a la justicia'),
    lead: s(
      'Montana Legal Services Association was founded on May 5, 1966 to provide civil legal aid to Montanans living in poverty. Six decades later, it serves every county in the state.',
      'Montana Legal Services Association se fundó el 5 de mayo de 1966 para brindar asistencia legal civil a los habitantes de Montana que viven en la pobreza. Seis décadas después, atiende a todos los condados del estado.',
    ),
    storyTitle: s('What MLSA does', 'Qué hace MLSA'),
    storyBody: s(
      'MLSA is a federally and privately funded nonprofit that provides free legal assistance in civil cases to low-income people in Montana. Civil means non-criminal: the problems that decide whether someone keeps their housing, their income, their benefits or their safety. MLSA does this through direct representation, advice, self-help resources published on MontanaLawHelp.org, and volunteer attorneys across the state.',
      'MLSA es una organización sin fines de lucro, financiada con fondos federales y privados, que brinda asistencia legal gratuita en casos civiles a personas de bajos ingresos en Montana. Civil significa no penal: los problemas que determinan si alguien conserva su vivienda, sus ingresos, sus beneficios o su seguridad. MLSA lo hace mediante representación directa, asesoría, recursos de autoayuda publicados en MontanaLawHelp.org y abogados voluntarios en todo el estado.',
    ),
    reachTitle: s('Across Montana', 'En todo Montana'),
    reachBody: s(
      'Montana is the fourth-largest state by area. Distance is itself a barrier to legal help. MLSA works from offices in Billings, Helena and Missoula, and provides services to people in all 56 counties and on every Tribal Reservation in the state.',
      'Montana es el cuarto estado más grande por superficie. La distancia es en sí misma una barrera para obtener ayuda legal. MLSA trabaja desde oficinas en Billings, Helena y Missoula, y brinda servicios a personas en los 56 condados y en todas las reservaciones tribales del estado.',
    ),
    officesLabel: s('Offices', 'Oficinas'),
    impactTitle: s('Impact', 'Impacto'),
    impactLead: s(
      'Only figures MLSA publishes are shown here.',
      'Aquí solo se muestran cifras que MLSA publica.',
    ),
    communitiesTitle: s('Working across communities', 'Trabajando con las comunidades'),
    communitiesBody: s(
      'MLSA’s work reaches communities with very different needs: people in rural counties hours from the nearest attorney, Native Montanans with matters in Tribal courts, agricultural and migrant workers, survivors of domestic violence, and older Montanans. MLSA also works alongside volunteer attorneys and community organizations across the state.',
      'El trabajo de MLSA llega a comunidades con necesidades muy distintas: personas en condados rurales a horas del abogado más cercano, nativos de Montana con asuntos en cortes tribales, trabajadores agrícolas y migrantes, sobrevivientes de violencia doméstica y personas mayores. MLSA también trabaja junto a abogados voluntarios y organizaciones comunitarias en todo el estado.',
    ),
    accountabilityTitle: s('Accountability', 'Rendición de cuentas'),
    accountabilityBody: s(
      'A funder or donor should be able to find governance and financial information without hunting for it. In a live site these would link to MLSA’s published materials.',
      'Un financiador o donante debería poder encontrar información sobre gobernanza y finanzas sin tener que buscarla. En un sitio real, estos enlaces llevarían a los materiales publicados por MLSA.',
    ),
    accountabilityItems: [
      s('Financial information', 'Información financiera'),
      s('Annual materials', 'Materiales anuales'),
      s('Funders', 'Financiadores'),
      s('Board & governance', 'Junta directiva y gobernanza'),
    ],
    supportTitle: s('Support the work', 'Apoye el trabajo'),
    supportBody: s(
      'Free civil legal help in Montana is funded by federal grants, private donors and the volunteer time of Montana attorneys.',
      'La ayuda legal civil gratuita en Montana se financia con subvenciones federales, donantes privados y el tiempo voluntario de abogados de Montana.',
    ),
    supportCta: s('Donate to MLSA', 'Done a MLSA'),
  },

  concept: {
    title: s('What this prototype is testing', 'Qué está probando este prototipo'),
    lead: s(
      'This is a concept prototype built as part of a response to MLSA’s 2026 RFP. It is not a proposed brand, a proposed name, or a proposed final design. It is an argument about the service experience, made in working form because that is easier to evaluate than a description of one.',
      'Este es un prototipo conceptual creado como parte de una respuesta a la RFP 2026 de MLSA. No es una propuesta de marca, de nombre ni de diseño final. Es un argumento sobre la experiencia de servicio, presentado en forma funcional porque eso es más fácil de evaluar que una descripción.',
    ),
    hypothesesTitle: s('Four hypotheses', 'Cuatro hipótesis'),
    hypotheses: [
      {
        n: '01',
        title: s('Organize around people’s goals', 'Organizar en torno a los objetivos de las personas'),
        body: s(
          'Someone facing eviction should not need to understand MLSA’s organizational structure to find help. The homepage asks “What do you need today?” before it explains anything about the organization, because that is the order the user needs, not the order the org chart suggests.',
          'Alguien que enfrenta un desalojo no debería necesitar entender la estructura organizativa de MLSA para encontrar ayuda. La página de inicio pregunta «¿Qué necesita hoy?» antes de explicar nada sobre la organización, porque ese es el orden que necesita el usuario, no el que sugiere el organigrama.',
        ),
      },
      {
        n: '02',
        title: s('Clarify MLSA + MontanaLawHelp', 'Aclarar MLSA + MontanaLawHelp'),
        body: s(
          'Two properties, one mission, and a real risk of confusion. The prototype makes it obvious which experience is best for direct assistance and which is best for legal information and self-help — including in search results, which label whether each result is an MLSA service or a MontanaLawHelp resource.',
          'Dos plataformas, una misión y un riesgo real de confusión. El prototipo deja claro cuál experiencia sirve para asistencia directa y cuál para información legal y autoayuda, incluso en los resultados de búsqueda, que indican si cada resultado es un servicio de MLSA o un recurso de MontanaLawHelp.',
        ),
      },
      {
        n: '03',
        title: s('Treat accessibility as product design', 'Tratar la accesibilidad como diseño de producto'),
        body: s(
          'Accessibility should shape typography, navigation, content, interaction and technical implementation — not be added after launch as a widget. There is no accessibility overlay in this prototype on purpose. The keyboard path, the focus indicators, the heading structure, the reading level and the Spanish content deck are the accessibility work.',
          'La accesibilidad debe dar forma a la tipografía, la navegación, el contenido, la interacción y la implementación técnica, no añadirse después del lanzamiento como un widget. Este prototipo no tiene una capa de accesibilidad a propósito. El recorrido con teclado, los indicadores de foco, la estructura de encabezados, el nivel de lectura y el contenido en español son el trabajo de accesibilidad.',
        ),
      },
      {
        n: '04',
        title: s('Discover the brand before designing it', 'Descubrir la marca antes de diseñarla'),
        body: s(
          'The final identity, naming and messaging should be grounded in stakeholder research. This concept therefore keeps the MLSA name, uses a plain wordmark, and treats colour and type as a provisional exploration. We have deliberately not rushed the organization into a new brand before discovery has happened.',
          'La identidad final, el nombre y los mensajes deben basarse en investigación con las partes interesadas. Por eso este concepto conserva el nombre MLSA, usa un logotipo tipográfico sencillo y trata el color y la tipografía como una exploración provisional. Deliberadamente no hemos apresurado a la organización hacia una nueva marca antes de la fase de descubrimiento.',
        ),
      },
    ],
    decisionsTitle: s('Decisions you can see in the build', 'Decisiones visibles en la implementación'),
    decisions: [
      {
        title: s('Nothing is invented', 'Nada está inventado'),
        body: s(
          'Statistics, hours, offices, practice areas and the client quote come from MLSA’s public materials. Where a fact could not be verified — an annual number of people served, the specifics of interpretation and relay services — the prototype says so instead of guessing. That restraint is a design decision, not an omission.',
          'Las estadísticas, los horarios, las oficinas, las áreas de práctica y la cita del cliente provienen de los materiales públicos de MLSA. Cuando no se pudo verificar un dato —la cifra anual de personas atendidas, los detalles de los servicios de interpretación y retransmisión—, el prototipo lo indica en lugar de suponer. Esa contención es una decisión de diseño, no una omisión.',
        ),
      },
      {
        title: s('Operational content is modelled as content', 'El contenido operativo se modela como contenido'),
        body: s(
          'HelpLine hours and the announcement bar are CMS records, not hard-coded markup. Schedules change; a site that requires a developer to change them will be wrong within a year.',
          'El horario de la línea de ayuda y la barra de anuncios son registros de CMS, no código fijo. Los horarios cambian; un sitio que necesita un desarrollador para actualizarlos estará desactualizado en un año.',
        ),
      },
      {
        title: s('Spanish is a column, not a layer', 'El español es una columna, no una capa'),
        body: s(
          'Every string in this prototype is typed as requiring both English and Spanish. An untranslated string is a build error, not something a reviewer notices later.',
          'Cada texto de este prototipo está tipado para exigir inglés y español. Un texto sin traducir es un error de compilación, no algo que un revisor detecta después.',
        ),
      },
      {
        title: s('Safety is a persistent utility', 'La seguridad es una utilidad permanente'),
        body: s(
          'Quick Exit is in the header on every page rather than only on domestic violence pages, because someone may arrive on any page. It is a calm button with a plain explanation, not an alarming modal.',
          'La salida rápida está en el encabezado de todas las páginas, no solo en las de violencia doméstica, porque alguien puede llegar a cualquier página. Es un botón discreto con una explicación clara, no una ventana de advertencia alarmante.',
        ),
      },
    ],
    closingTitle: s('A question, not an answer', 'Una pregunta, no una respuesta'),
    closing: s(
      'The prototype represents a question, not a predetermined answer: how can MLSA’s digital experience make accessing justice easier?',
      'El prototipo representa una pregunta, no una respuesta predeterminada: ¿cómo puede la experiencia digital de MLSA facilitar el acceso a la justicia?',
    ),
    sourcesTitle: s('Sources used', 'Fuentes utilizadas'),
    sourcesBody: s(
      'Organizational facts in this prototype were taken from MLSA’s own public materials.',
      'Los datos organizativos de este prototipo se tomaron de los materiales públicos de MLSA.',
    ),
  },

  search: {
    title: s('Search', 'Buscar'),
    label: s('Search MLSA and MontanaLawHelp', 'Buscar en MLSA y MontanaLawHelp'),
    placeholder: s('Try “eviction”, “divorce”, “debt”', 'Pruebe «desalojo», «divorcio», «deuda»'),
    hint: s(
      'Results are labelled so you can tell an MLSA service from a MontanaLawHelp resource.',
      'Los resultados están etiquetados para que distinga un servicio de MLSA de un recurso de MontanaLawHelp.',
    ),
    suggestionsLabel: s('Common searches', 'Búsquedas comunes'),
    resultsLabel: s('Results', 'Resultados'),
    countLabel: (n: number): L => ({
      en: `${n} ${n === 1 ? 'result' : 'results'}`,
      es: `${n} ${n === 1 ? 'resultado' : 'resultados'}`,
    }),
    noResultsTitle: s('No results', 'Sin resultados'),
    noResultsBody: s(
      'Try a simpler word, like “rent”, “benefits” or “forms”. You can also call the HelpLine.',
      'Pruebe con una palabra más sencilla, como «renta», «beneficios» o «formularios». También puede llamar a la línea de ayuda.',
    ),
    typeMlsaService: s('MLSA Service', 'Servicio de MLSA'),
    typeMlsaPage: s('MLSA', 'MLSA'),
    typeMlh: s('MontanaLawHelp', 'MontanaLawHelp'),
    prototypeNote: s(
      'Search in this prototype runs against a small sample index, not a live search engine.',
      'La búsqueda en este prototipo funciona con un índice de muestra pequeño, no con un motor de búsqueda real.',
    ),
  },

  footer: {
    tagline: s(
      'Free civil legal help for Montanans, since 1966.',
      'Ayuda legal civil gratuita para los habitantes de Montana desde 1966.',
    ),
    helpHeading: s('Need Legal Help', 'Necesita ayuda legal'),
    aboutHeading: s('About', 'Acerca de'),
    involvedHeading: s('Get Involved', 'Participe'),
    contactHeading: s('Contact', 'Contacto'),
    links: {
      needHelp: s('Need Legal Help', 'Necesita ayuda legal'),
      apply: s('Apply for legal help', 'Solicite ayuda legal'),
      helpline: s('HelpLine', 'Línea de ayuda'),
      montanalawhelp: s('MontanaLawHelp.org', 'MontanaLawHelp.org'),
      ourWork: s('Our Work', 'Nuestro trabajo'),
      about: s('About MLSA', 'Acerca de MLSA'),
      news: s('News', 'Noticias'),
      careers: s('Careers', 'Empleo'),
      volunteer: s('Volunteer', 'Sea voluntario'),
      donate: s('Donate', 'Done'),
      partner: s('Partner', 'Colabore'),
      contact: s('Contact', 'Contacto'),
      accessibility: s('Accessibility', 'Accesibilidad'),
      privacy: s('Privacy', 'Privacidad'),
      disclaimer: s('Disclaimer', 'Aviso legal'),
    },
    officesLabel: s('Offices in', 'Oficinas en'),
    mailingLabel: s('Helena office', 'Oficina de Helena'),
    faxLabel: s('Fax', 'Fax'),
    fundingNote: s(
      'MLSA is a federally and privately funded nonprofit providing free civil legal assistance to low-income Montanans.',
      'MLSA es una organización sin fines de lucro financiada con fondos federales y privados que brinda asistencia legal civil gratuita a habitantes de Montana de bajos ingresos.',
    ),
    prototypeFooter: s(
      'This is an unaffiliated concept prototype created for discussion as part of an RFP response. It is not operated by, endorsed by, or affiliated with Montana Legal Services Association. No information entered here is collected or transmitted. For the real organization, visit mtlsa.org.',
      'Este es un prototipo conceptual no afiliado, creado para fines de discusión como parte de una respuesta a una RFP. No es operado, respaldado ni está afiliado a Montana Legal Services Association. Ninguna información ingresada aquí se recopila ni se transmite. Para la organización real, visite mtlsa.org.',
    ),
  },
} as const;
