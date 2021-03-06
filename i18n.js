
module.exports = {
  loadLocaleFrom: (lang, ns) =>
  // You can use a dynamic import, fetch, whatever. You should
  // return a Promise with the JSON file.
  import(`./locales/${lang}/${ns}.json`).then((m) => m.default),
  locales: ['en', 'it', /*'ru'*/],
  localesNames: ['English', 'Italian', /*'Russian'*/],
  defaultLocale: 'en',
  pages: {
    "*": ["common", "header", "footer"],
    "/": ["home"],
    "/[cat]": ["home"],
    "/challenge-upload": ["challenge-upload"],
    "/sell": ["sell"],
    "/sell/[product]": ["sell"],
    "/[username]": ["profile"],
    "/sign-in": ["auth"],
    "/sign-up": ["auth"],
    "/profile": ["profile"],
    "/profile/settings": ["settings"],
    "/profile/messages": ["messages"],
    "/[...single_product]": ["single-product"],
    "/reviews/[product]": ["reviews"],
    "/photo/[slug]": ["single-photo"],
    "/search": ["search"],
    "/search/[s]": ["search"],
    "/group/[...groups]": ["search"],
    "/about": ["about"],
    "/contact": ["contact"],
    "/privacy": ["privacy"],
    "/tos": ["tos"],
    "/errors/[code]": ["error"],
    "/404": ["error"],
    "/create-ad-tips": ["create-ad-tips"]
  }
}