'use client';

import { useState } from 'react';
import PageTitle from '@/components/PageTitle';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you can add your email sending logic
        console.log('Form submitted:', formData);
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
    };

    const contactInfo = [
        {
            icon: '📱',
            title: 'Phone Numbers',
            content: ['08055452f421', '09073218166']
        },
        {
            icon: '✉️',
            title: 'Email',
            content: ['craveaccessories647@gmail.com']
        },
        {
            icon: '📍',
            title: 'Location',
            content: ['CB 45, 46 & 53 CB Plaza', 'Fancy and Furniture, Alaba International Market', 'Ojo Lagos']
        },
        {
            icon: '🌐',
            title: 'Social Media',
            content: [
                'Instagram: @cravephoneaccessories',
                'TikTok: @craveaccess1121',
                'Facebook: crave smart accessories'
            ]
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <PageTitle title="Contact Us" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {contactInfo.map((info, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md p-8">
                            <div className="text-4xl mb-4">{info.icon}</div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-4">{info.title}</h3>
                            <ul className="space-y-2">
                                {info.content.map((item, i) => (
                                    <li key={i} className="text-slate-600 text-sm">{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-8">Send us a Message</h2>
                    
                    {submitted && (
                        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                            Thank you for your message! We'll get back to you soon.
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Subject
                            </label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                placeholder="Message subject"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Message
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="6"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                                placeholder="Your message..."
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition duration-200"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
