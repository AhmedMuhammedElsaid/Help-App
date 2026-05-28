/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://help-app-ahmed-elsaid.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  alternateRefs: [
    {
      href: 'https://help-app-ahmed-elsaid.vercel.app/en',
      hreflang: 'en',
    },
    {
      href: 'https://help-app-ahmed-elsaid.vercel.app/ar',
      hreflang: 'ar',
    },
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },

  exclude: ['/server-sitemap.xml'],
};
