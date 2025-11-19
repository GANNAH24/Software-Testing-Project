import { motion } from 'motion/react';
import { Heart, Users, Award, Shield } from 'lucide-react';
import { Card, CardContent } from './ui/card';

// Converted from TSX: removed AboutUsProps interface
export function AboutUs({ navigate }) {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const stagger = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.2 }
  };

  const values = [
    {
      icon: Heart,
      emoji: '❤️',
      title: 'Patient-Centered Care',
      description: 'We put patients first, ensuring every interaction is compassionate and supportive.'
    },
    {
      icon: Shield,
      emoji: '🛡️',
      title: 'Trust & Security',
      description: 'Your health data is protected with enterprise-grade security and privacy measures.'
    },
    {
      icon: Award,
      emoji: '🏆',
      title: 'Quality Excellence',
      description: 'We partner only with certified, experienced healthcare professionals.'
    },
    {
      icon: Users,
      emoji: '👥',
      title: 'Accessibility',
      description: 'Making healthcare accessible to everyone, anytime, anywhere.'
    }
  ];

  const stats = [
    { emoji: '👨‍⚕️', number: '500+', label: 'Verified Doctors' },
    { emoji: '😊', number: '50,000+', label: 'Happy Patients' },
    { emoji: '⭐', number: '4.9/5', label: 'Average Rating' },
    { emoji: '🏥', number: '100+', label: 'Healthcare Facilities' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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
            <h1 className="text-4xl md:text-5xl mb-6">About Se7ety</h1>
            <p className="text-xl opacity-90 leading-relaxed">
              We're on a mission to revolutionize healthcare access by connecting patients with the right medical professionals at the right time.
            </p>
          </motion.div>
        </div>
      </motion.section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            {...stagger}
          >
            <motion.div {...fadeInUp}>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-5xl">🎯</div>
                <h2 className="text-3xl text-gray-900">Our Mission</h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                At Se7ety, we believe that everyone deserves access to quality healthcare. Our platform bridges the gap between patients seeking care and healthcare professionals ready to provide it.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                We leverage technology to make healthcare discovery, appointment booking, and medical care coordination seamless, efficient, and patient-friendly.
              </p>
            </motion.div>

            <motion.div {...fadeInUp} className="relative">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="text-center hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="text-4xl mb-2">{stat.emoji}</div>
                        <div className="text-3xl text-[#667eea] mb-2">{stat.number}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-3xl text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do and shape how we serve our community.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#667eea]">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-4">{value.emoji}</div>
                    <h3 className="text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp}>
            <div className="flex items-center gap-3 mb-6 justify-center">
              <div className="text-5xl">📖</div>
              <h2 className="text-3xl text-gray-900">Our Story</h2>
            </div>
            <Card>
              <CardContent className="p-8">
                <p className="text-gray-600 text-lg leading-relaxed mb-4">
                  Founded in 2024, Se7ety was born from a simple observation: finding and booking appointments with healthcare professionals shouldn't be complicated or time-consuming.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed mb-4">
                  Our founders, a team of healthcare professionals and technology experts, experienced firsthand the challenges patients face when trying to access medical care. Long wait times, difficulty finding specialists, and complex scheduling processes were common pain points.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Today, Se7ety serves thousands of patients and hundreds of healthcare professionals, making healthcare more accessible, transparent, and efficient for everyone involved.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <motion.section 
        className="py-16 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white"
        {...fadeInUp}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-3xl mb-4">Join Our Healthcare Community</h2>
          <p className="text-xl opacity-90 mb-8">
            Experience the future of healthcare access today.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <motion.button
              onClick={() => navigate('register')}
              className="bg-white text-[#667eea] px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
            <motion.button
              onClick={() => navigate('contact')}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Us
            </motion.button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
