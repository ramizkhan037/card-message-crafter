
import { useState } from 'react';
import MessageCardsContainer from '@/components/MessageCardsContainer';

const Index = () => {
  return (
    <div className="min-h-screen bg-cream">
      <main className="container pb-12">
          <MessageCardsContainer />
      </main>
    </div>
  );
};

export default Index;
