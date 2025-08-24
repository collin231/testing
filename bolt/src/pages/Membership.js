import React from 'react';
import AnimatedPricing from '../components/AnimatedPricing';

const Membership = () => {
  const membershipPlans = [
    {
      planName: 'Basic Member',
      description: 'Perfect for individuals starting their journey with ANAMOLA',
      monthlyPrice: '50',
      yearlyPrice: '500',
      features: [
        'Official ANAMOLA membership card',
        'Access to member-only events',
        'Monthly newsletter',
        'Voting rights in local decisions',
        'Community engagement opportunities'
      ],
      buttonText: 'Join Now',
      buttonVariant: 'secondary'
    },
    {
      planName: 'Active Member',
      description: 'Most popular choice for committed members',
      monthlyPrice: '120',
      yearlyPrice: '1,200',
      features: [
        'All Basic Member benefits',
        'Priority access to leadership events',
        'Direct communication with party leaders',
        'Participation in policy discussions',
        'Training and development programs',
        'Regional conference invitations'
      ],
      buttonText: 'Join Now',
      isPopular: true,
      buttonVariant: 'primary'
    },
    {
      planName: 'Premium Member',
      description: 'For leaders and influencers in the movement',
      monthlyPrice: '250',
      yearlyPrice: '2,500',
      features: [
        'All Active Member benefits',
        'Exclusive VIP events',
        'Direct access to Venâncio Mondlane',
        'Leadership development mentorship',
        'National conference participation',
        'Strategic planning involvement',
        'International partnership opportunities'
      ],
      buttonText: 'Join Now',
      buttonVariant: 'primary'
    }
  ];

  return (
    <AnimatedPricing
      title="Join ANAMOLA Today"
      subtitle="Choose the membership level that best fits your commitment to Mozambique's future. Together, we can build a stronger, more prosperous nation."
      plans={membershipPlans}
      showAnimatedBackground={true}
    />
  );
};

export default Membership;
