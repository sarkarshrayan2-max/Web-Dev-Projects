const blogPosts = [
    {
        id: 1,
        title: "Getting Started with Web Development",
        author: "Jane Doe",
        date: "2026-06-01",
        tags: ["web", "development", "beginner"],
        excerpt: "Learn the basics of web development and start your journey as a web developer.",
        content: "Web development is the process of building and maintaining websites. It includes web design, web content development, client-side scripting, server-side scripting, and network security.\n\nThis comprehensive guide will help you understand the fundamentals of web development and get you started on your journey. In this post, we'll cover HTML basics, CSS styling, and JavaScript interactivity. We'll explore various frameworks and tools that can help you build modern web applications. Whether you're a complete beginner or looking to refresh your knowledge, this guide will provide you with practical examples and best practices.",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop"
    },
    {
        id: 2,
        title: "Understanding JavaScript Promises",
        author: "John Smith",
        date: "2026-05-28",
        tags: ["javascript", "async", "promises"],
        excerpt: "Deep dive into JavaScript promises and how they simplify asynchronous programming.",
        content: "Promises are one of the most important features in modern JavaScript. They provide a cleaner way to handle asynchronous operations compared to traditional callbacks.\n\nA Promise represents an operation that hasn't completed yet but is expected to in the future. This article covers the three states of a promise: pending, fulfilled, and rejected. We'll explore how to create promises, chain them together, and handle errors effectively. You'll also learn about Promise.all() and Promise.race(). By the end, you'll have a solid understanding of promises.",
        image: "https://images.unsplash.com/photo-1516534775068-bb57d7e13e39?w=600&h=400&fit=crop"
    },
    {
        id: 3,
        title: "CSS Grid vs Flexbox: When to Use Each",
        author: "Sarah Johnson",
        date: "2026-05-20",
        tags: ["css", "layout", "design"],
        excerpt: "Compare CSS Grid and Flexbox to understand which layout system is best for your projects.",
        content: "CSS has given us two powerful layout tools: CSS Grid and Flexbox. Both are incredibly useful, but they serve different purposes.\n\nFlexbox is perfect for one-dimensional layouts, where items are laid out in a single row or column. CSS Grid, on the other hand, is designed for two-dimensional layouts. In this post, we'll explore the differences between these two systems, look at practical examples, and help you decide which one to use for your next project.",
        image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=400&fit=crop"
    },
    {
        id: 4,
        title: "Building Responsive Web Design",
        author: "Mike Chen",
        date: "2026-05-15",
        tags: ["responsive", "design", "mobile"],
        excerpt: "Master the principles of responsive web design to create websites that work on all devices.",
        content: "Responsive web design is an approach to web design that makes web pages render well on a variety of devices and window or screen sizes. It's become essential in modern web development.\n\nThis comprehensive guide covers mobile-first design principles, media queries, flexible layouts, and responsive images. By implementing responsive design, you ensure that your website provides an optimal viewing experience for every user, regardless of their device.",
        image: "https://images.unsplash.com/photo-1522869635100-ce72e469b330?w=600&h=400&fit=crop"
    },
    {
        id: 5,
        title: "Introduction to React Hooks",
        author: "Emily White",
        date: "2026-05-10",
        tags: ["react", "hooks", "javascript"],
        excerpt: "Learn how React Hooks revolutionized functional components and state management.",
        content: "React Hooks were introduced in React 16.8 and changed the way we write React components. They allow you to use state and other React features without writing a class component.\n\nHooks like useState, useEffect, and useContext make it easier to reuse logic across components. This guide covers the most important hooks and how to use them effectively. By mastering hooks, you'll be able to write cleaner, more maintainable React code.",
        image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=600&h=400&fit=crop"
    },
    {
        id: 6,
        title: "Web Performance Optimization Tips",
        author: "David Brown",
        date: "2026-05-05",
        tags: ["performance", "optimization", "web"],
        excerpt: "Discover practical tips to optimize your website's performance and improve user experience.",
        content: "Web performance is critical for user experience and SEO. Slow websites lead to higher bounce rates and lower conversions.\n\nThis comprehensive guide covers various performance optimization techniques: image optimization, code splitting, lazy loading, caching strategies, and minification. Implementing these optimization techniques will significantly improve your website's speed and user satisfaction.",
        image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=400&fit=crop"
    }
];

// Helper: format content with paragraphs
function formatContent(text) {
    return text.split(/\n\n/).map(para => `<p>${para.replace(/\n/g, ' ')}</p>`).join('');
}

