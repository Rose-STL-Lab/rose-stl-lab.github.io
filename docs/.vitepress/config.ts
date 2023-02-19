import { defineConfig, DefaultTheme } from 'vitepress'

const ogDescription = 'Machine Learning GPU and Data Server Guide'
const ogImage = 'og-image.png'
const ogTitle = 'RoseLab'
const ogUrl = 'https://rose-stl-lab.github.io'

// netlify envs
const deployURL = process.env.DEPLOY_PRIME_URL || ''
const commitRef = process.env.COMMIT_REF?.slice(0, 8) || 'dev'

const deployType = (() => {
  switch (deployURL) {
    case 'https://rose-stl-lab.github.io/':
      return 'main'
    case '':
      return 'local'
    default:
      return 'release'
  }
})()
const additionalTitle = ((): string => {
  switch (deployType) {
    case 'main':
      return ' (main branch)'
    case 'local':
      return ' (local)'
    case 'release':
      return ''
  }
})()

export default defineConfig({
  title: `RoseLab${additionalTitle}`,
  description: 'Machine Learning GPU and Data Server Guide',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.png' }],
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

    // algolia: {
    //   appId: '7H67QR5P0A',
    //   apiKey: 'deaab78bcdfe96b599497d25acc6460e',
    //   indexName: 'roselab',
    //   searchParameters: {
    //     facetFilters: ['tags:en'],
    //   },
    // },

    footer: {
      message: `Released under the MIT License. (${commitRef})`,
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
