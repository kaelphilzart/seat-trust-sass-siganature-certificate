import Hero from '@/features/home/no-auth/Hero'
import Newsletter from '@/features/home/no-auth/Newsletter'
import Solutions from '@/features/home/no-auth/Solution/page'
import HowItWorks from '@/features/home/no-auth/HowItWork/page'
import Product from '@/features/home/no-auth/product/page'
import Pricing from '@/features/home/no-auth/pricing/page'

export default function page() {
  return (
    <main>
      <Hero />
      <Solutions/>
      <HowItWorks/>
      <Product/>
      <Pricing/>
      <Newsletter />
    </main>
  )
}
