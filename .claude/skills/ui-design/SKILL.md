# Skill: UI Design & Style Integration

Load this skill when: choosing visual styles, building UI components, or user asks about design.

---

## PREREQUISITE: Install UI/UX Pro Max

```bash
# Check if installed
ls .claude/skills/ui-ux-pro-max/SKILL.md 2>/dev/null && echo "INSTALLED" || echo "NOT INSTALLED"

# Install
npx uipro-cli install
# OR manually:
git clone https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git /tmp/uiux
cp -r /tmp/uiux/.claude/skills/* .claude/skills/
rm -rf /tmp/uiux
```

**Repo:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
**Full gallery:** https://ui-ux-pro-max-skill.nextlevelbuilder.io/#styles

---

## Available Design Styles (27 styles with live demos)

| Style | Best For | Demo |
|-------|----------|------|
| Minimalism & Swiss | Enterprise, SaaS, dashboards | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/minimalism-swiss-style) |
| Glassmorphism | Modern apps, portfolios | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/glassmorphism) |
| Neumorphism | Settings, controls, toggles | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/neumorphism) |
| Soft UI Evolution | Wellness, beauty, lifestyle | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/soft-ui-evolution) |
| Dark Mode (OLED) | Tech, gaming, dev tools | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/dark-mode-(oled)) |
| Vibrant & Block-based | Creative, startups, youth | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/vibrant-block-based) |
| Hero-Centric | Landing pages, campaigns | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/hero-centric-design) |
| Conversion-Optimized | E-commerce, SaaS signups | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/conversion-optimized) |
| Social Proof-Focused | Services, agencies, B2B | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/social-proof-focused) |
| Storytelling-Driven | NGOs, charities, impact | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/storytelling-driven) |
| Trust & Authority | Healthcare, legal, finance | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/trust-authority) |
| Data-Dense Dashboard | Analytics, admin panels | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/data-dense-dashboard) |
| Executive Dashboard | C-suite, reports | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/executive-dashboard) |
| Flat Design | Mobile apps, clean UI | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/flat-design) |
| Brutalism | Bold portfolios, art | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/brutalism) |
| Retro-Futurism | Gaming, entertainment | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/retro-futurism) |
| Liquid Glass | Apple-inspired, premium | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/liquid-glass) |
| Aurora UI | Creative tools, music | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/aurora-ui) |
| Motion-Driven | Interactive portfolios | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/motion-driven) |
| Claymorphism | Friendly apps, education | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/claymorphism) |
| Accessible & Ethical | Government, public services | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/accessible-ethical) |
| Interactive Product Demo | Product launches, SaaS | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/interactive-product-demo) |
| Feature-Rich Showcase | Complex products | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/feature-rich-showcase) |
| Minimal & Direct | Simple tools, utilities | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/minimal-direct) |
| Real-Time Monitoring | IoT, DevOps, ops | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/real-time-monitoring) |
| Drill-Down Analytics | BI tools, data | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/drill-down-analytics) |
| Predictive Analytics | AI/ML dashboards | [Demo](https://ui-ux-pro-max-skill.nextlevelbuilder.io/styles/predictive-analytics) |

---

## Project Type → Recommended Style

| Project Type | Primary Style | Alternate |
|---|---|---|
| E-Commerce | Conversion-Optimized | Feature-Rich Showcase |
| NGO / Charity | Storytelling-Driven | Social Proof-Focused |
| Doctor / Clinic | Trust & Authority | Soft UI Evolution |
| Blog / Magazine | Minimalism | Hero-Centric |
| SaaS Dashboard | Data-Dense Dashboard | Dark Mode |
| Portfolio / Agency | Glassmorphism | Motion-Driven |
| Booking / Services | Conversion-Optimized | Soft UI |
| Marketplace | Vibrant & Block-based | Minimalism |
| Kids / Education | Claymorphism | Vibrant |
| Finance / Legal | Trust & Authority | Minimalism |
| Gaming | Retro-Futurism | Dark Mode |
| Wellness / Spa | Soft UI Evolution | Aurora UI |

---

## How to Apply

1. Ask user: *"What visual style do you prefer?"* Share gallery link
2. Once chosen, load the UI/UX Pro Max skill for that style's design tokens
3. Use the style's CSS variables, colors, spacing, typography
4. Wire in CMS SDK data — UI skill handles look, SDK handles data
