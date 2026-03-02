'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { useCart } from '@/lib/CartContext';
import { getMenuItems } from '@/services/menuService';
import { getCategories } from '@/services/categoryService';
import { FiArrowRight, FiPlus } from 'react-icons/fi';
import styles from './page.module.css';

// Demo data
const demoItems = [
  { id: '1', name: 'Cappuccino', price: 180, category: 'Coffee', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop', description: 'Rich espresso with steamed milk foam' },
  { id: '2', name: 'Margherita Pizza', price: 350, category: 'Pizza', image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&h=300&fit=crop', description: 'Classic tomato, mozzarella & basil' },
  { id: '3', name: 'Matcha Latte', price: 220, category: 'Coffee', image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&h=300&fit=crop', description: 'Premium Japanese matcha with oat milk' },
  { id: '4', name: 'Avocado Toast', price: 280, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop', description: 'Sourdough, smashed avocado, poached egg' },
  { id: '5', name: 'Chocolate Cake', price: 250, category: 'Desserts', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', description: 'Triple layered Belgian chocolate' },
  { id: '6', name: 'Berry Smoothie', price: 200, category: 'Drinks', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop', description: 'Mixed berries with yogurt & honey' },
];

const categoryList = [
  { name: 'Coffee', emoji: '☕' },
  { name: 'Pizza', emoji: '🍕' },
  { name: 'Breakfast', emoji: '🥐' },
  { name: 'Desserts', emoji: '🍰' },
  { name: 'Drinks', emoji: '🥤' },
];

const steps = [
  { icon: '📱', label: 'Scan', sub: 'Scan QR at table' },
  { icon: '📋', label: 'Choose', sub: 'Browse the menu' },
  { icon: '💳', label: 'Pay', sub: 'Quick checkout' },
  { icon: '🍽️', label: 'Enjoy', sub: 'Food at your table' },
];

const testimonials = [
  { stars: '⭐⭐⭐⭐⭐', text: 'Best coffee and fastest service! The QR ordering is so smooth.', author: 'Priya S.' },
  { stars: '⭐⭐⭐⭐⭐', text: 'Love the ambiance and the modern ordering experience. Highly recommend!', author: 'Rahul M.' },
  { stars: '⭐⭐⭐⭐⭐', text: 'Amazing food quality. The app makes ordering effortless.', author: 'Ananya K.' },
];

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' }
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function HomeContent() {
  const [featuredItems, setFeaturedItems] = useState(demoItems);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setTable, addItem } = useCart();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const table = searchParams.get('table');
    if (table && !hasRedirected.current) {
      const tableNum = parseInt(table, 10);
      if (tableNum >= 1 && tableNum <= 20) {
        hasRedirected.current = true;
        setTable(String(tableNum));
        router.push(`/menu?table=${tableNum}`);
        return;
      }
    }

    const loadData = async () => {
      try {
        const items = await getMenuItems();
        if (items.length > 0) setFeaturedItems(items.slice(0, 6));
      } catch (err) { /* demo */ }
    };
    loadData();
  }, [searchParams, setTable, router]);

  const handleAdd = (item) => {
    addItem(item);
    import('react-hot-toast').then(({ default: toast }) => {
      toast.success(`${item.name} added!`);
    });
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>

        {/* ===== 1. HERO ===== */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <motion.div
              className={styles.heroLeft}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <motion.span className={styles.heroBadge} variants={fadeUp} custom={0}>
                ☕ SAN MATTEO
              </motion.span>
              <motion.h1 className={styles.heroTitle} variants={fadeUp} custom={1}>
                Experience Coffee<br />
                <span className={styles.heroAccent}>Like Never Before</span>
              </motion.h1>
              <motion.p className={styles.heroDesc} variants={fadeUp} custom={2}>
                Order your favorite meals instantly with our QR ordering system.
                Fast, contactless and beautifully simple.
              </motion.p>
              <motion.div className={styles.heroBtns} variants={fadeUp} custom={3}>
                <Link href="/menu" className={styles.btnPrimary}>
                  Order Now <FiArrowRight />
                </Link>
                <Link href="/menu" className={styles.btnSecondary}>
                  Browse Menu
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className={styles.heroRight}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className={styles.heroImageWrap}>
                <div className={styles.heroBlur} />
                <img
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop"
                  alt="SAN MATTEO Coffee"
                  className={styles.heroImage}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== 2. CATEGORIES ===== */}
        <section className={styles.sectionPadding}>
          <motion.h2
            className={styles.sectionTitle}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
          >
            Explore Categories
          </motion.h2>
          <motion.p
            className={styles.sectionSubtitle}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={1}
          >
            Something for every taste
          </motion.p>
          <motion.div
            className={styles.categoriesGrid}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
          >
            {categoryList.map((cat, i) => (
              <motion.div key={cat.name} variants={fadeUp} custom={i}>
                <Link href={`/menu?category=${cat.name}`} className={styles.categoryCard}>
                  <span className={styles.categoryIcon}>{cat.emoji}</span>
                  <span className={styles.categoryLabel}>{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ===== 3. FEATURED ITEMS ===== */}
        <section className={styles.sectionPadding}>
          <motion.h2
            className={styles.sectionTitle}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
          >
            Featured Items
          </motion.h2>
          <motion.p
            className={styles.sectionSubtitle}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={1}
          >
            Our most loved selections
          </motion.p>
          <motion.div
            className={styles.featuredGrid}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
          >
            {featuredItems.slice(0, 6).map((item, i) => (
              <motion.div key={item.id} className={styles.featuredCard} variants={fadeUp} custom={i}>
                <div className={styles.featuredImgWrap}>
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400"}
                    alt={item.name}
                    loading="lazy"
                  />
                  <span className={styles.featuredBadge}>{item.category}</span>
                </div>
                <div className={styles.featuredBody}>
                  <h3 className={styles.featuredName}>{item.name}</h3>
                  <p className={styles.featuredDesc}>{item.description}</p>
                  <div className={styles.featuredFooter}>
                    <span className={styles.featuredPrice}>₹{item.price}</span>
                    <button className={styles.addBtn} onClick={() => handleAdd(item)}>
                      <FiPlus /> Add
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ===== 4. HOW IT WORKS ===== */}
        <section className={styles.sectionPadding}>
          <motion.h2
            className={styles.sectionTitle}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
          >
            How Ordering Works
          </motion.h2>
          <motion.p
            className={styles.sectionSubtitle}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={1}
          >
            Simple, fast, and contactless
          </motion.p>
          <motion.div
            className={styles.timelineGrid}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
          >
            {steps.map((step, i) => (
              <motion.div key={step.label} variants={fadeUp} custom={i} style={{ display: 'contents' }}>
                <div className={styles.timelineStep}>
                  <div className={styles.timelineCircle}>{step.icon}</div>
                  <span className={styles.timelineLabel}>{step.label}</span>
                  <span className={styles.timelineSub}>{step.sub}</span>
                </div>
                {i < steps.length - 1 && <div className={styles.timelineLine} />}
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ===== 5. SPECIAL OFFER ===== */}
        <section className={styles.offerSection}>
          <motion.div
            className={styles.offerBanner}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className={styles.offerContent}>
              <h2>Get 20% OFF<br />Your First Order</h2>
              <p>Use code SANMATTEO20 on your first QR order</p>
              <Link href="/menu" className={styles.offerBtn}>
                Order Now <FiArrowRight />
              </Link>
            </div>
            <div className={styles.offerEmoji}>☕</div>
          </motion.div>
        </section>

        {/* ===== 6. TESTIMONIALS ===== */}
        <section className={styles.sectionPadding}>
          <motion.h2
            className={styles.sectionTitle}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
          >
            What People Say
          </motion.h2>
          <motion.p
            className={styles.sectionSubtitle}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={1}
          >
            Loved by our customers
          </motion.p>
          <motion.div
            className={styles.testimonialsGrid}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} className={styles.testimonialCard} variants={fadeUp} custom={i}>
                <div className={styles.testimonialStars}>{t.stars}</div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <span className={styles.testimonialAuthor}>– {t.author}</span>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ===== 7. CTA ===== */}
        <section className={styles.ctaSection}>
          <motion.h2
            className={styles.ctaTitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Ready to Order?
          </motion.h2>
          <motion.p
            className={styles.ctaDesc}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Scan the QR code or order online instantly.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/menu" className={styles.ctaBtn}>
              Start Ordering <FiArrowRight />
            </Link>
          </motion.div>
        </section>

        {/* ===== 8. FOOTER ===== */}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <h3>☕ SAN MATTEO</h3>
              <p>Crafting perfect moments, one cup at a time. Modern QR-based café ordering for a seamless experience.</p>
            </div>
            <div className={styles.footerLinks}>
              <h4>Quick Links</h4>
              <Link href="/">Home</Link>
              <Link href="/menu">Menu</Link>
              <Link href="/cart">Cart</Link>
              <a href="mailto:hello@sanmatteo.com">Contact</a>
            </div>
            <div className={styles.footerSocial}>
              <h4>Connect</h4>
              <a href="#" target="_blank" rel="noopener">Instagram</a>
              <a href="#" target="_blank" rel="noopener">Twitter</a>
              <a href="#" target="_blank" rel="noopener">Facebook</a>
              <a href="mailto:hello@sanmatteo.com">Email Us</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2025 SAN MATTEO. All rights reserved.</p>
          </div>
        </footer>

      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
