import { defineConfig, DefaultTheme } from 'vitepress'

const ogDescription = 'Machine Learning GPU and Data Server Guide'
const ogImage = 'og-image.png'
const ogTitle = 'RoseLab'
const ogUrl = 'https://rose-stl-lab.github.io'
const additionalTitle = ''

export default defineConfig({
  title: `RoseLab${additionalTitle}`,
  description: 'Machine Learning GPU and Data Server Guide',

  head: [
    ['link', { rel: 'icon', type: 'image/x-icon',  href: '/favicon.ico' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: ogTitle }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'og:description', content: ogDescription }],
    ['meta', { name: 'theme-color', content: '#cf0020' }]
  ],

  vue: {
    reactivityTransform: true,
  },

  themeConfig: {
    logo: '/logo.png',

    socialLinks: [
      { icon: 'slack', link: 'https://rose-stl-lab.slack.com' },
      { icon: 'github', link: 'https://github.com/Rose-STL-Lab' },
    ],

    algolia: {
      appId: 'FP0L9RXYN5',
      apiKey: '882c31582e3db529893eb98864716305',
      indexName: 'rose-stl-labio',
      searchParameters: {},
    },

    footer: {
      message: `Released under the MIT License.`,
      copyright: 'Made by Zihao Zhou with ❤️',
    },

    nav: [
      { text: 'Guide', link: '/guide/', activeMatch: '/guide/' },
      { text: 'Config', link: '/config/', activeMatch: '/config/' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            {
              text: 'Why Roselab',
              link: '/guide/why',
            },
            {
              text: 'Getting Started',
              link: '/guide/',
            },
            {
              text: 'Limitations',
              link: '/guide/limit',
            },
            {
              text: 'Jupyter Lab',
              link: '/guide/jupyter',
            },
            {
              text: 'Remote Desktop',
              link: '/guide/rdp',
            },
            {
              text: 'Password and Security',
              link: '/guide/security',
            },
            {
              text: 'Troubleshooting',
              link: '/guide/troubleshooting',
            }
          ],
        },
        {
          text: 'Config',
          items: [
            {
              text: 'Versions',
              link: '/config/',
            },
          ],
        },
      ],
    },
  },
})
