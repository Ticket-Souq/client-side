import { useState } from 'react'
import './Contact.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General inquiry', message: '' })

  return (
    <main className="wrap contact-page">
      <section className="page-head">
        <h1 className="section-title">Contact Us</h1>
        <p className="section-sub">Get in touch with our team — we're here to help</p>
      </section>

      <div className="contact-layout">
        <div className="contact-form-wrap">
          <h2 className="contact-section-title">Send us a message</h2>
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-input" type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-select" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                <option>General inquiry</option>
                <option>Ticket support</option>
                <option>Refund request</option>
                <option>Partnership</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-input contact-textarea" rows={6} placeholder="How can we help you?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit">Send Message</button>
          </form>
        </div>

        <div className="contact-info">
          <h2 className="contact-section-title">Reach us directly</h2>
          <div className="info-card">
            <div className="info-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div>
              <h3 className="info-title">Email</h3>
              <p className="info-detail">support@ticketsouq.com</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
            </div>
            <div>
              <h3 className="info-title">Phone</h3>
              <p className="info-detail">+20 123 456 7890</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <h3 className="info-title">Office</h3>
              <p className="info-detail">Nasr City, Cairo, Egypt</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <h3 className="info-title">Hours</h3>
              <p className="info-detail">Sun – Thu: 9:00 AM – 6:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
