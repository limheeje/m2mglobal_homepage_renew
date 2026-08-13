export interface RouteChildren {
  id: string
  koLabel: string
  label: string
  href: string
}
export interface Route {
  label: string
  href: string
  children: RouteChildren[]
}
export const route: Route[] = [
  {
    label: 'Company',
    href: '/company/info',
    children: [
      {
        id: 'MAP-COMPANY-ID-1',
        koLabel: 'ABOUT M2MGLOBAL',
        label: 'Company Info',
        href: '/company/info'
      },
      {
        id: 'MAP-COMPANY-ID-2',
        koLabel: 'CEO 인사말',
        label: "CEO's Message",
        href: '/company/ceo-message'
      },
      {id: 'MAP-COMPANY-ID-3', koLabel: '회사 연혁', label: 'History', href: '/company/history'},
      {id: 'MAP-COMPANY-ID-4', koLabel: '인재 채용', label: 'Careers', href: '/company/careers'},
      {id: 'MAP-COMPANY-ID-5', koLabel: 'News', label: 'News', href: '/company/news'},
      {
        id: 'MAP-COMPANY-ID-6',
        koLabel: '위치 및 연락처',
        label: 'Address',
        href: '/company/address'
      },
      {
        id: 'MAP-COMPANY-ID-7',
        koLabel: '사업 문의',
        label: 'Contact us',
        href: '/company/contact-us'
      }
    ]
  },
  {
    label: 'AI Engine',
    href: '/ai-engine/machine-learning',
    children: [
      {
        id: 'MAP-AI-ENGINE-ID-1',
        koLabel: 'AI & Machine Learning',
        label: 'AI & Machine Learning',
        href: '/ai-engine/machine-learning'
      },
      {
        id: 'MAP-AI-ENGINE-ID-2',
        koLabel: 'AI Commerce',
        label: 'AI Commerce',
        href: '/ai-engine/ai-commerce'
      }
    ]
  },
  {
    label: 'Robot Logistics',
    href: '/robot-logistics/overview',
    children: [
      {
        id: 'MAP-ROBOT-LOGISTICS-ID-1',
        koLabel: 'Robot Logistics',
        label: 'Robot Logistics',
        href: '/robot-logistics/overview'
      },
      {
        id: 'MAP-ROBOT-LOGISTICS-ID-2',
        koLabel: 'Smart Factory',
        label: 'Smart Factory',
        href: '/robot-logistics/smart-factory'
      }
    ]
  },
  {
    label: 'e-Commerce',
    href: '/e-commerce/commerce-technology',
    children: [
      {
        id: 'MAP-E-COMMERCE-ID-1',
        koLabel: 'B2C Commerce',
        label: 'Commerce Technology',
        href: '/e-commerce/commerce-technology'
      },
      {
        id: 'MAP-E-COMMERCE-ID-2',
        koLabel: 'B2B Commerce',
        label: 'B2B Commerce',
        href: '/e-commerce/b2b-commerce'
      },
      {
        id: 'MAP-E-COMMERCE-ID-3',
        koLabel: 'Auction',
        label: 'Marketplace',
        href: '/e-commerce/marketplace'
      }
    ]
  },
  {
    label: 'Solutions',
    href: '/solutions/commerce-platform',
    children: [
      {
        id: 'MAP-SOLUTIONS-ID-1',
        koLabel: 'Commerce Platform',
        label: 'Commerce Platform',
        href: '/solutions/commerce-platform'
      },
      {
        id: 'MAP-SOLUTIONS-ID-2',
        koLabel: 'Logistics Platform',
        label: 'Logistics Platform',
        href: '/solutions/logistics-platform'
      },
      {
        id: 'MAP-SOLUTIONS-ID-3',
        koLabel: 'Trade Platform',
        label: 'Trade Platform',
        href: '/solutions/trade-platform'
      },
      {
        id: 'MAP-SOLUTIONS-ID-4',
        koLabel: 'eLiveStock Platform',
        label: 'eLiveStock Platform',
        href: '/solutions/elivestock-platform'
      }
    ]
  },
  {
    label: 'Project',
    href: '/project/reference',
    children: [
      {
        id: 'MAP-PROJECT-ID-1',
        koLabel: 'Reference',
        label: 'Reference',
        href: '/project/reference'
      },
      {
        id: 'MAP-PROJECT-ID-2',
        koLabel: 'Specialized Outcomes',
        label: 'Specialized Outcomes',
        href: '/project/specialized-outcomes'
      }
    ]
  }
]
