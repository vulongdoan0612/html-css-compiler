export const defaultTemplates = [
  {
    id: 'hero',
    name: '🎨 Modern Hero Card',
    description: 'Sleek dark card with gradient badge, glowing hover effect and CTA button.',
    html: `<div class="card">
  <div class="badge">🔥 Hot Feature</div>
  <h1>Real-time HTML & CSS Compiler</h1>
  <p>Format code pretty, auto-complete tags, and view live preview changes instantly in real-time!</p>
  
  <div class="actions">
    <button class="btn btn-primary">Get Started</button>
    <button class="btn btn-outline">Learn More</button>
  </div>
</div>`,
    css: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.card {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  padding: 40px;
  border-radius: 20px;
  max-width: 480px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  border-color: rgba(99, 102, 241, 0.5);
}

.badge {
  display: inline-block;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 20px;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

h1 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 12px;
  line-height: 1.2;
}

p {
  color: #94a3b8;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #6366f1;
  color: white;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.btn-primary:hover {
  background: #4f46e5;
}

.btn-outline {
  background: transparent;
  color: #cbd5e1;
  border: 1px solid #334155;
}

.btn-outline:hover {
  background: #1e293b;
  color: white;
}`
  },
  {
    id: 'pricing',
    name: '💎 Glass Pricing Card',
    description: 'Beautiful pricing feature card with micro-interactions and features checklist.',
    html: `<div class="pricing-container">
  <div class="pricing-card popular">
    <div class="tag">Most Popular</div>
    <h2>Pro Developer</h2>
    <div class="price">$19 <span>/ month</span></div>
    
    <ul class="features">
      <li>✓ Real-time Live Preview</li>
      <li>✓ Auto-closing HTML Tags</li>
      <li>✓ HTML Pretty Formatter</li>
      <li>✓ Multi-device Viewport Emulator</li>
    </ul>

    <button class="cta-button">Subscribe Now</button>
  </div>
</div>`,
    css: `body {
  background: radial-gradient(circle at top left, #1e1b4b, #0f172a);
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  color: #fff;
}

.pricing-card {
  background: #1e293b;
  border: 2px solid #6366f1;
  border-radius: 16px;
  padding: 32px;
  width: 320px;
  position: relative;
  box-shadow: 0 15px 35px rgba(99, 102, 241, 0.25);
}

.tag {
  position: absolute;
  top: -12px;
  right: 24px;
  background: #6366f1;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 12px;
  text-transform: uppercase;
}

h2 {
  font-size: 20px;
  margin: 0 0 16px 0;
}

.price {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 24px;
}

.price span {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 400;
}

.features {
  list-style: none;
  padding: 0;
  margin: 0 0 28px 0;
}

.features li {
  padding: 8px 0;
  color: #cbd5e1;
  font-size: 14px;
}

.cta-button {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.cta-button:hover {
  opacity: 0.9;
}`
  },
  {
    id: 'profile',
    name: '👤 User Profile Card',
    description: 'Clean user bio avatar card with social status indicators.',
    html: `<div class="user-card">
  <div class="avatar-box">
    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" alt="Avatar">
    <span class="status-dot"></span>
  </div>
  
  <h3>Sarah Jenkins</h3>
  <p class="role">Senior UI/UX Engineer</p>

  <div class="stats">
    <div class="stat-item">
      <span class="num">142</span>
      <span class="label">Projects</span>
    </div>
    <div class="stat-item">
      <span class="num">18.5k</span>
      <span class="label">Followers</span>
    </div>
  </div>

  <button class="btn-follow">Follow Profile</button>
</div>`,
    css: `body {
  background: #090d16;
  font-family: system-ui, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.user-card {
  background: #111827;
  border: 1px solid #1f293d;
  border-radius: 20px;
  padding: 28px;
  text-align: center;
  width: 300px;
  color: white;
}

.avatar-box {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.avatar-box img {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #6366f1;
}

.status-dot {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 14px;
  height: 14px;
  background: #10b981;
  border: 2px solid #111827;
  border-radius: 50%;
}

h3 {
  font-size: 18px;
  margin: 0 0 4px 0;
}

.role {
  color: #9ca3af;
  font-size: 13px;
  margin-bottom: 20px;
}

.stats {
  display: flex;
  justify-content: space-around;
  background: #1f293d;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.num {
  font-weight: 700;
  font-size: 16px;
}

.label {
  font-size: 11px;
  color: #9ca3af;
}

.btn-follow {
  width: 100%;
  padding: 10px;
  border: 1px solid #6366f1;
  background: rgba(99, 102, 241, 0.1);
  color: #818cf8;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-follow:hover {
  background: #6366f1;
  color: white;
}`
  }
];
