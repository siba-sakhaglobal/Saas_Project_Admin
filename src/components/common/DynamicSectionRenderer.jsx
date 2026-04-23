import React, { useState, useEffect } from 'react';

// Mock DynamicSectionRenderer for admin panel preview
// This provides basic preview functionality without needing external dependencies

const DynamicSectionRenderer = ({ section }) => {
  if (!section || !section.is_active) return null;

  const settings = typeof section.settings === 'string'
    ? JSON.parse(section.settings)
    : section.settings || {};

  const content = typeof section.content === 'string'
    ? JSON.parse(section.content)
    : section.content || {};

  // Basic styling
  const containerStyle = {
    backgroundColor: settings.backgroundColor || '#ffffff',
    color: settings.textColor || '#333333',
    padding: '2rem',
    margin: '0',
  };

  // Hero section with slider
  const HeroSection = ({ content }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = content.slides || [];

    useEffect(() => {
      if (slides.length > 1) {
        const timer = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
      }
    }, [slides.length]);

    if (slides.length === 0) return null;

    // Use gradient background instead of images for preview
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    ];

    return (
      <div style={{
        ...containerStyle,
        position: 'relative',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: gradients[currentSlide % gradients.length],
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div style={{backgroundColor: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: 'white'}}>
          <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>
            {slides[currentSlide]?.title || content.title}
          </h1>
          <p style={{fontSize: '1.2rem', marginBottom: '2rem'}}>
            {slides[currentSlide]?.subtitle || content.subtitle}
          </p>
          <button style={{backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem 2rem', borderRadius: '8px', border: 'none', fontSize: '1rem', cursor: 'pointer'}}>
            {content.buttonText || 'Get Started'}
          </button>
        </div>
        {slides.length > 1 && (
          <div style={{position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px'}}>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Stats section
  const StatsSection = ({ content }) => (
    <div style={{...containerStyle, textAlign: 'center'}}>
      {content.title && <h2 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem'}}>{content.title}</h2>}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem'}}>
        {content.stats?.map((stat, index) => (
          <div key={index} style={{textAlign: 'center'}}>
            <div style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6'}}>{stat.number}</div>
            <div style={{fontSize: '1rem', color: '#666'}}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // Testimonials section
  const TestimonialsSection = ({ content }) => {
    // Generate placeholder avatar colors
    const getAvatarColor = (index) => {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
      return colors[index % colors.length];
    };

    return (
      <div style={{...containerStyle}}>
        {content.title && <h2 style={{fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem'}}>{content.title}</h2>}
        {content.subtitle && <p style={{textAlign: 'center', color: '#666', marginBottom: '2rem'}}>{content.subtitle}</p>}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
          {content.testimonials?.map((testimonial, index) => (
            <div key={index} style={{backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e9ecef'}}>
              <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    marginRight: '1rem',
                    backgroundColor: getAvatarColor(index),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.2rem'
                  }}
                >
                  {testimonial.name ? testimonial.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <h4 style={{margin: 0, fontWeight: 'bold'}}>{testimonial.name}</h4>
                  <p style={{margin: 0, fontSize: '0.9rem', color: '#666'}}>{testimonial.role}</p>
                </div>
              </div>
              <p style={{fontStyle: 'italic', color: '#333'}}>"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Two column text
  const TwoColumnText = ({ content }) => (
    <div style={{...containerStyle}}>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem'}}>
        <div>
          <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>{content.leftTitle || 'Left Column'}</h3>
          <p style={{color: '#666', lineHeight: '1.6'}}>{content.leftContent}</p>
        </div>
        <div>
          <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>{content.rightTitle || 'Right Column'}</h3>
          <p style={{color: '#666', lineHeight: '1.6'}}>{content.rightContent}</p>
        </div>
      </div>
    </div>
  );

  // Newsletter signup
  const NewsletterSignup = ({ content }) => (
    <div style={{...containerStyle, textAlign: 'center'}}>
      <h2 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem'}}>{content.title || 'Stay Updated'}</h2>
      <p style={{color: '#666', marginBottom: '2rem'}}>{content.description || 'Subscribe to our newsletter'}</p>
      {content.features && (
        <ul style={{listStyle: 'none', padding: 0, marginBottom: '2rem'}}>
          {content.features.map((feature, index) => (
            <li key={index} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem'}}>
              <span style={{width: '8px', height: '8px', backgroundColor: 'currentColor', borderRadius: '50%', marginRight: '1rem'}}></span>
              {feature}
            </li>
          ))}
        </ul>
      )}
      <div style={{display: 'flex', gap: '1rem', maxWidth: '400px', margin: '0 auto'}}>
        <input
          type="email"
          placeholder={content.placeholder || "Your email address"}
          style={{flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc'}}
        />
        <button
          style={{backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer'}}
        >
          {content.buttonText || 'Subscribe'}
        </button>
      </div>
      {content.privacy && (
        <p style={{fontSize: '0.8rem', color: '#666', marginTop: '1rem'}}>{content.privacy}</p>
      )}
    </div>
  );

  // Rich text
  const RichText = ({ content }) => (
    <div style={{...containerStyle}}>
      {content.title && <h2 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem'}}>{content.title}</h2>}
      {content.content && (
        <div
          style={{lineHeight: '1.6', color: '#333'}}
          dangerouslySetInnerHTML={{ __html: content.content }}
        />
      )}
    </div>
  );

  // Contact form
  const ContactForm = ({ content }) => (
    <div style={{...containerStyle}}>
      {content.title && <h2 style={{fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem'}}>{content.title}</h2>}
      {content.subtitle && <p style={{textAlign: 'center', color: '#666', marginBottom: '2rem'}}>{content.subtitle}</p>}
      <div style={{maxWidth: '600px', margin: '0 auto'}}>
        {content.fields && content.fields.map((field, index) => (
          <div key={index} style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333'}}>
              {field.label} {field.required && <span style={{color: 'red'}}>*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                placeholder={`Enter your ${field.label.toLowerCase()}`}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  minHeight: '120px',
                  resize: 'vertical'
                }}
              />
            ) : (
              <input
                type={field.type}
                placeholder={`Enter your ${field.label.toLowerCase()}`}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            )}
          </div>
        ))}
        <button
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          {content.buttonText || 'Submit'}
        </button>
      </div>
    </div>
  );

  // About section
  const AboutSection = ({ content }) => (
    <div style={{...containerStyle}}>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center'}}>
        <div>
          <h2 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem'}}>{content.title}</h2>
          <div
            style={{lineHeight: '1.6', color: '#666', marginBottom: '2rem'}}
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
          {content.features && (
            <ul style={{listStyle: 'none', padding: 0}}>
              {content.features.map((feature, index) => (
                <li key={index} style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                  <span style={{width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%', marginRight: '1rem'}}></span>
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>
        {content.image && (
          <div>
            <div
              style={{
                width: '100%',
                height: '300px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              Image Preview
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Default fallback
  const DefaultSection = ({ content, sectionType }) => (
    <div style={{...containerStyle, textAlign: 'center', border: '2px dashed #ddd', backgroundColor: '#f8f9fa'}}>
      <h3 style={{color: '#666', marginBottom: '1rem'}}>Component Preview: {sectionType}</h3>
      <pre style={{backgroundColor: '#fff', padding: '1rem', borderRadius: '4px', textAlign: 'left', fontSize: '0.8rem', overflow: 'auto'}}>
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );

  // Render based on section type
  switch (section.section_type) {
    case 'hero':
      return <HeroSection content={content} />;
    case 'stats':
      return <StatsSection content={content} />;
    case 'about':
      return <AboutSection content={content} />;
    case 'testimonials':
      return <TestimonialsSection content={content} />;
    case 'two_column_text':
      return <TwoColumnText content={content} />;
    case 'newsletter_signup':
      return <NewsletterSignup content={content} />;
    case 'rich_text':
      return <RichText content={content} />;
    case 'contact_form':
      return <ContactForm content={content} />;
    case 'about_hero':
    case 'about_stats':
    case 'building_future':
    case 'empowering':
    case 'team':
    case 'message_from_director':
    case 'blog_list':
    case 'campaigns':
    case 'events':
    case 'achievements':
    case 'environment':
    case 'initiatives':
    case 'community':
    case 'volunteer':
    case 'get_involved':
    case 'media_gallery':
    case 'products_shop':
    case 'partners':
    case 'footer_policy':
      return <DefaultSection content={content} sectionType={section.section_type} />;
    default:
      return <DefaultSection content={content} sectionType={section.section_type} />;
  }
};

export default DynamicSectionRenderer;