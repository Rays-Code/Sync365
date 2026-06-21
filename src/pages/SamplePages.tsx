
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SamplePages = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center text-gray-700 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Main Site
          </Link>
          <h1 className="text-xl font-semibold">Color Palette Samples for Sync365</h1>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Compare 5 Color Palettes</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Each sample below shows how the palette would look on your Sync365 landing page. 
            Scroll through to find the one that resonates most with your brand vision.
          </p>
        </div>

        {/* Palette 1: Flo-Inspired */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">Palette 1</span>
            <h3 className="text-2xl font-bold text-gray-800">Inspired by Flo</h3>
            <span className="text-gray-500 text-sm">Soft pinks, feminine gradients, premium feel</span>
          </div>
          <div className="flex gap-2 mb-4">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#FFF9F9' }} title="#FFF9F9"></div>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#E8A0BF' }} title="#E8A0BF"></div>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#BA90C6' }} title="#BA90C6"></div>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#C0DBEA' }} title="#C0DBEA"></div>
            <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: '#4A4A4A' }} title="#4A4A4A"></div>
          </div>
          
          {/* Sample Landing */}
          <div className="rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: '#FFF9F9' }}>
            <div className="p-8 md:p-12">
              <nav className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E8A0BF' }}>
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <span className="font-semibold" style={{ color: '#4A4A4A' }}>Sync365</span>
                </div>
                <div className="hidden md:flex items-center gap-6">
                  <a href="#" className="text-sm" style={{ color: '#4A4A4A' }}>Features</a>
                  <a href="#" className="text-sm" style={{ color: '#4A4A4A' }}>About</a>
                  <a href="#" className="text-sm" style={{ color: '#4A4A4A' }}>Pricing</a>
                  <button className="px-4 py-2 rounded-full text-sm text-white" style={{ backgroundColor: '#E8A0BF' }}>Get Started</button>
                </div>
              </nav>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#4A4A4A' }}>
                    Track your cycle with elegance and ease
                  </h1>
                  <p className="mb-6" style={{ color: '#666666' }}>
                    Sync365 helps you understand your body with AI-powered insights and beautiful design.
                  </p>
                  <div className="flex gap-3">
                    <button className="px-6 py-3 rounded-full text-white font-medium" style={{ backgroundColor: '#E8A0BF' }}>
                      Download Free
                    </button>
                    <button className="px-6 py-3 rounded-full font-medium border" style={{ borderColor: '#BA90C6', color: '#BA90C6' }}>
                      Learn More
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-48 h-80 rounded-3xl p-3 shadow-lg" style={{ backgroundColor: 'white', border: '1px solid #E8A0BF' }}>
                    <div className="w-full h-12 rounded-t-2xl flex items-center justify-center" style={{ backgroundColor: '#E8A0BF' }}>
                      <span className="text-white text-sm font-medium">Your Cycle</span>
                    </div>
                    <div className="p-4 text-center">
                      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: '#C0DBEA' }}>
                        <span className="text-xl font-bold" style={{ color: '#E8A0BF' }}>28</span>
                      </div>
                      <p className="text-xs mb-4" style={{ color: '#666' }}>Day 14 - Ovulation</p>
                      <div className="grid grid-cols-7 gap-1">
                        {[...Array(28)].map((_, i) => (
                          <div key={i} className="w-3 h-3 rounded-full" style={{ 
                            backgroundColor: i < 5 ? '#E8A0BF' : i >= 12 && i < 16 ? '#BA90C6' : '#F0F0F0'
                          }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Palette 2: Glow-Inspired */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">Palette 2</span>
            <h3 className="text-2xl font-bold text-gray-800">Inspired by Glow</h3>
            <span className="text-gray-500 text-sm">Coral & teal, fertility-focused, data-driven</span>
          </div>
          <div className="flex gap-2 mb-4">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#FFFAF7' }} title="#FFFAF7"></div>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#FF8A8A' }} title="#FF8A8A"></div>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#FFC6C6' }} title="#FFC6C6"></div>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#95DAC1' }} title="#95DAC1"></div>
            <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: '#2D3436' }} title="#2D3436"></div>
          </div>
          
          <div className="rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: '#FFFAF7' }}>
            <div className="p-8 md:p-12">
              <nav className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF8A8A' }}>
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <span className="font-semibold" style={{ color: '#2D3436' }}>Sync365</span>
                </div>
                <div className="hidden md:flex items-center gap-6">
                  <a href="#" className="text-sm" style={{ color: '#2D3436' }}>Features</a>
                  <a href="#" className="text-sm" style={{ color: '#2D3436' }}>About</a>
                  <a href="#" className="text-sm" style={{ color: '#2D3436' }}>Pricing</a>
                  <button className="px-4 py-2 rounded-full text-sm text-white" style={{ backgroundColor: '#FF8A8A' }}>Get Started</button>
                </div>
              </nav>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#2D3436' }}>
                    Your cycle, your way � fresh and simple
                  </h1>
                  <p className="mb-6" style={{ color: '#636e72' }}>
                    A modern approach to period tracking with AI predictions you can trust.
                  </p>
                  <div className="flex gap-3">
                    <button className="px-6 py-3 rounded-full text-white font-medium" style={{ backgroundColor: '#FF8A8A' }}>
                      Start Tracking
                    </button>
                    <button className="px-6 py-3 rounded-full font-medium border" style={{ borderColor: '#95DAC1', color: '#2D3436', backgroundColor: '#95DAC1' }}>
                      See How It Works
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-48 h-80 rounded-3xl p-3 shadow-lg" style={{ backgroundColor: 'white', border: '1px solid #FFC6C6' }}>
                    <div className="w-full h-12 rounded-t-2xl flex items-center justify-center" style={{ backgroundColor: '#FF8A8A' }}>
                      <span className="text-white text-sm font-medium">Your Cycle</span>
                    </div>
                    <div className="p-4 text-center">
                      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: '#FFC6C6' }}>
                        <span className="text-xl font-bold" style={{ color: '#FF8A8A' }}>28</span>
                      </div>
                      <p className="text-xs mb-4" style={{ color: '#636e72' }}>Next period in 5 days</p>
                      <div className="grid grid-cols-7 gap-1">
                        {[...Array(28)].map((_, i) => (
                          <div key={i} className="w-3 h-3 rounded-full" style={{ 
                            backgroundColor: i < 5 ? '#FF8A8A' : i >= 12 && i < 16 ? '#95DAC1' : '#F5F5F5'
                          }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Palette 3: Natural Cycles-Inspired */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">Palette 3</span>
            <h3 className="text-2xl font-bold text-gray-800">Inspired by Natural Cycles</h3>
            <span className="text-gray-500 text-sm">Sage greens, organic feel, scientific credibility</span>
          </div>
          <div className="flex gap-2 mb-4">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#F8F9F5' }} title="#F8F9F5"></div>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#8DB596' }} title="#8DB596"></div>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#DEB6AB' }} title="#DEB6AB"></div>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#E8C07D' }} title="#E8C07D"></div>
            <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: '#3D3D3D' }} title="#3D3D3D"></div>
          </div>
          
          <div className="rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: '#F8F9F5' }}>
            <div className="p-8 md:p-12">
              <nav className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8DB596' }}>
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <span className="font-semibold" style={{ color: '#3D3D3D' }}>Sync365</span>
                </div>
                <div className="hidden md:flex items-center gap-6">
                  <a href="#" className="text-sm" style={{ color: '#3D3D3D' }}>Features</a>
                  <a href="#" className="text-sm" style={{ color: '#3D3D3D' }}>About</a>
                  <a href="#" className="text-sm" style={{ color: '#3D3D3D' }}>Pricing</a>
                  <button className="px-4 py-2 rounded-full text-sm text-white" style={{ backgroundColor: '#8DB596' }}>Get Started</button>
                </div>
              </nav>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3D3D3D' }}>
                    Connect with your natural rhythm
                  </h1>
                  <p className="mb-6" style={{ color: '#5D5D5D' }}>
                    A holistic approach to cycle tracking that honors your body's wisdom.
                  </p>
                  <div className="flex gap-3">
                    <button className="px-6 py-3 rounded-full text-white font-medium" style={{ backgroundColor: '#8DB596' }}>
                      Begin Your Journey
                    </button>
                    <button className="px-6 py-3 rounded-full font-medium" style={{ backgroundColor: '#DEB6AB', color: '#3D3D3D' }}>
                      Explore Features
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-48 h-80 rounded-3xl p-3 shadow-lg" style={{ backgroundColor: 'white', border: '1px solid #8DB596' }}>
                    <div className="w-full h-12 rounded-t-2xl flex items-center justify-center" style={{ backgroundColor: '#8DB596' }}>
                      <span className="text-white text-sm font-medium">Your Cycle</span>
                    </div>
                    <div className="p-4 text-center">
                      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: '#E8C07D' }}>
                        <span className="text-xl font-bold" style={{ color: '#3D3D3D' }}>28</span>
                      </div>
                      <p className="text-xs mb-4" style={{ color: '#5D5D5D' }}>Follicular phase</p>
                      <div className="grid grid-cols-7 gap-1">
                        {[...Array(28)].map((_, i) => (
                          <div key={i} className="w-3 h-3 rounded-full" style={{ 
                            backgroundColor: i < 5 ? '#DEB6AB' : i >= 12 && i < 16 ? '#E8C07D' : '#EDEDED'
                          }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Palette 4: Clue-Inspired */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">Palette 4</span>
            <h3 className="text-2xl font-bold text-gray-800">Inspired by Clue</h3>
            <span className="text-gray-500 text-sm">Deep purple, gender-neutral, modern & bold</span>
          </div>
          <div className="flex gap-2 mb-4">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#FAFAFA' }} title="#FAFAFA"></div>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#6C5CE7' }} title="#6C5CE7"></div>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#00B894' }} title="#00B894"></div>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#FF7675' }} title="#FF7675"></div>
            <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: '#2D3436' }} title="#2D3436"></div>
          </div>
          
          <div className="rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: '#FAFAFA' }}>
            <div className="p-8 md:p-12">
              <nav className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#6C5CE7' }}>
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <span className="font-semibold" style={{ color: '#2D3436' }}>Sync365</span>
                </div>
                <div className="hidden md:flex items-center gap-6">
                  <a href="#" className="text-sm" style={{ color: '#2D3436' }}>Features</a>
                  <a href="#" className="text-sm" style={{ color: '#2D3436' }}>About</a>
                  <a href="#" className="text-sm" style={{ color: '#2D3436' }}>Pricing</a>
                  <button className="px-4 py-2 rounded-full text-sm text-white" style={{ backgroundColor: '#6C5CE7' }}>Get Started</button>
                </div>
              </nav>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#2D3436' }}>
                    Science-backed tracking for everyone
                  </h1>
                  <p className="mb-6" style={{ color: '#636e72' }}>
                    Modern, inclusive period tracking powered by AI and designed for all bodies.
                  </p>
                  <div className="flex gap-3">
                    <button className="px-6 py-3 rounded-full text-white font-medium" style={{ backgroundColor: '#6C5CE7' }}>
                      Get the App
                    </button>
                    <button className="px-6 py-3 rounded-full font-medium text-white" style={{ backgroundColor: '#00B894' }}>
                      View Science
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-48 h-80 rounded-3xl p-3 shadow-lg" style={{ backgroundColor: 'white', border: '1px solid #6C5CE7' }}>
                    <div className="w-full h-12 rounded-t-2xl flex items-center justify-center" style={{ backgroundColor: '#6C5CE7' }}>
                      <span className="text-white text-sm font-medium">Your Cycle</span>
                    </div>
                    <div className="p-4 text-center">
                      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: '#00B894' }}>
                        <span className="text-xl font-bold text-white">28</span>
                      </div>
                      <p className="text-xs mb-4" style={{ color: '#636e72' }}>Fertile window</p>
                      <div className="grid grid-cols-7 gap-1">
                        {[...Array(28)].map((_, i) => (
                          <div key={i} className="w-3 h-3 rounded-full" style={{ 
                            backgroundColor: i < 5 ? '#FF7675' : i >= 12 && i < 16 ? '#00B894' : '#F0F0F0'
                          }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Palette 5: Eve-Inspired */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">Palette 5</span>
            <h3 className="text-2xl font-bold text-gray-800">Inspired by Eve</h3>
            <span className="text-gray-500 text-sm">Warm sunset tones, community-focused, playful</span>
          </div>
          <div className="flex gap-2 mb-4">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#FFF8F3' }} title="#FFF8F3"></div>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#D4848C' }} title="#D4848C"></div>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#F9C784' }} title="#F9C784"></div>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#9C89B8' }} title="#9C89B8"></div>
            <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: '#3A3A3A' }} title="#3A3A3A"></div>
          </div>
          
          <div className="rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: '#FFF8F3' }}>
            <div className="p-8 md:p-12">
              <nav className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D4848C' }}>
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <span className="font-semibold" style={{ color: '#3A3A3A' }}>Sync365</span>
                </div>
                <div className="hidden md:flex items-center gap-6">
                  <a href="#" className="text-sm" style={{ color: '#3A3A3A' }}>Features</a>
                  <a href="#" className="text-sm" style={{ color: '#3A3A3A' }}>About</a>
                  <a href="#" className="text-sm" style={{ color: '#3A3A3A' }}>Pricing</a>
                  <button className="px-4 py-2 rounded-full text-sm text-white" style={{ backgroundColor: '#D4848C' }}>Get Started</button>
                </div>
              </nav>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3A3A3A' }}>
                    Embrace your power, every day
                  </h1>
                  <p className="mb-6" style={{ color: '#5A5A5A' }}>
                    Warm, empowering cycle tracking that celebrates every phase of your journey.
                  </p>
                  <div className="flex gap-3">
                    <button className="px-6 py-3 rounded-full text-white font-medium" style={{ backgroundColor: '#D4848C' }}>
                      Start Free
                    </button>
                    <button className="px-6 py-3 rounded-full font-medium" style={{ backgroundColor: '#F9C784', color: '#3A3A3A' }}>
                      Watch Demo
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-48 h-80 rounded-3xl p-3 shadow-lg" style={{ backgroundColor: 'white', border: '1px solid #D4848C' }}>
                    <div className="w-full h-12 rounded-t-2xl flex items-center justify-center" style={{ backgroundColor: '#D4848C' }}>
                      <span className="text-white text-sm font-medium">Your Cycle</span>
                    </div>
                    <div className="p-4 text-center">
                      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: '#9C89B8' }}>
                        <span className="text-xl font-bold text-white">28</span>
                      </div>
                      <p className="text-xs mb-4" style={{ color: '#5A5A5A' }}>Luteal phase</p>
                      <div className="grid grid-cols-7 gap-1">
                        {[...Array(28)].map((_, i) => (
                          <div key={i} className="w-3 h-3 rounded-full" style={{ 
                            backgroundColor: i < 5 ? '#D4848C' : i >= 12 && i < 16 ? '#F9C784' : i >= 20 ? '#9C89B8' : '#F5F5F5'
                          }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary comparison */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Quick Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4">Palette</th>
                  <th className="py-3 px-4">Primary</th>
                  <th className="py-3 px-4">Vibe</th>
                  <th className="py-3 px-4">Best For</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Soft Blush</td>
                  <td className="py-3 px-4"><span className="inline-block w-6 h-6 rounded-full" style={{ backgroundColor: '#E8A0BF' }}></span></td>
                  <td className="py-3 px-4">Elegant, Feminine</td>
                  <td className="py-3 px-4">Premium, luxury feel</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Modern Coral</td>
                  <td className="py-3 px-4"><span className="inline-block w-6 h-6 rounded-full" style={{ backgroundColor: '#FF8A8A' }}></span></td>
                  <td className="py-3 px-4">Fresh, Friendly</td>
                  <td className="py-3 px-4">Younger audience, approachable</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Serene Sage</td>
                  <td className="py-3 px-4"><span className="inline-block w-6 h-6 rounded-full" style={{ backgroundColor: '#8DB596' }}></span></td>
                  <td className="py-3 px-4">Calm, Natural</td>
                  <td className="py-3 px-4">Wellness-focused, holistic</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Modern Purple</td>
                  <td className="py-3 px-4"><span className="inline-block w-6 h-6 rounded-full" style={{ backgroundColor: '#6C5CE7' }}></span></td>
                  <td className="py-3 px-4">Bold, Inclusive</td>
                  <td className="py-3 px-4">Tech-forward, all genders</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Sunset Bloom</td>
                  <td className="py-3 px-4"><span className="inline-block w-6 h-6 rounded-full" style={{ backgroundColor: '#D4848C' }}></span></td>
                  <td className="py-3 px-4">Warm, Empowering</td>
                  <td className="py-3 px-4">Sophisticated, mature audience</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SamplePages;
