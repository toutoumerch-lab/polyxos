import pool from '../db.js';

export async function seedDatabase() {
  console.log('🌱 Checking database for seeding...');

  try {
    // ─── 1. Seed Services ───
    const serviceCountRes = await pool.query('SELECT COUNT(*) FROM services');
    const serviceCount = parseInt(serviceCountRes.rows[0].count);

    if (serviceCount === 0) {
      console.log('   • Seeding services...');
      const services = [
        {
          title: 'Website Development',
          short_description: 'High-performance, conversion-optimized websites built with cutting-edge tech stacks. From landing pages to complex web platforms.',
          detailed_description: 'We build beautiful, blazing-fast websites using modern frameworks. Our code is optimized for search engines (SEO) and designed to convert users into clients.',
          icon_name: 'Globe',
          display_order: 0,
          active: true,
          features: ['React / Next.js', 'SEO Optimized', 'Lightning Fast', 'Responsive Design'],
          color: '#3B82F6',
          gradient: 'from-blue-500/20 to-blue-600/5'
        },
        {
          title: 'Mobile App Development',
          short_description: 'Native and cross-platform mobile applications that deliver exceptional user experiences on iOS and Android.',
          detailed_description: 'Reach your audience on their phones with cross-platform applications built with React Native. We manage everything from app store submission to push notification logic.',
          icon_name: 'Smartphone',
          display_order: 1,
          active: true,
          features: ['React Native', 'iOS & Android', 'Offline Support', 'Push Notifications'],
          color: '#8B5CF6',
          gradient: 'from-violet-500/20 to-violet-600/5'
        },
        {
          title: 'Website Audits',
          short_description: 'Deep-dive performance, SEO, security, and UX audits with actionable insights to maximize your website\'s potential.',
          detailed_description: 'Uncover why your website is loading slowly or losing leads. Our detailed report covers technical issues, SEO ranking obstacles, and user experience flaws.',
          icon_name: 'Search',
          display_order: 2,
          active: true,
          features: ['Performance Audit', 'SEO Analysis', 'Security Check', 'UX Review'],
          color: '#06B6D4',
          gradient: 'from-cyan-500/20 to-cyan-600/5'
        },
        {
          title: 'UI/UX Design',
          short_description: 'Stunning, user-centered designs that combine aesthetics with function. Figma prototypes to pixel-perfect implementations.',
          detailed_description: 'We design intuitive interfaces focused on clear layouts. We prepare wireframes and interactable prototypes in Figma for user verification before coding.',
          icon_name: 'Palette',
          display_order: 3,
          active: true,
          features: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
          color: '#EC4899',
          gradient: 'from-pink-500/20 to-pink-600/5'
        },
        {
          title: 'Custom Software Solutions',
          short_description: 'Tailored software built to solve your unique business challenges — scalable, maintainable, and future-proof.',
          detailed_description: 'Automate manual processes with dedicated web dashboards and software utilities. We integrate APIs and deploy highly reliable, secure cloud databases.',
          icon_name: 'Code2',
          display_order: 4,
          active: true,
          features: ['API Development', 'Microservices', 'Cloud Native', 'CI/CD Pipeline'],
          color: '#F59E0B',
          gradient: 'from-amber-500/20 to-amber-600/5'
        }
      ];

      for (const s of services) {
        await pool.query(
          `INSERT INTO services (
            title, short_description, detailed_description,
            icon_name, display_order, active, features, color, gradient
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [s.title, s.short_description, s.detailed_description, s.icon_name, s.display_order, s.active, s.features, s.color, s.gradient]
        );
      }
      console.log('   ✅ Services seeded.');
    }

    // ─── 2. Seed Portfolio Projects ───
    const projectCountRes = await pool.query('SELECT COUNT(*) FROM portfolio_projects');
    const projectCount = parseInt(projectCountRes.rows[0].count);

    if (projectCount === 0) {
      console.log('   • Seeding portfolio projects...');
      const projects = [
        {
          title: 'FinPulse Dashboard',
          category: 'Web Application',
          description: 'Real-time financial analytics platform with AI-powered insights and interactive data visualizations.',
          cover_image: 'mock-finpulse',
          gallery_images: [],
          tags: ['React', 'Node.js', 'PostgreSQL'],
          live_url: '#',
          github_url: '#',
          completion_date: '2025-11-20',
          featured: true,
          display_order: 0
        },
        {
          title: 'ShopNova Mobile',
          category: 'Mobile App',
          description: 'Cross-platform e-commerce app with AR product preview, seamless checkout, and real-time order tracking.',
          cover_image: 'mock-shopnova',
          gallery_images: [],
          tags: ['React Native', 'Express.js', 'Stripe'],
          live_url: '#',
          github_url: '#',
          completion_date: '2025-09-15',
          featured: false,
          display_order: 1
        },
        {
          title: 'Orion SaaS Platform',
          category: 'Custom Software',
          description: 'Enterprise project management suite with team collaboration, automated workflows, and advanced reporting.',
          cover_image: 'mock-orion',
          gallery_images: [],
          tags: ['Next.js', 'Docker', 'PostgreSQL'],
          live_url: '#',
          github_url: '#',
          completion_date: '2025-07-02',
          featured: false,
          display_order: 2
        },
        {
          title: 'Luxe Brand Identity',
          category: 'UI/UX Design',
          description: 'Complete brand identity and design system for a luxury fashion brand, including web and mobile touchpoints.',
          cover_image: 'mock-luxe',
          gallery_images: [],
          tags: ['Figma', 'Design System', 'Branding'],
          live_url: '#',
          github_url: '#',
          completion_date: '2025-05-18',
          featured: false,
          display_order: 3
        },
        {
          title: 'MediTrack Pro',
          category: 'Mobile App',
          description: 'HIPAA-compliant healthcare management app connecting patients, doctors, and pharmacies in one ecosystem.',
          cover_image: 'mock-meditrack',
          gallery_images: [],
          tags: ['React Native', 'Node.js', 'MongoDB'],
          live_url: '#',
          github_url: '#',
          completion_date: '2025-03-11',
          featured: false,
          display_order: 4
        },
        {
          title: 'DataSphere Analytics',
          category: 'Web Application',
          description: 'Advanced marketing analytics platform with predictive modeling and multi-channel attribution tracking.',
          cover_image: 'mock-datasphere',
          gallery_images: [],
          tags: ['React', 'D3.js', 'Python'],
          live_url: '#',
          github_url: '#',
          completion_date: '2025-01-05',
          featured: false,
          display_order: 5
        }
      ];

      for (const p of projects) {
        await pool.query(
          `INSERT INTO portfolio_projects (
            title, category, description, cover_image, gallery_images,
            tags, live_url, github_url, completion_date, featured, display_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [p.title, p.category, p.description, p.cover_image, p.gallery_images, p.tags, p.live_url, p.github_url, p.completion_date, p.featured, p.display_order]
        );
      }
      console.log('   ✅ Portfolio projects seeded.');
    }

    // ─── 3. Seed Technologies ───
    const techCountRes = await pool.query('SELECT COUNT(*) FROM technologies');
    const techCount = parseInt(techCountRes.rows[0].count);

    if (techCount === 0) {
      console.log('   • Seeding technologies...');
      const technologies = [
        { name: 'React.js', logo_icon: '⚛', category: 'Frontend', proficiency: 'Expert', display_order: 0 },
        { name: 'Node.js', logo_icon: '🟢', category: 'Backend', proficiency: 'Expert', display_order: 1 },
        { name: 'Express.js', logo_icon: '🚀', category: 'Backend', proficiency: 'Expert', display_order: 2 },
        { name: 'PostgreSQL', logo_icon: '🐘', category: 'Database', proficiency: 'Expert', display_order: 3 },
        { name: 'Tailwind CSS', logo_icon: '🎨', category: 'Frontend', proficiency: 'Expert', display_order: 4 },
        { name: 'Docker', logo_icon: '🐳', category: 'DevOps', proficiency: 'Intermediate', display_order: 5 },
        { name: 'Next.js', logo_icon: '▲', category: 'Frontend', proficiency: 'Expert', display_order: 6 },
        { name: 'TypeScript', logo_icon: '📘', category: 'Frontend', proficiency: 'Expert', display_order: 7 },
        { name: 'GraphQL', logo_icon: '◈', category: 'Backend', proficiency: 'Intermediate', display_order: 8 },
        { name: 'Redis', logo_icon: '⚡', category: 'Database', proficiency: 'Intermediate', display_order: 9 },
        { name: 'AWS', logo_icon: '☁', category: 'Cloud', proficiency: 'Intermediate', display_order: 10 },
        { name: 'Figma', logo_icon: '🎭', category: 'UI/UX Design', proficiency: 'Intermediate', display_order: 11 }
      ];

      for (const t of technologies) {
        await pool.query(
          `INSERT INTO technologies (name, logo_icon, category, proficiency, display_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [t.name, t.logo_icon, t.category, t.proficiency, t.display_order]
        );
      }
      console.log('   ✅ Technologies seeded.');
    }

    console.log('🌱 Seeding check complete.');
  } catch (err) {
    console.error('❌ Database seeding check failed:', err.message);
  }
}
