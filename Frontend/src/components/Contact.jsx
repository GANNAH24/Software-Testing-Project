import { motion } from 'motion/react';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';



const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export function Contact({ navigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      toast.success("Message sent successfully! We'll get back to you soon.", {
        duration: 4000,
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  const contactInfo = [
    {
      emoji: '📧',
      title: 'Email Us',
      details: 'support@se7ety.com',
      subtitle: 'We reply within 24 hours'
    },
    {
      emoji: '📞',
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      subtitle: 'Mon-Fri, 9AM-6PM EST'
    },
    {
      emoji: '📍',
      title: 'Visit Us',
      details: '123 Healthcare Ave, New York, NY 10001',
      subtitle: 'Main Office Location'
    },
    {
      emoji: '⏰',
      title: 'Business Hours',
      details: 'Monday - Friday: 9AM - 6PM',
      subtitle: 'Weekend: Closed'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.section 
        className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            {...fadeInUp}
          >
            <div className="text-6xl mb-4">💬</div>
            <h1 className="text-4xl md:text-5xl mb-6">Get In Touch</h1>
            <p className="text-xl opacity-90 leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and we'll respond.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.1 }}
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="text-4xl mb-2">{info.emoji}</div>
                    <h4 className="text-lg font-semibold mb-2">{info.title}</h4>
                    <p className="text-gray-900 mb-1">{info.details}</p>
                    <p className="text-sm text-gray-500">{info.subtitle}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Form & Info */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div {...fadeInUp}>
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl">✉️</div>
                    <h2 className="text-2xl text-gray-900">Send us a Message</h2>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="How can we help?"
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us more about your inquiry..."
                        required
                        rows={6}
                        className="mt-2"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#667eea] hover:bg-[#5568d3]"
                      size="lg"
                    >
                      {loading ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Additional Info */}
            <motion.div 
              className="space-y-6"
              {...fadeInUp}
            >
              {/* FAQ Prompt */}
              <Card className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white">
                <CardContent className="p-8">
                  <div className="text-5xl mb-4">❓</div>
                  <h3 className="text-2xl mb-4">Frequently Asked Questions</h3>
                  <p className="opacity-90 mb-6">
                    Looking for quick answers? Check out our FAQ section for common questions about using Se7ety.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => navigate('home')}
                    className="bg-white text-[#667eea] hover:bg-gray-100"
                  >
                    View FAQs
                  </Button>
                </CardContent>
              </Card>

              {/* Support Types */}
              <Card>
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-2xl text-gray-900 mb-6">How Can We Help?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🏥</div>
                      <div>
                        <div className="text-gray-900 mb-1">For Patients</div>
                        <p className="text-sm text-gray-600">
                          Questions about booking appointments, finding doctors, or managing your account
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">👨‍⚕️</div>
                      <div>
                        <div className="text-gray-900 mb-1">For Doctors</div>
                        <p className="text-sm text-gray-600">
                          Support with schedule management, profile updates, or platform features
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🔧</div>
                      <div>
                        <div className="text-gray-900 mb-1">Technical Support</div>
                        <p className="text-sm text-gray-600">
                          Experiencing technical issues? We're here to help resolve them quickly
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">💼</div>
                      <div>
                        <div className="text-gray-900 mb-1">Partnership Inquiries</div>
                        <p className="text-sm text-gray-600">
                          Interested in partnering with Se7ety? Let's talk about opportunities
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
