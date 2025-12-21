import { prisma } from '../src/lib/prisma'

// Test script om checkout functionaliteit te testen voor gebruikers met actieve trial
async function testCheckoutTrialUser() {
  try {
    console.log('Testing checkout functionality for user with active trial...')

    // Zoek een gebruiker met actieve trial
    let userWithTrial = await prisma.user.findFirst({
      where: {
        isTrialActive: true,
        trialEndsAt: {
          gt: new Date() // Trial eindigt in de toekomst
        }
      },
      select: {
        id: true,
        email: true,
        tier: true,
        isTrialActive: true,
        trialEndsAt: true
      }
    })

    if (!userWithTrial) {
      console.log('No user with active trial found. Creating test user...')

      // Maak een test gebruiker met actieve trial
      const testUser = await prisma.user.create({
        data: {
          id: 'test-trial-user-' + Date.now(),
          email: 'test-trial@example.com',
          name: 'Test Trial User',
          tier: 'FREE',
          isTrialActive: true,
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dagen in de toekomst
        }
      })

      console.log('Created test user:', testUser)
      userWithTrial = testUser
    }

    console.log('Found user with active trial:', {
      id: userWithTrial.id,
      email: userWithTrial.email,
      tier: userWithTrial.tier,
      isTrialActive: userWithTrial.isTrialActive,
      trialEndsAt: userWithTrial.trialEndsAt
    })

    // Simuleer de checkout API call
    const response = await fetch('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // We zouden normaal gesproken een auth token nodig hebben, maar voor deze test skippen we dat
      },
      body: JSON.stringify({
        priceId: 'premium',
      }),
    })

    const result = await response.json()
    console.log('Checkout API response:', result)

  } catch (error) {
    console.error('Error testing checkout:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCheckoutTrialUser()
