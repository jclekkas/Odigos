/* ---------------------------------------------------------------------------
   Nichols Electric — prototype configuration
   Everything an owner needs to confirm lives here. Nothing else in the site
   hard-codes a phone number or a photo path.
   --------------------------------------------------------------------------- */
window.SITE = {

  /* PHONE ------------------------------------------------------------------
     The current Nichols Electric website publishes more than one phone number,
     so this prototype does NOT pick one. It ships the placeholder token and
     leaves the Call buttons pointed at the contact section.

     To make every Call button a real one-tap dial:
       1. set confirmed: true
       2. set display  to the customer-facing number, e.g. "(540) 743-5028"
       3. set tel      to the same number in E.164, e.g. "+15407435028"
     (See ASSUMPTIONS.md, item 1.)                                            */
  phone: {
    confirmed: false,
    display: '[PRIMARY PHONE]',
    tel: ''
  },

  /* GALLERY ----------------------------------------------------------------
     Replace each `src` with a real Nichols project photograph (jpg/webp,
     ~1600px on the long edge) and set placeholder: false.

     Caption rule from the brief: only label an image when the project type is
     visually certain. Otherwise leave it as "Recent Project".                 */
  gallery: [
    { src: 'assets/img/project-01.svg', caption: 'New Construction',          w: 900,  h: 700,  placeholder: true },
    { src: 'assets/img/project-02.svg', caption: 'Panel / Service Upgrade',   w: 900,  h: 1200, placeholder: true, tall: true },
    { src: 'assets/img/project-03.svg', caption: 'Recent Project',            w: 900,  h: 700,  placeholder: true },
    { src: 'assets/img/project-04.svg', caption: 'Recent Project',            w: 900,  h: 700,  placeholder: true },
    { src: 'assets/img/project-05.svg', caption: 'Lighting',                  w: 900,  h: 700,  placeholder: true },
    { src: 'assets/img/project-06.svg', caption: 'Commercial Project',        w: 900,  h: 1200, placeholder: true, tall: true },
    { src: 'assets/img/project-07.svg', caption: 'Generator',                 w: 900,  h: 700,  placeholder: true },
    { src: 'assets/img/project-08.svg', caption: 'Recent Project',            w: 900,  h: 700,  placeholder: true },
    { src: 'assets/img/project-09.svg', caption: 'Electrical Service',        w: 900,  h: 700,  placeholder: true }
  ]
};
