// One place for contact details so the about page, the message dialog and the
// terminal can't drift apart.
export const CONTACT = {
  email: "gauravahuja.work@gmail.com",
  // Display form is spaced for readability; the tel: href must not be.
  phone: "+91 79885 41368",
  phoneHref: "+917988541368",
  github: "https://github.com/GauravAhuja7",
  linkedin: "https://linkedin.com/in/gauravahuja-iitmandi",
} as const;

export const mailto = `mailto:${CONTACT.email}`;
export const tel = `tel:${CONTACT.phoneHref}`;
