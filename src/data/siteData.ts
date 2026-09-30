import { 
  Compass, 
  ClipboardList, 
  ShieldCheck, 
  Code, 
  Megaphone, 
  TrendingUp, 
  Target, 
  Handshake, 
  Briefcase, 
  Wallet, 
  LifeBuoy,
  Lightbulb,
  Ruler,
  Rocket,
  BarChart2,
  Layers,
  type LucideIcon
} from 'lucide-react';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface ProcessStep {
  step: number;
  stepNum: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface WhyChooseUsItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const SITE_DATA = {
  brandName: "YBGP",
  fullName: "Your Business Growth Partner",
  subTagline: "GROWTH PARTNER",
  tagline: "From Idea to a Profitable Business.",
  owner: "Shubhanshu Jain",
  ownerTitle: "BUSINESS GROWTH CONSULTANT",
  website: "www.ybgp.in",
  websiteUrl: "https://www.ybgp.in/",
  email: "info@ybgp.in",
  phone: "9953-270-270",
  phoneDisplay: "+91 9953270270",
  phoneRaw: "919953270270",
  instagram: "@ybgp.consulting",
  instagramUrl: "https://www.instagram.com/ybgp.consulting",
  linkedinUrl: "https://www.linkedin.com/company/ybgp-consulting",
  location: "Noida, Uttar Pradesh",
  
  whatsappPrefilledMessage: "Hello Shubhanshu,\nI visited www.ybgp.in and would like to discuss my business.",
  googleFormUrl: "https://forms.gle/c3NzrqqxcgHmygAP9",
  
  hero: {
    eyebrow: "YOUR BUSINESS GROWTH PARTNER",
    titleLine1: "YOUR BUSINESS",
    titleLine2: "GROWTH ",
    titleHighlight: "PARTNER",
    subheading: "From Idea to a Profitable Business.",
    description: "Helping entrepreneurs, startups and businesses launch, build, optimize and scale through practical consulting and execution support.",
    primaryCta: "Book Free Consultation →",
    secondaryCta: "Explore Services"
  },

  about: {
    eyebrow: "ABOUT",
    title: "Who We Are",
    paragraph1: "YBGP is a business consulting partner for founders, startups and growing companies in Noida, Delhi NCR and nearby business hubs who want practical support for strategy, execution, brand growth and business development.",
    paragraph2: "We don't just advise. We work alongside you to turn ideas into profitable businesses with disciplined planning, business registration support, digital execution, marketing strategy and scalable systems that fit the realities of fast-moving Indian businesses.",
    stats: [
      {
        value: "Idea",
        label: "WHERE WE START"
      },
      {
        value: "Growth",
        label: "WHERE YOU SCALE"
      },
      {
        value: "360°",
        label: "END-TO-END SUPPORT"
      }
    ]
  },

  faq: [
    {
      question: "Why do businesses in Noida and Delhi NCR choose YBGP?",
      answer: "Because YBGP combines strategy, execution support, compliance guidance and digital growth thinking in one partner. This helps founders move faster without losing clarity or control."
    },
    {
      question: "Does YBGP help startups and new businesses?",
      answer: "Yes. YBGP works with entrepreneurs and early-stage businesses that need a clearer roadmap, stronger positioning, website and growth foundations, and practical advice that supports sustainable momentum."
    },
    {
      question: "Can YBGP help with business registration and compliance?",
      answer: "Yes. YBGP supports founders with registration, licensing and compliance coordination so the business can start and scale with a cleaner operational base."
    },
    {
      question: "Do you help with websites and branding?",
      answer: "Yes. YBGP supports business website development, digital presentation, branding and marketing strategy so the company looks credible and converts attention into enquiries."
    },
    {
      question: "What kind of businesses does YBGP work with?",
      answer: "YBGP works with service businesses, startups, founders, and growth-stage companies that need clearer direction, better systems, stronger online presence, and a plan for sustainable growth."
    }
  ],

  services: {
    eyebrow: "SERVICES",
    title: "Everything your business needs, under one partner.",
    subtitle: "From business strategy consulting in Noida to branding, digital marketing, compliance and website development in Delhi NCR, YBGP helps founders build and grow businesses with structure and momentum.",
    items: [
      {
        id: "business-strategy",
        title: "Business Strategy",
        description: "Clear positioning, market entry and decision frameworks built to compound over time.",
        icon: Compass
      },
      {
        id: "business-planning",
        title: "Business Planning",
        description: "Financial models, roadmaps and operating plans that make growth predictable.",
        icon: ClipboardList
      },
      {
        id: "registration-compliance",
        title: "Registration & Compliance",
        description: "Company setup, licensing and compliance handled end-to-end, correctly.",
        icon: ShieldCheck
      },
      {
        id: "website-app-development",
        title: "Website & App Development",
        description: "Fast, elegant digital products engineered to convert and scale.",
        icon: Code
      },
      {
        id: "branding-digital-marketing",
        title: "Branding & Digital Marketing",
        description: "A distinct brand and demand engine that earns trust and attention.",
        icon: Megaphone
      },
      {
        id: "business-growth-scaling",
        title: "Business Growth & Scaling",
        description: "Systems, hiring and playbooks that take you from traction to scale.",
        icon: TrendingUp
      }
    ] as ServiceItem[]
  },

  process: {
    eyebrow: "OUR PROCESS",
    title: "A disciplined path from idea to scale.",
    steps: [
      {
        step: 1,
        stepNum: "01",
        title: "Idea",
        description: "Validate the opportunity and shape a clear vision.",
        icon: Lightbulb
      },
      {
        step: 2,
        stepNum: "02",
        title: "Planning",
        description: "Structure the strategy, model and roadmap.",
        icon: Ruler
      },
      {
        step: 3,
        stepNum: "03",
        title: "Execution",
        description: "Build, launch and get to market with momentum.",
        icon: Rocket
      },
      {
        step: 4,
        stepNum: "04",
        title: "Growth",
        description: "Optimize channels, retention and unit economics.",
        icon: BarChart2
      },
      {
        step: 5,
        stepNum: "05",
        title: "Scale",
        description: "Systemize operations and expand with confidence.",
        icon: Layers
      }
    ] as ProcessStep[]
  },

  whyChooseUs: {
    eyebrow: "WHY CHOOSE US",
    title: "The reasons founders choose to grow with YBGP.",
    items: [
      {
        title: "Execution Driven",
        description: "We move from strategy to shipped outcomes, not slide decks.",
        icon: Target
      },
      {
        title: "Long-Term Partnership",
        description: "We stay invested in your growth well beyond the first win.",
        icon: Handshake
      },
      {
        title: "Business-Focused Solutions",
        description: "Every decision is tied to revenue, margin and momentum.",
        icon: Briefcase
      },
      {
        title: "Affordable Consulting",
        description: "Premium-grade guidance at pricing built for founders.",
        icon: Wallet
      },
      {
        title: "End-to-End Support",
        description: "One partner across strategy, brand, tech and scale.",
        icon: LifeBuoy
      }
    ] as WhyChooseUsItem[]
  },

  contact: {
    eyebrow: "CONTACT",
    title: "Let's build your next chapter.",
    subtitle: "Book a free consultation and get a clear, honest view of where your business can go — and how to get there.",
    primaryCta: "Schedule Consultation →"
  }
};