// Helper: render posts dynamically
function renderPosts() {
    const grid = document.getElementById('postsGrid');
    if (!grid) return;
    
    grid.innerHTML = blogPosts.map(post => `
        <div class="post-card" data-id="${post.id}">
            <img src="${post.image}" alt="${post.title}" class="post-image" loading="lazy" 
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22%3E%3Crect fill=%22%23334155%22 width=%22400%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22%23cbd5e1%22 text-anchor=%22middle%22 dy=%22.3em%22%3E📷 image%3C/text%3E%3C/svg%3E'">
            <div class="post-content">
                <h3 class="post-title">${escapeHtml(post.title)}</h3>
                <div class="post-meta">
                    <span>By ${escapeHtml(post.author)}</span>
                    <span>• ${formatDate(post.date)}</span>
                </div>
                <div class="tag-list">
                    ${post.tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}
                </div>
                <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
                <div class="read-more">Read full story →</div>
            </div>
        </div>
    `).join('');

    // reattach event listeners to each post card (delegation also safe, but direct is fine)
    document.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // avoid if click originates from nested read-more that might bubble, but fine
            const id = parseInt(card.dataset.id);
            openPostModal(id);
        });
    });
    updatePostsCount();
}

// update posts count in UI
function updatePostsCount() {
    const countSpan = document.getElementById('postsCount');
    if (countSpan) countSpan.innerText = `${blogPosts.length} articles`;
}

// format date
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// simple escape to avoid XSS
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// --- MODAL LOGIC (post modal & about modal) ---
const postModal = document.getElementById('postModal');
const aboutModal = document.getElementById('aboutModal');
const closePostBtn = document.getElementById('closePostModalBtn');
const closeAboutBtn = document.getElementById('closeAboutModalBtn');

function openPostModal(id) {
    const post = blogPosts.find(p => p.id === id);
    if (!post) return;
    
    document.getElementById('modalTitle').innerText = post.title;
    document.getElementById('modalMeta').innerHTML = `
        By ${escapeHtml(post.author)} • ${formatDate(post.date)}
        <div style="margin-top: 0.5rem;">
            ${post.tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}
        </div>
    `;
    const modalImg = document.getElementById('modalImage');
    modalImg.src = post.image;
    modalImg.alt = post.title;
    modalImg.onerror = () => { modalImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23334155' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' fill='white' text-anchor='middle' dy='.3em'%3Eno preview%3C/text%3E%3C/svg%3E"; };
    document.getElementById('modalBody').innerHTML = formatContent(post.content);
    
    postModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closePostModal() {
    postModal.classList.remove('show');
    document.body.style.overflow = '';
}

function openAboutModal() {
    aboutModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeAboutModal() {
    aboutModal.classList.remove('show');
    document.body.style.overflow = '';
}

// ---- EVENT LISTENERS FOR MODALS ----
closePostBtn.addEventListener('click', closePostModal);
closeAboutBtn.addEventListener('click', closeAboutModal);

// Click outside to close modals
window.addEventListener('click', (e) => {
    if (e.target === postModal) closePostModal();
    if (e.target === aboutModal) closeAboutModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (postModal.classList.contains('show')) closePostModal();
        if (aboutModal.classList.contains('show')) closeAboutModal();
    }
});

// --- THEME MANAGEMENT (dark/light) ---
const themeBtn = document.getElementById('themeBtn');
const htmlElement = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    htmlElement.classList.add('dark');
    themeBtn.textContent = '☀️ Light';
} else {
    themeBtn.textContent = '🌙 Dark';
}

themeBtn.addEventListener('click', () => {
    if (htmlElement.classList.contains('dark')) {
        htmlElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        themeBtn.textContent = '🌙 Dark';
    } else {
        htmlElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        themeBtn.textContent = '☀️ Light';
    }
});

// --- NAVIGATION & SMOOTH SCROLL, ABOUT LINK ---
const allPostsLink = document.getElementById('allPostsLink');
const aboutLink = document.getElementById('aboutLink');
const footerAboutLink = document.getElementById('footerAboutLink');
const logoLink = document.getElementById('logoLink');

if (allPostsLink) {
    allPostsLink.addEventListener('click', (e) => {
        e.preventDefault();
        const section = document.getElementById('posts-section');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

function handleAboutClick(e) {
    e.preventDefault();
    openAboutModal();
}

if (aboutLink) aboutLink.addEventListener('click', handleAboutClick);
if (footerAboutLink) footerAboutLink.addEventListener('click', handleAboutClick);
if (logoLink) {
    logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// dynamic footer year
document.getElementById('currentYear').innerText = new Date().getFullYear();

// handle hero cta smooth scroll and additional fallbacks
document.querySelectorAll('.hero-cta, [href="#posts-section"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
            e.preventDefault();
            const targetElem = document.querySelector(targetId);
            if (targetElem) targetElem.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// initial rendering
renderPosts();

console.log('12Blog');