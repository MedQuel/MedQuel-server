import React from 'react';
import HomeScreen from './home';
import FeatureHighlightsCard from '../components/FeatureHighlightsCard';
import ContestCard from '../components/ContestCard';  
import ActiveContestsSection from '../components/ActiveContestCard';
import TabContainer from '../components/TabContainer';

export default function MainLayout() {
  const activeContestsData = [
    {
      difficulty: 'Hard',
      isLive: true,
      title: 'Cardiology Sprint',
      subject: 'Cardiology',
      participantsCount: '1.2K',
      epReward: '200',
      onPress: () => console.log('Cardiology Sprint pressed'),
    },
    {
    difficulty: 'Medium',
    isLive: true,
    title: 'Neuroanatomy Challenge',
    subject: 'Neurology',
    participantsCount: '2.4K',
    epReward: '150',
    onPress: () => console.log('Neuroanatomy Challenge pressed'),
  },
  {
    difficulty: 'Easy',
    isLive: false,
    title: 'Surgical Instruments 101',
    subject: 'General Surgery',
    participantsCount: '512',
    epReward: '50',
    onPress: () => console.log('Surgical Instruments pressed'),
  },
  {
    difficulty: 'Hard',
    isLive: true,
    title: 'ECG Interpretation Master',
    subject: 'Cardiology',
    participantsCount: '3.1K',
    epReward: '300',
    onPress: () => console.log('ECG Master pressed'),
  },
  {
    difficulty: 'Medium',
    isLive: false,
    title: 'Antibiotic Mechanisms',
    subject: 'Pharmacology',
    participantsCount: '924',
    epReward: '100',
    onPress: () => console.log('Antibiotic Mechanisms pressed'),
  },
  {
    difficulty: 'Hard',
    isLive: false,
    title: 'Acid-Base Disorders',
    subject: 'Nephrology',
    participantsCount: '415',
    epReward: '250',
    onPress: () => console.log('Acid-Base pressed'),
  },
  {
    difficulty: 'Easy',
    isLive: true,
    title: 'Pediatric Milestones',
    subject: 'Pediatrics',
    participantsCount: '1.8K',
    epReward: '75',
    onPress: () => console.log('Pediatric Milestones pressed'),
  },
    {
      difficulty: 'Medium',
      isLive: false,
      title: 'Pharma Basics',
      subject: 'Pharmacology',
      participantsCount: '843',
      epReward: '120',
      onPress: () => console.log('Pharma Basics pressed'),
    }
  ];

  return (
    <>
      <TabContainer />
      <HomeScreen />
      <FeatureHighlightsCard />
      <ContestCard contestData={{ 
        category: 'Anatomy',
        difficulty: 'Medium',
        title: 'Daily Anatomy Quiz',
        timeLeft: '8h left',
        questionsCount: 20,
        duration: '30m',
        participantsCount: 847,
        epReward: '+75',
        onStartPress: () => console.log('Starting!'), }} />
      <ActiveContestsSection activeContests={activeContestsData} />
    </>
  );
}